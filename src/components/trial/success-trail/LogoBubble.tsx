import logo from "@/assets/engleuphoria-logo.png";

export function LogoBubble({ size = 72 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-full animate-trail-float"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 25%, var(--brand-emerald-glow), var(--brand-emerald) 55%, var(--brand-emerald-deep))",
        boxShadow:
          "0 12px 30px -8px color-mix(in oklch, var(--brand-emerald) 55%, transparent), inset 0 -6px 14px color-mix(in oklch, var(--brand-emerald-deep) 50%, transparent), inset 0 4px 10px color-mix(in oklch, white 30%, transparent)",
      }}
      aria-label="Engleuphoria Success"
    >
      <img
        src={logo}
        alt="Engleuphoria logo"
        className="object-contain drop-shadow"
        style={{ width: size * 0.72, height: size * 0.72 }}
      />
      <span
        aria-hidden
        className="absolute rounded-full bg-white/60"
        style={{ width: size * 0.18, height: size * 0.12, top: size * 0.14, left: size * 0.22, filter: "blur(2px)" }}
      />
    </div>
  );
}
