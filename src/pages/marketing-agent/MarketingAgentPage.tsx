import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquarePlus, Send, Trash2, Wand2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Thread = { id: string; title: string; updated_at: string };
type Message = { id: string; role: "user" | "assistant" | "system"; content: string; created_at: string };

const SUGGESTED = [
  "Write 3 Meta ad variants for Academy (adults, B2 English) — angle: career growth.",
  "Draft a 5-email onboarding drip for new Playground parents.",
  "Give me 10 SEO keyword clusters for 'business English course' with intent + content angle.",
  "Design an A/B test for the pricing page hero CTA.",
];

export default function MarketingAgentPage() {
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = useMemo(() => threads.find((t) => t.id === threadId), [threads, threadId]);

  const loadThreads = async () => {
    const { data } = await supabase
      .from("marketing_agent_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    setThreads((data as Thread[]) ?? []);
  };

  const loadMessages = async (id: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("marketing_agent_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", id)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
    setLoadingMsgs(false);
  };

  useEffect(() => { loadThreads(); }, []);
  useEffect(() => {
    if (threadId) loadMessages(threadId);
    else setMessages([]);
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  useEffect(() => { textareaRef.current?.focus(); }, [threadId]);

  const newThread = () => {
    navigate("/marketing-agent");
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  const deleteThread = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("marketing_agent_threads").delete().eq("id", id);
    if (id === threadId) navigate("/marketing-agent");
    loadThreads();
  };

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setSending(true);
    setInput("");
    // Optimistic user bubble
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const { data, error } = await supabase.functions.invoke("marketing-agent-chat", {
        body: { threadId, message },
      });
      if (error) throw error;
      const newThreadId = data?.threadId as string;
      if (newThreadId && newThreadId !== threadId) {
        await loadThreads();
        navigate(`/marketing-agent/${newThreadId}`, { replace: true });
      } else {
        await loadMessages(threadId!);
        await loadThreads();
      }
    } catch (e: any) {
      toast({
        title: "Agent error",
        description: e?.message ?? "Something went wrong.",
        variant: "destructive",
      });
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-indigo-50/50 via-background to-background dark:from-indigo-950/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-background/60 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">Marketing Agent</div>
              <div className="text-xs text-muted-foreground">Engleuphoria growth</div>
            </div>
          </div>
        </div>
        <div className="px-3 space-y-2">
          <Button size="sm" className="w-full justify-start gap-2" onClick={newThread}>
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </Button>
          <NavLink
            to="/marketing-agent/automations"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                isActive ? "bg-muted font-medium" : "hover:bg-muted/60 text-muted-foreground"
              }`
            }
          >
            <Zap className="h-4 w-4" /> Automations
          </NavLink>
        </div>
        <Separator className="my-3" />
        <div className="px-3 text-xs uppercase tracking-wide text-muted-foreground mb-1">Conversations</div>
        <ScrollArea className="flex-1 px-2 pb-4">
          <div className="space-y-1">
            {threads.map((t) => (
              <div key={t.id} className="group flex items-center gap-1">
                <NavLink
                  to={`/marketing-agent/${t.id}`}
                  className={({ isActive }) =>
                    `flex-1 truncate px-3 py-2 rounded-md text-sm transition ${
                      isActive ? "bg-muted font-medium" : "hover:bg-muted/60"
                    }`
                  }
                >
                  {t.title || "Untitled"}
                </NavLink>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {threads.length === 0 && (
              <div className="text-xs text-muted-foreground px-3 py-4">No conversations yet.</div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-6 bg-background/60 backdrop-blur">
          <div className="flex-1 truncate">
            <div className="text-sm font-semibold truncate">
              {activeThread?.title ?? "New conversation"}
            </div>
            <div className="text-xs text-muted-foreground">
              Senior CMO · SEO · Ads · Copy · CRO · Launches
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && !loadingMsgs && (
              <div className="text-center py-12 space-y-6">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Wand2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">How can I grow Engleuphoria today?</h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Ask for ad copy, SEO plans, email sequences, funnel audits, pricing tests, launch plans, and more.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm px-4 py-3 rounded-xl border bg-background/60 hover:bg-muted/60 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                  <Wand2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Strategizing...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-background/70 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <Card className="p-2 flex items-end gap-2 shadow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Ask for ad copy, SEO plans, emails, funnel audits..."
                className="min-h-[56px] max-h-40 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent"
                disabled={sending}
              />
              <Button
                size="icon"
                onClick={() => send()}
                disabled={!input.trim() || sending}
                className="shrink-0"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </Card>
            <div className="text-[11px] text-muted-foreground text-center mt-2">
              The agent uses the installed marketing & ads skills. Review outputs before publishing.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
        <Wand2 className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-pre:my-2">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
