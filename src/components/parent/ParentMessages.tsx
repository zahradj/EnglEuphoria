import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ParentMessagesProps {
  parentId: string;
  students: any[];
}

export function ParentMessages({ parentId, students }: ParentMessagesProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["parent-messages", parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_teacher_messages")
        .select(`
          *,
          teacher:users!parent_teacher_messages_teacher_id_fkey(full_name),
          student:users!parent_teacher_messages_student_id_fkey(full_name)
        `)
        .eq("parent_id", parentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { teacherId: string; studentId: string; subject: string; message: string }) => {
      const { error } = await supabase.from("parent_teacher_messages").insert({
        parent_id: parentId,
        teacher_id: data.teacherId,
        student_id: data.studentId,
        subject: data.subject,
        message: data.message,
        sender_type: "parent",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-messages"] });
      setNewSubject("");
      setNewMessage("");
      setSelectedStudentId("");
      setShowCompose(false);
      toast({
        title: t('pd.messages.toast.sent.title'),
        description: t('pd.messages.toast.sent.body'),
      });
    },
    onError: (error) => {
      toast({
        title: t('pd.messages.toast.error.title'),
        description: t('pd.messages.toast.error.body'),
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    },
  });

  const handleSendMessage = async () => {
    if (!selectedStudentId || !newSubject || !newMessage) {
      toast({
        title: t('pd.messages.toast.missing.title'),
        description: t('pd.messages.toast.missing.body'),
        variant: "destructive",
      });
      return;
    }

    // Get teacher for selected student (from recent lessons)
    const { data: recentLesson } = await supabase
      .from("lessons")
      .select("teacher_id")
      .eq("student_id", selectedStudentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!recentLesson?.teacher_id) {
      toast({
        title: t('pd.messages.toast.noTeacher.title'),
        description: t('pd.messages.toast.noTeacher.body'),
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      teacherId: recentLesson.teacher_id,
      studentId: selectedStudentId,
      subject: newSubject,
      message: newMessage,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('pd.messages.title')}</h3>
          <Button onClick={() => setShowCompose(!showCompose)}>
            <MessageSquare className="h-4 w-4 me-2" />
            {t('pd.messages.new')}
          </Button>
        </div>

        {showCompose && (
          <Card className="p-4 mb-4 bg-muted/50">
            <h4 className="font-semibold mb-4">{t('pd.messages.compose')}</h4>
            <div className="space-y-4">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pd.messages.selectStudent')} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.student_id} value={s.student_id}>
                      {s.student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder={t('pd.messages.subject')}
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />

              <Textarea
                placeholder={t('pd.messages.placeholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={5}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4 me-2" />
                  {sendMessageMutation.isPending ? t('pd.messages.sending') : t('pd.messages.send')}
                </Button>
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  {t('pd.messages.cancel')}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </Card>
      ) : !messages || messages.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('pd.messages.empty.title')}</h3>
          <p className="text-muted-foreground">
            {t('pd.messages.empty.body')}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">{message.subject}</h4>
                  <p className="text-sm text-muted-foreground">
                    {message.sender_type === "parent" ? t('pd.messages.to') : t('pd.messages.from')}: {message.teacher?.full_name}
                    {" • "}
                    {t('pd.messages.regarding')}: {message.student?.full_name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={message.sender_type === "parent" ? "secondary" : "default"}>
                    {message.sender_type === "parent" ? t('pd.messages.sent') : t('pd.messages.received')}
                  </Badge>
                  {!message.is_read && message.sender_type === "teacher" && (
                    <Badge variant="destructive">{t('pd.messages.new_badge')}</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm mb-4">{message.message}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(message.created_at), "PPP 'at' p")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
