/**
 * Certificate color palette — hub base colors + CEFR-level shade steps.
 *
 * Each hub owns a hue. CEFR level indexes into a shade scale so beginner
 * levels feel light/warm and advanced levels feel deep/saturated, giving
 * students a clear visual sense of progression.
 */

export type HubKey = "playground" | "academy" | "success";
export type CefrLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1";

export const CEFR_LEVELS: CefrLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1"];

// [primary, accent, text] shade ladder — light → deep for each hub.
export const HUB_LEVEL_PALETTE: Record<HubKey, Record<CefrLevel, { primary: string; accent: string; text: string }>> = {
  playground: {
    "Pre-A1": { primary: "#FFB874", accent: "#FFF7E6", text: "#7A3B0E" },
    "A1":     { primary: "#FE9A4A", accent: "#FFEDD5", text: "#7A2E00" },
    "A2":     { primary: "#FE6A2F", accent: "#FEE3D0", text: "#6B1F00" },
    "B1":     { primary: "#E5501B", accent: "#FDD3B8", text: "#5C1900" },
    "B2":     { primary: "#C2410C", accent: "#FCC4A1", text: "#4A1200" },
    "C1":     { primary: "#9A3412", accent: "#FBB78F", text: "#3B0D00" },
  },
  academy: {
    "Pre-A1": { primary: "#C4B5FD", accent: "#F5F3FF", text: "#3B1D8C" },
    "A1":     { primary: "#A78BFA", accent: "#EDE9FE", text: "#3A177E" },
    "A2":     { primary: "#8B5CF6", accent: "#E9D5FF", text: "#341275" },
    "B1":     { primary: "#7C3AED", accent: "#DDD0FA", text: "#2D0F6B" },
    "B2":     { primary: "#6B21A8", accent: "#D0BEF5", text: "#260A5C" },
    "C1":     { primary: "#4C1D95", accent: "#C0AEEF", text: "#1F084C" },
  },
  success: {
    "Pre-A1": { primary: "#6EE7B7", accent: "#ECFDF5", text: "#065F46" },
    "A1":     { primary: "#34D399", accent: "#D1FAE5", text: "#064E3B" },
    "A2":     { primary: "#10B981", accent: "#BBF7D0", text: "#064E3B" },
    "B1":     { primary: "#059669", accent: "#A7F3D0", text: "#064E3B" },
    "B2":     { primary: "#047857", accent: "#8FE9C0", text: "#053E2E" },
    "C1":     { primary: "#065F46", accent: "#7ADCB0", text: "#043024" },
  },
};

export const HUB_LABEL: Record<HubKey, string> = {
  playground: "Playground",
  academy: "Academy",
  success: "Success",
};

export function paletteFor(hub: string, cefr?: string | null) {
  const h = (HUB_LEVEL_PALETTE[hub as HubKey] ? hub : "academy") as HubKey;
  const level = (cefr && (CEFR_LEVELS as string[]).includes(cefr) ? cefr : "A2") as CefrLevel;
  return HUB_LEVEL_PALETTE[h][level];
}
