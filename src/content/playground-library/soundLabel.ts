/** A blending sound can be written "spelling=sound" when the letters say another sound (A1 U5L4: "y=ee" in happy,
 *  "pp=p"): the card shows the spelling, playLetterPhonic plays the recorded sound after "=". Pure (no audio), so the
 *  display never depends on the audio module. */
export const soundLabel = (snd: string) => snd.split('=')[0];
export const soundKey = (snd: string) => (snd.includes('=') ? snd.split('=')[1] : snd);
