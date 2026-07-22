import logo from "@/assets/engleuphoria-logo.png";

export function LogoBubble({ size = 72 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-full animate-float"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 25%, var(--brand-purple-glow), var(--brand-purple) 55%, var(--brand-purple-deep))",
        boxShadow:
          "0 12px 30px -8px color-mix(in oklch, var(--brand-purple) 55%, transparent), inset 0 -6px 14px color-mix(in oklch, var(--brand-purple-deep) 50%, transparent), inset 0 4px 10px color-mix(in oklch, white 30%, transparent)",
      }}
      aria-label="Engleuphoria Academy"
    >
      <img
        src={logo}
        alt="Engleuphoria logo"
        className="object-contain"
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
      <span
        className="absolute rounded-full bg-white/60"
        style={{ width: size * 0.18, height: size * 0.12, top: size * 0.14, left: size * 0.22, filter: "blur(2px)" }}
      />
    </div>
  );
}
