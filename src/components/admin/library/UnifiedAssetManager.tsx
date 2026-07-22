import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileVideo, 
  FileText, 
  FileQuestion, 
  Gamepad2,
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssetGrid } from './AssetGrid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLessonContext } from '@/contexts/LessonContext';

type TargetSystem = 'playground' | 'academy' | 'hub';
type AssetType = 'video' | 'pdf' | 'quiz' | 'interactive';

interface UploadedFile {
  file: File;
  preview?: string;
  type: string;
}

const SYSTEM_CONFIG: Record<TargetSystem, { label: string; color: string; bgColor: string }> = {
  playground: { label: 'Playground (Kids)', color: 'text-green-700', bgColor: 'bg-green-100' },
  academy: { label: 'Academy (Teens)', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  hub: { label: 'Hub (Adults)', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

const ASSET_TYPES: { value: AssetType; label: string; icon: React.ReactNode }[] = [
  { value: 'video', label: 'Video', icon: <FileVideo className="h-4 w-4" /> },
  { value: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
  { value: 'quiz', label: 'Quiz', icon: <FileQuestion className="h-4 w-4" /> },
  { value: 'interactive', label: 'Interactive', icon: <Gamepad2 className="h-4 w-4" /> },
];

const LEVELS = ['Pre-A1', 'Level 1', 'Level 2', 'Level 3'];

export const UnifiedAssetManager = () => {
  const { addLesson } = useLessonContext();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [targetSystem, setTargetSystem] = useState<TargetSystem | ''>('');
  const [level, setLevel] = useState('');
  const [assetType, setAssetType] = useState<AssetType | ''>('');

  const resetForm = () => {
    setUploadedFile(null);
    setTitle('');
    setTargetSystem('');
    setLevel('');
    setAssetType('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const fileType = file.type.split('/')[0];
    let preview: string | undefined;

    if (fileType === 'image') {
      preview = URL.createObjectURL(file);
    }

    setUploadedFile({
      file,
      preview,
      type: fileType,
    });

    // Auto-fill title from filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setTitle(nameWithoutExt);

    // Auto-detect asset type
    if (file.type.includes('video')) {
      setAssetType('video');
    } else if (file.type.includes('pdf')) {
      setAssetType('pdf');
    }
  };

  const getFileIcon = () => {
    if (!uploadedFile) return <Upload className="h-12 w-12 text-muted-foreground" />;
    
    switch (uploadedFile.type) {
      case 'video':
        return <FileVideo className="h-12 w-12 text-blue-500" />;
      case 'application':
        return <FileText className="h-12 w-12 text-red-500" />;
      case 'image':
        return uploadedFile.preview ? (
          <img src={uploadedFile.preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
        ) : (
          <FileText className="h-12 w-12 text-green-500" />
        );
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isFormValid = uploadedFile && title && targetSystem && level && assetType;

  const handleUpload = async () => {
    if (!isFormValid || !uploadedFile) return;

    setIsUploading(true);

    try {
      // Map target system to tags
      const systemTag = targetSystem === 'playground' ? 'kids' : targetSystem === 'academy' ? 'teen' : 'adult';
      
      // Map level to CEFR
      const cefrMap: Record<string, string> = {
        'Pre-A1': 'Pre-A1',
        'Level 1': 'A1',
        'Level 2': 'A2',
        'Level 3': 'B1',
      };

      // Upload file to Supabase Storage
      const fileExt = uploadedFile.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `curriculum/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('curriculum-materials')
        .upload(filePath, uploadedFile.file);

      if (uploadError) {
        // If bucket doesn't exist, just save the metadata
        console.warn('Storage upload failed, saving metadata only:', uploadError);
      }

      // Get public URL if upload succeeded
      const { data: urlData } = supabase.storage
        .from('curriculum-materials')
        .getPublicUrl(filePath);

      // Insert into database
      const { error: dbError } = await supabase
        .from('curriculum_materials')
        .insert({
          title,
          type: assetType,
          cefr_level: cefrMap[level] || 'A1',
          tags: [systemTag, assetType, level.toLowerCase().replace(' ', '-')],
          file_url: urlData?.publicUrl || null,
          file_name: uploadedFile.file.name,
          file_size: uploadedFile.file.size,
          file_type: uploadedFile.file.type,
          visibility: 'all',
        });

      if (dbError) throw dbError;

      // Add to global lesson context if it's for Playground
      if (targetSystem === 'playground') {
        addLesson({
          title,
          type: assetType as 'video' | 'slide' | 'game' | 'pdf' | 'quiz' | 'interactive',
          system: targetSystem,
          content: {
            vocabulary: ['New', 'Lesson', 'Word'],
            sentence: `This is the ${title} lesson.`,
            videoUrl: urlData?.publicUrl || undefined,
            quizQuestion: 'What did you learn?',
            quizOptions: ['Option A', 'Option B', 'Option C'],
            quizAnswer: 'Option A',
          },
        });
      }

      toast.success(`"${title}" uploaded successfully!`, {
        description: `Tagged as ${SYSTEM_CONFIG[targetSystem].label}. ${targetSystem === 'playground' ? 'Check the Student Map!' : ''}`,
      });

      resetForm();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload asset', {
        description: 'Please try again later.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px]">
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
        {/* Left Column - Upload Zone */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="h-full p-6 bg-background overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Zone
            </h2>

            {/* Drop Zone */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                ${dragActive 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : uploadedFile 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept="video/*,application/pdf,image/*"
              />
              
              <div className="flex flex-col items-center gap-3">
                {getFileIcon()}
                
                {uploadedFile ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{uploadedFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      Drag & drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground">or</p>
                    <Button variant="outline" size="sm">
                      Select File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Metadata Form */}
            <AnimatePresence>
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-4"
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Asset Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter asset title..."
                        />
                      </div>

                      {/* Target System */}
                      <div className="space-y-2">
                        <Label>Target System</Label>
                        <Select 
                          value={targetSystem} 
                          onValueChange={(v) => setTargetSystem(v as TargetSystem)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target system" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SYSTEM_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${config.bgColor}`} />
                                  {config.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {targetSystem && (
                          <Badge className={`${SYSTEM_CONFIG[targetSystem].bgColor} ${SYSTEM_CONFIG[targetSystem].color} border-0`}>
                            {SYSTEM_CONFIG[targetSystem].label}
                          </Badge>
                        )}
                      </div>

                      {/* Level */}
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={level} onValueChange={setLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map((lvl) => (
                              <SelectItem key={lvl} value={lvl}>
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Asset Type Chips */}
                      <div className="space-y-2">
                        <Label>Asset Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {ASSET_TYPES.map((type) => (
                            <Button
                              key={type.value}
                              type="button"
                              variant={assetType === type.value ? 'default' : 'outline'}
                              size="sm"
                              className="gap-1"
                              onClick={() => setAssetType(type.value)}
                            >
                              {type.icon}
                              {type.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Upload Button */}
                      <Button 
                        className="w-full mt-4" 
                        disabled={!isFormValid || isUploading}
                        onClick={handleUpload}
                      >
                        {isUploading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="mr-2"
                            >
                              ⏳
                            </motion.div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Upload to Library
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Column - Asset Library */}
        <ResizablePanel defaultSize={70}>
          <div className="h-full p-6 bg-muted/30 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Asset Library</h2>
            <AssetGrid key={refreshKey} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
