import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, RefreshCw, Search, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  sent: { icon: CheckCircle, color: "text-green-600", label: "Sent" },
  failed: { icon: XCircle, color: "text-red-600", label: "Failed" },
  pending: { icon: Clock, color: "text-amber-600", label: "Pending" },
  bounced: { icon: AlertTriangle, color: "text-orange-600", label: "Bounced" },
};

export function SystemEmailLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: emails, isLoading, refetch } = useQuery({
    queryKey: ["system-emails", statusFilter, typeFilter],
    queryFn: async () => {
      let query = (supabase as any)
        .from("system_emails")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("delivery_status", statusFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("email_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const filteredEmails = (emails || []).filter(
    (email: any) =>
      email.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResend = async (email: any) => {
    try {
      // Determine template from email_type
      let templateName = "";
      switch (email.email_type) {
        case "interview_invite":
          templateName = "interview-invitation";
          break;
        case "teacher_approval":
          templateName = "final-welcome";
          break;
        case "teacher_rejection":
          templateName = "application-rejected";
          break;
        default:
          templateName = email.metadata?.templateName || email.email_type;
      }

      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName,
          recipientEmail: email.recipient_email,
          idempotencyKey: `resend-${email.id}-${Date.now()}`,
          templateData: email.metadata?.templateData || { name: email.recipient_name },
        },
      });

      if (error) throw error;
      toast.success(`Email resent to ${email.recipient_email}`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to resend: ${err.message}`);
    }
  };

  const emailTypes = [...new Set((emails || []).map((e: any) => e.email_type))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-primary" />
          System Email Log
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {emailTypes.map((t: string) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading emails...</div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No emails found</div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredEmails.map((email: any) => {
              const config = STATUS_CONFIG[email.delivery_status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIcon className={`h-5 w-5 shrink-0 ${config.color}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {email.recipient_name || email.recipient_email}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {email.email_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {email.subject || "No subject"} → {email.recipient_email}
                      </div>
                      {email.error_message && (
                        <div className="text-xs text-red-500 truncate mt-0.5">
                          ⚠️ {email.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(email.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {email.delivery_status === "failed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResend(email)}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
