import { useSearchParams } from "react-router-dom";
import type { Hub } from "@/governance/types";
import { CastChatPanel } from "@/components/cast-chat/CastChatPanel";

export default function CastChatQuest() {
  const [params] = useSearchParams();
  const hub = ((params.get("hub") as Hub) || "playground") as Hub;
  const topic = params.get("topic") || "";
  return <CastChatPanel hub={hub} topic={topic || undefined} />;
}
