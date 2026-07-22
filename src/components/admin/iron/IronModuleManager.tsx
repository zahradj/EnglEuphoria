import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Boxes, Plus, ArrowLeft } from 'lucide-react';
import { useIronModules, useCreateIronModule, IronModule } from '@/hooks/useIronLessons';

const COHORT_CONFIG = {
  A: { name: 'Foundation', color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800' },
  B: { name: 'Bridge', color: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800' },
  C: { name: 'Mastery', color: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800' },
};

interface IronModuleManagerProps {
  onBack?: () => void;
}

export const IronModuleManager: React.FC<IronModuleManagerProps> = ({ onBack }) => {
  const [selectedCohort, setSelectedCohort] = useState<'A' | 'B' | 'C'>('A');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleNumber, setNewModuleNumber] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  const { data: modules, isLoading } = useIronModules();
  const createModule = useCreateIronModule();

  const modulesByCohort = {
    A: modules?.filter((m) => m.cohort_group === 'A') || [],
    B: modules?.filter((m) => m.cohort_group === 'B') || [],
    C: modules?.filter((m) => m.cohort_group === 'C') || [],
  };

  const handleCreateModule = async () => {
    if (!newModuleName.trim() || !newModuleNumber) return;

    await createModule.mutateAsync({
      module_name: newModuleName,
      module_number: parseInt(newModuleNumber),
      cohort_group: selectedCohort,
      description: newModuleDescription || null,
    });

    setNewModuleName('');
    setNewModuleNumber('');
    setNewModuleDescription('');
    setDialogOpen(false);
  };

  const ModuleCard = ({ module }: { module: IronModule }) => {
    const config = COHORT_CONFIG[module.cohort_group as 'A' | 'B' | 'C'];
    return (
      <Card className={`${config.bgLight} ${config.border} border`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <Badge className={`${config.color} text-white mb-2`}>
                Module {module.module_number}
              </Badge>
              <h3 className="font-semibold text-foreground">{module.module_name}</h3>
              {module.description && (
                <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Boxes className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Module Structure</h1>
              <p className="text-sm text-muted-foreground">Curriculum Organization</p>
            </div>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Cohort Group</Label>
                <Select value={selectedCohort} onValueChange={(v) => setSelectedCohort(v as 'A' | 'B' | 'C')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        Group A: Foundation
                      </div>
                    </SelectItem>
                    <SelectItem value="B">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        Group B: Bridge
                      </div>
                    </SelectItem>
                    <SelectItem value="C">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        Group C: Mastery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Module Number</Label>
                  <Input
                    type="number"
                    value={newModuleNumber}
                    onChange={(e) => setNewModuleNumber(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label>Module Name</Label>
                  <Input
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="e.g., Greetings & Introductions"
                  />
                </div>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Brief description of the module..."
                  rows={3}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateModule}
                disabled={createModule.isPending || !newModuleName.trim() || !newModuleNumber}
              >
                Create Module
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cohort Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['A', 'B', 'C'] as const).map((cohort) => {
          const config = COHORT_CONFIG[cohort];
          const cohortModules = modulesByCohort[cohort];

          return (
            <div key={cohort} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${config.color}`} />
                <h2 className="font-semibold text-lg">
                  Cohort {cohort}: {config.name}
                </h2>
                <Badge variant="secondary">{cohortModules.length} modules</Badge>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <Card className="p-4 text-center text-muted-foreground">
                    Loading...
                  </Card>
                ) : cohortModules.length === 0 ? (
                  <Card className="p-4 text-center text-muted-foreground border-dashed">
                    No modules yet
                  </Card>
                ) : (
                  cohortModules
                    .sort((a, b) => a.module_number - b.module_number)
                    .map((module) => (
                      <ModuleCard key={module.id} module={module} />
                    ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
