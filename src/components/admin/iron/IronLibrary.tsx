import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Library, Search, Lock, Unlock, Eye, Trash2, MoreHorizontal, Pencil, ArrowLeft, Play } from 'lucide-react';
import { useIronLessons, useUpdateIronLesson, useDeleteIronLesson, IronLesson } from '@/hooks/useIronLessons';
import { format } from 'date-fns';

const COHORT_CONFIG = {
  A: { name: 'Foundation', color: 'bg-blue-500', textColor: 'text-blue-600' },
  B: { name: 'Bridge', color: 'bg-amber-500', textColor: 'text-amber-600' },
  C: { name: 'Mastery', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
};

const STATUS_CONFIG = {
  draft: { icon: Pencil, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Draft' },
  locked: { icon: Lock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', label: 'Locked' },
  live: { icon: Play, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', label: 'Live' },
};

interface IronLibraryProps {
  onBack?: () => void;
  onEdit?: (lesson: IronLesson) => void;
}

export const IronLibrary: React.FC<IronLibraryProps> = ({ onBack, onEdit }) => {
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<IronLesson | null>(null);

  const { data: lessons, isLoading } = useIronLessons({
    cohortGroup: cohortFilter !== 'all' ? cohortFilter as 'A' | 'B' | 'C' : undefined,
    status: statusFilter !== 'all' ? statusFilter as 'draft' | 'locked' | 'live' : undefined,
  });

  const updateLesson = useUpdateIronLesson();
  const deleteLesson = useDeleteIronLesson();

  const filteredLessons = lessons?.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (lesson: IronLesson, newStatus: 'draft' | 'locked' | 'live') => {
    await updateLesson.mutateAsync({ id: lesson.id, status: newStatus });
  };

  const handleDelete = async () => {
    if (selectedLesson) {
      await deleteLesson.mutateAsync(selectedLesson.id);
      setDeleteDialogOpen(false);
      setSelectedLesson(null);
    }
  };

  const StatusIcon = ({ status }: { status: 'draft' | 'locked' | 'live' }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
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
              <Library className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Master Library</h1>
              <p className="text-sm text-muted-foreground">All PPP Lessons</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-1">
          {filteredLessons?.length || 0} Lessons
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={cohortFilter} onValueChange={setCohortFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                <SelectItem value="A">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Cohort A
                  </div>
                </SelectItem>
                <SelectItem value="B">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    Cohort B
                  </div>
                </SelectItem>
                <SelectItem value="C">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    Cohort C
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>CEFR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading lessons...
                  </TableCell>
                </TableRow>
              ) : filteredLessons?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No lessons found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLessons?.map((lesson) => {
                  const cohortConfig = COHORT_CONFIG[lesson.cohort_group];
                  const statusConfig = STATUS_CONFIG[lesson.status];

                  return (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={lesson.status} />
                          {lesson.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${cohortConfig.color} text-white`}>
                          {lesson.cohort_group}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lesson.iron_modules?.module_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lesson.cefr_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(lesson.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(lesson)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View / Edit
                            </DropdownMenuItem>
                            {lesson.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(lesson, 'locked')}>
                                <Lock className="h-4 w-4 mr-2" />
                                Lock (Move to Vault)
                              </DropdownMenuItem>
                            )}
                            {lesson.status === 'locked' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(lesson, 'draft')}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Unlock (Back to Draft)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(lesson, 'live')}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Publish (Go Live)
                                </DropdownMenuItem>
                              </>
                            )}
                            {lesson.status === 'live' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(lesson, 'locked')}>
                                <Lock className="h-4 w-4 mr-2" />
                                Unpublish (Lock)
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedLesson?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
