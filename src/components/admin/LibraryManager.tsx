import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, ListOrdered, Library, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartUploader } from './library/SmartUploader';
import { TaggingMatrix, TaggingData } from './library/TaggingMatrix';
import { CurriculumLinker } from './library/CurriculumLinker';
import { AssetGrid } from './library/AssetGrid';
import { UnifiedAssetManager } from './library/UnifiedAssetManager';
import { toast } from 'sonner';

interface FileData {
  file: File;
  type: string;
}

export const LibraryManager = () => {
  const [viewMode, setViewMode] = useState<'unified' | 'wizard'>('unified');
  const [uploadStep, setUploadStep] = useState<'idle' | 'upload' | 'tagging' | 'linking'>('idle');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [taggingData, setTaggingData] = useState<TaggingData | null>(null);

  const handleStartUpload = () => {
    setUploadStep('upload');
  };

  const handleFileSelected = (data: { file: File; type: string }) => {
    setFileData(data);
    setUploadStep('tagging');
  };

  const handleTaggingComplete = (data: TaggingData) => {
    setTaggingData(data);
    setUploadStep('linking');
  };

  const handleUploadComplete = () => {
    toast.success('Asset uploaded successfully!');
    resetUpload();
  };

  const resetUpload = () => {
    setUploadStep('idle');
    setFileData(null);
    setTaggingData(null);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'unified' | 'wizard')}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Library className="h-6 w-6" />
              Content Library
            </h1>
            <p className="text-muted-foreground">
              Upload, tag, and organize your curriculum assets
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="unified" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Split View
            </TabsTrigger>
            <TabsTrigger value="wizard" className="gap-2">
              <ListOrdered className="h-4 w-4" />
              Wizard
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Unified Split-Screen View */}
        <TabsContent value="unified" className="mt-4">
          <UnifiedAssetManager />
        </TabsContent>

        {/* Original Wizard-Based View */}
        <TabsContent value="wizard" className="mt-4">
          <div className="space-y-6">
            {uploadStep === 'idle' && (
              <>
                <Button onClick={handleStartUpload}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Asset
                </Button>
                <AssetGrid />
              </>
            )}

            {uploadStep === 'upload' && (
              <SmartUploader
                onFileSelected={handleFileSelected}
                onCancel={resetUpload}
              />
            )}

            {uploadStep === 'tagging' && (
              <TaggingMatrix
                onTaggingComplete={handleTaggingComplete}
                onBack={() => setUploadStep('upload')}
              />
            )}

            {uploadStep === 'linking' && fileData && taggingData && (
              <CurriculumLinker
                fileData={fileData}
                taggingData={taggingData}
                onComplete={handleUploadComplete}
                onBack={() => setUploadStep('tagging')}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
