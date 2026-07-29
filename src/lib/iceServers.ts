/**
 * Shared WebRTC ICE server config for all classroom video paths.
 *
 * STUN alone fails to connect whenever either peer is behind a
 * restrictive/symmetric NAT (common on corporate/school networks and some
 * mobile carriers) — the TURN relay is what makes those calls work.
 * `engleuphoria-turn` (62.238.55.184) runs coturn with a static long-term
 * credential; that credential is not a real secret since the browser must
 * have it to negotiate ICE, so it's fine to ship in the client bundle.
 */
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: [
      'turn:62.238.55.184:3478?transport=udp',
      'turn:62.238.55.184:3478?transport=tcp',
    ],
    username: 'engleuphoria',
    credential: 'cOuOZBmrL-txHyliB-ZRhHV_X0OnU6L8',
  },
];
