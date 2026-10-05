/** Academy Cast Vault portraits used by the Academy game slides (cut-out art, transparent background). */
const MIA_VAULT_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/f218718d-5e3a-4b36-bebf-181b55e257e0/ai-image-v14-mia-meet-scene-1788879515022.png';

export const AVATAR_ART: Record<string, { label: string; src: string }> = {
  ava: { label: 'Ava', src: '/avatars/academy/ava-v2.webp' },
  theo: { label: 'Theo', src: '/avatars/academy/theo-v2.webp' },
  vee: { label: 'Vee', src: '/avatars/academy/vee-v2.webp' },
  mia: { label: 'Mia', src: MIA_VAULT_URL },
  nova: { label: 'Nova', src: '/mascots/nova-owl-welcome-v2.png' },
};
