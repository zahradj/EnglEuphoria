/**
 * Point a <video> element at a MediaStream whenever the element mounts.
 *
 * Video tiles render their <video> only while the camera is on, so turning
 * the camera off and on mounts a brand-new element. Wiring srcObject in a
 * useEffect keyed on the stream never re-ran for that new element (the
 * stream itself didn't change), leaving the self-view black after a camera
 * toggle. Use as a callback ref: ref={(el) => attachStream(el, stream)}.
 */
export function attachStream(el: HTMLVideoElement | null, stream: MediaStream | null | undefined) {
  if (!el) return;
  if (el.srcObject !== (stream ?? null)) el.srcObject = stream ?? null;
  if (stream) void el.play().catch(() => {});
}
