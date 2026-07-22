import { CSSProperties, memo, useEffect, useState } from "react";

/**
 * SpriteMascot — CSS-animated single-sprite character puppet.
 *
 * Ported from the Little Explorers Phonics prototype ("Option C" rig).
 * Wraps one intact character sprite (transparent PNG, one per mood) with:
 *   - Continuous breathing (torso scale)
 *   - Idle head bob + mood tilt
 *   - Talking loop (mouth bob + faster breath) when isTalking is true
 *   - One-shot wave (whole-sprite sway)
 *   - Blink overlay — the sprite masks a solid eyelid color, clipped to an
 *     eye-band region, so no separate eyelid asset is needed.
 *
 * The sprite is never sliced or clipped, so limbs cannot be cut off.
 */

export type MascotEmotion = "neutral" | "happy" | "sad" | "angry" | "surprised";

type EyeBand = {
  /** Vertical center of the eyes, 0-1 of sprite height. */
  y: number;
  /** Half-height of the eyelid band, 0-1 of sprite height. */
  halfHeight: number;
  /** Horizontal center, 0-1 of sprite width. */
  x?: number;
  /** Half-width, 0-1 of sprite width. */
  halfWidth?: number;
};

export type MascotProfile = {
  /** Map of emotion -> sprite src. Falls back to 'neutral' if a mood is missing. */
  src: Partial<Record<MascotEmotion, string>>;
  /** Eye region for the blink overlay. Tune per character. */
  eyeBand: EyeBand;
  /** Base tilt at rest, deg. */
  restTilt?: number;
  /** Skin/fur tone under the eyelids. */
  eyelidColor?: string;
};

const MOOD_TILT: Record<MascotEmotion, number> = {
  neutral: 0,
  happy: 0,
  sad: -3,
  angry: 2,
  surprised: 0,
};

type Props = {
  profile: MascotProfile;
  emotion?: MascotEmotion;
  isTalking?: boolean;
  waving?: boolean;
  size?: number; // px height
  flip?: boolean;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

function useBlink(active: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!active) return;
    let timer: number;
    const schedule = () => {
      const wait = 2600 + Math.random() * 2800;
      timer = window.setTimeout(() => {
        setClosed(true);
        window.setTimeout(() => {
          setClosed(false);
          schedule();
        }, 140);
      }, wait);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active]);
  return closed;
}

export const SpriteMascot = memo(function SpriteMascot({
  profile,
  emotion = "neutral",
  isTalking = false,
  waving = false,
  size = 320,
  flip = false,
  alt = "",
  className = "",
  style,
}: Props) {
  const closed = useBlink(true);
  const tilt = (profile.restTilt ?? 0) + MOOD_TILT[emotion];
  const eyeX = profile.eyeBand.x ?? 0.5;
  const eyeHW = profile.eyeBand.halfWidth ?? 0.28;
  const eyeY = profile.eyeBand.y;
  const eyeHH = profile.eyeBand.halfHeight;
  const src = profile.src[emotion] ?? profile.src.neutral ?? "";

  return (
    <div
      className={`sprite-mascot ${isTalking ? "is-talking" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `${flip ? "scaleX(-1) " : ""}rotate(${tilt}deg)`,
        transformOrigin: "50% 90%",
        ...style,
      }}
      data-emotion={emotion}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="sprite-mascot__body"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          userSelect: "none",
          animation: isTalking
            ? "sprite-breath 0.9s ease-in-out infinite, sprite-talkbob 0.32s ease-in-out infinite"
            : "sprite-breath 2.4s ease-in-out infinite, sprite-idlebob 4.8s ease-in-out infinite",
          transformOrigin: "50% 95%",
        }}
      />

      {/* Eyelid overlay — uses the sprite itself as a mask so the color only
          appears where character pixels exist, clipped to the eye band. */}
      <div
        aria-hidden
        className="sprite-mascot__lids"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundColor: profile.eyelidColor ?? "#3a2a1e",
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          opacity: closed ? 1 : 0,
          transition: "opacity 60ms linear",
          clipPath: `polygon(
            ${(eyeX - eyeHW) * 100}% ${(eyeY - eyeHH) * 100}%,
            ${(eyeX + eyeHW) * 100}% ${(eyeY - eyeHH) * 100}%,
            ${(eyeX + eyeHW) * 100}% ${(eyeY + eyeHH) * 100}%,
            ${(eyeX - eyeHW) * 100}% ${(eyeY + eyeHH) * 100}%
          )`,
        }}
      />

      {/* One-shot wave — soft whole-sprite sway anchored near the shoulder. */}
      {waving && (
        <div
          aria-hidden
          className="sprite-mascot__wave"
          style={{
            position: "absolute",
            inset: 0,
            animation: "sprite-wave 1.2s ease-in-out",
            transformOrigin: "50% 85%",
          }}
        />
      )}

      <style>{`
        @keyframes sprite-breath {
          0%, 100% { transform: scale(1.0, 1.0); }
          50%      { transform: scale(1.015, 0.985); }
        }
        @keyframes sprite-idlebob {
          0%, 100% { translate: 0 0; }
          50%      { translate: 0 -6px; }
        }
        @keyframes sprite-talkbob {
          0%, 100% { translate: 0 0; }
          50%      { translate: 0 -2px; }
        }
        @keyframes sprite-wave {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(-6deg); }
          50%  { transform: rotate(6deg); }
          80%  { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
});

/** Canonical eye-band presets for the Playground cast, tuned per character. */
export const MASCOT_EYE_BANDS: Record<string, EyeBand> = {
  pip:    { y: 0.34, halfHeight: 0.045, x: 0.5, halfWidth: 0.24 },
  mia:    { y: 0.30, halfHeight: 0.040, x: 0.5, halfWidth: 0.22 },
  bella:  { y: 0.28, halfHeight: 0.045, x: 0.5, halfWidth: 0.24 },
  willow: { y: 0.26, halfHeight: 0.035, x: 0.5, halfWidth: 0.20 },
  leo:    { y: 0.32, halfHeight: 0.050, x: 0.5, halfWidth: 0.26 },
};

/** Character mood-sprite profiles for the cast used in Little Explorers Phonics. */
export const CAST_PROFILES: Record<string, MascotProfile> = {
  pip: {
    src: {
      neutral: "/puppets/pip-neutral-body.png",
      happy: "/puppets/pip-happy-body.png",
      sad: "/puppets/pip-sad-body.png",
      angry: "/puppets/pip-angry-body.png",
    },
    eyeBand: MASCOT_EYE_BANDS.pip,
  },
  bella: {
    src: {
      neutral: "/puppets/bella-neutral-body.png",
      happy: "/puppets/bella-happy-body.png",
      sad: "/puppets/bella-sad-body.png",
      angry: "/puppets/bella-angry-body.png",
    },
    eyeBand: MASCOT_EYE_BANDS.bella,
  },
  mia: {
    src: {
      neutral: "/puppets/mia-neutral-body.png",
      happy: "/puppets/mia-happy-body.png",
      sad: "/puppets/mia-sad-body.png",
      angry: "/puppets/mia-angry-body.png",
    },
    eyeBand: MASCOT_EYE_BANDS.mia,
  },
};
