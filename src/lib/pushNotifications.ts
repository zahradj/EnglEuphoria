/**
 * Push notifications (phone / browser) for signed-in teachers and students.
 * The service worker side is public/push-sw.js, the sender is the send-push edge function, and
 * every in-app notification row becomes a push through a database trigger (see the push_notifications migration).
 */
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? '';

export type PushStatus =
  | 'unconfigured' // no VAPID key set up yet: the feature stays hidden
  | 'unsupported' // this browser can't do push
  | 'needs-install' // iPhone/iPad: push only works once the app is on the Home Screen
  | 'blocked' // the person said no in the browser
  | 'ready' // can be turned on
  | 'on'; // turned on for this device

type Rpc = (fn: string, args?: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
const rpc: Rpc = (fn, args) => (supabase as unknown as { rpc: Rpc }).rpc(fn, args);

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const supportsPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

async function currentSubscription(): Promise<PushSubscription | null> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return (await reg?.pushManager.getSubscription()) ?? null;
  } catch {
    return null;
  }
}

export async function getPushStatus(): Promise<PushStatus> {
  if (typeof window === 'undefined') return 'unsupported';
  if (!VAPID_PUBLIC_KEY) return 'unconfigured';
  if (!supportsPush()) return isIos() && !isStandalone() ? 'needs-install' : 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission === 'granted' && (await currentSubscription())) return 'on';
  return 'ready';
}

async function saveSubscription(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON();
  const { error } = await rpc('save_push_subscription', {
    p_endpoint: sub.endpoint,
    p_p256dh: json.keys?.p256dh ?? '',
    p_auth: json.keys?.auth ?? '',
    p_user_agent: navigator.userAgent,
  });
  if (error) throw new Error(error.message);
}

/** Asks permission, subscribes this device and saves it for the signed-in person. */
export async function enablePush(): Promise<PushStatus> {
  const status = await getPushStatus();
  if (status !== 'ready' && status !== 'on') return status;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'blocked' : 'ready';
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }));
  await saveSubscription(sub);
  return 'on';
}

export async function disablePush(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) return;
  await rpc('remove_push_subscription', { p_endpoint: sub.endpoint });
  await sub.unsubscribe();
}

/** On a shared device: if notifications are already allowed, make sure they belong to whoever is signed in now. */
export async function syncPushOwner(): Promise<void> {
  if ((await getPushStatus()) !== 'on') return;
  const sub = await currentSubscription();
  if (sub) await saveSubscription(sub);
}
