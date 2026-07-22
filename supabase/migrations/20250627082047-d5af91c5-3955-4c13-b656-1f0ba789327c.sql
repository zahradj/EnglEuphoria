
-- Create chat_messages table for real-time messaging
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('teacher', 'student')) NOT NULL,
  room_id TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'file', 'system')) DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classroom_files table for file management
CREATE TABLE public.classroom_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploader_name TEXT NOT NULL,
  uploader_role TEXT CHECK (uploader_role IN ('teacher', 'student')) NOT NULL,
  room_id TEXT NOT NULL,
  category TEXT CHECK (category IN ('lesson_material', 'homework', 'shared_file', 'whiteboard_export')) DEFAULT 'shared_file',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
-- Users can view messages from rooms they have access to (simplified for now)
CREATE POLICY "Users can view chat messages" ON public.chat_messages
  FOR SELECT USING (true);

-- Users can insert their own messages
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

-- RLS Policies for classroom_files
-- Users can view files from rooms they have access to
CREATE POLICY "Users can view classroom files" ON public.classroom_files
  FOR SELECT USING (true);

-- Users can upload their own files
CREATE POLICY "Users can upload files" ON public.classroom_files
  FOR INSERT WITH CHECK (true);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON public.classroom_files
  FOR DELETE USING (uploaded_by = auth.uid());

-- Create storage bucket for classroom files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('classroom-files', 'classroom-files', true);

-- Storage policies for classroom-files bucket
CREATE POLICY "Anyone can view classroom files" ON storage.objects
  FOR SELECT USING (bucket_id = 'classroom-files');

CREATE POLICY "Authenticated users can upload classroom files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'classroom-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own classroom files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'classroom-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own classroom files" ON storage.objects
  FOR DELETE USING (bucket_id = 'classroom-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for chat messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add indexes for better performance
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_classroom_files_room_id ON public.classroom_files(room_id);
CREATE INDEX idx_classroom_files_category ON public.classroom_files(category);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classroom_files_updated_at BEFORE UPDATE ON public.classroom_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
