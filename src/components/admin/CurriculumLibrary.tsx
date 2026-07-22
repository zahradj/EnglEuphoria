import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Library,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  BookOpen,
  Layers,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { LessonPreview } from "./generator/LessonPreview";
import { LessonEditorPage } from "./editor/LessonEditorPage";
import { useLessonCritic } from "@/hooks/useLessonCritic";


interface CurriculumLesson {
  id: string;
  title: string;
  description: string | null;
  target_system: string;
  difficulty_level: string;
  content: any;
  is_published: boolean;
  sequence_order: number | null;
  unit_id: string | null;
  level_id: string | null;
  created_at: string;
  unit?: {
    id: string;
    title: string;
    unit_number: number;
  } | null;
}

interface CurriculumUnit {
  id: string;
  title: string;
  unit_number: number;
}

export const CurriculumLibrary = () => {
  const queryClient = useQueryClient();
  const LS_KEY = "curriculum-library-filters-v1";
  const initial = (() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
  })();
  const [systemFilter, setSystemFilter] = useState<string>(initial.systemFilter ?? "all");
  const [unitFilter, setUnitFilter] = useState<string>(initial.unitFilter ?? "all");
  const [searchQuery, setSearchQuery] = useState(initial.searchQuery ?? "");
  const [criticFilter, setCriticFilter] = useState<string>(initial.criticFilter ?? "all");
  const [sortBy, setSortBy] = useState<string>(initial.sortBy ?? "recent");

  React.useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ systemFilter, unitFilter, searchQuery, criticFilter, sortBy }),
      );
    } catch {}
  }, [systemFilter, unitFilter, searchQuery, criticFilter, sortBy]);



  const [previewLesson, setPreviewLesson] = useState<CurriculumLesson | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bulkUpdatePublish = useMutation({
    mutationFn: async ({ ids, publish }: { ids: string[]; publish: boolean }) => {
      const { error } = await supabase
        .from("curriculum_lessons")
        .update({ is_published: publish })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-library"] });
      toast.success(`${vars.publish ? "Published" : "Unpublished"} ${vars.ids.length} lessons`);
      setSelectedIds(new Set());
    },
    onError: () => toast.error("Bulk update failed"),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("curriculum_lessons").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-library"] });
      toast.success(`Deleted ${ids.length} lessons`);
      setSelectedIds(new Set());
    },
    onError: () => toast.error("Bulk delete failed"),
  });

  const critic = useLessonCritic();
  const [rescoring, setRescoring] = useState<{ done: number; total: number } | null>(null);

  const bulkRescore = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const targets = lessons.filter((l) => ids.includes(l.id));
    setRescoring({ done: 0, total: targets.length });
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < targets.length; i++) {
      const lesson = targets[i];
      try {
        const result = await critic.run(lesson.content as any);
        if (!result) {
          fail++;
        } else {
          const meta = { ...(lesson as any).ai_metadata, critic_verdict: result.verdict, critic_score: result.overall, critic_scored_at: new Date().toISOString() };
          const { error } = await supabase
            .from("curriculum_lessons")
            .update({ ai_metadata: meta })
            .eq("id", lesson.id);
          if (error) fail++; else ok++;
        }
      } catch {
        fail++;
      }
      setRescoring({ done: i + 1, total: targets.length });
    }
    setRescoring(null);
    queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-library"] });
    toast.success(`Rescored ${ok} lessons${fail ? ` · ${fail} failed` : ""}`);
    setSelectedIds(new Set());
  };




  // Fetch lessons with unit info
  const { data: lessons = [], isLoading: isLoadingLessons } = useQuery({
    queryKey: ["curriculum-lessons-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_lessons")
        .select(`
          *,
          unit:curriculum_units(id, title, unit_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Transform unit from array to object (Supabase returns arrays for single relations)
      return (data || []).map((item: any) => ({
        ...item,
        unit: Array.isArray(item.unit) ? item.unit[0] : item.unit,
      })) as CurriculumLesson[];
    },
  });

  // Fetch units for filter
  const { data: units = [] } = useQuery({
    queryKey: ["curriculum-units-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_units")
        .select("id, title, unit_number")
        .order("unit_number", { ascending: true });

      if (error) throw error;
      return data as CurriculumUnit[];
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from("curriculum_lessons")
        .update({ is_published: !isPublished })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-library"] });
      toast.success("Lesson status updated");
    },
    onError: () => {
      toast.error("Failed to update lesson status");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("curriculum_lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-lessons-library"] });
      toast.success("Lesson deleted");
    },
    onError: () => {
      toast.error("Failed to delete lesson");
    },
  });

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSystem = systemFilter === "all" || lesson.target_system === systemFilter;
    const matchesUnit = unitFilter === "all" || lesson.unit_id === unitFilter;
    const matchesSearch =
      !searchQuery ||
      lesson.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const verdict = (lesson as any).ai_metadata?.critic_verdict as string | undefined;
    const matchesCritic =
      criticFilter === "all" ||
      (criticFilter === "unscored" ? !verdict : verdict === criticFilter);

    return matchesSystem && matchesUnit && matchesSearch && matchesCritic;
  }).sort((a, b) => {
    const sa = (a as any).ai_metadata?.critic_score;
    const sb = (b as any).ai_metadata?.critic_score;
    const na = typeof sa === "number" ? sa : null;
    const nb = typeof sb === "number" ? sb : null;
    if (sortBy === "score_asc") {
      if (na === null && nb === null) return 0;
      if (na === null) return 1;
      if (nb === null) return -1;
      return na - nb;
    }
    if (sortBy === "score_desc") {
      if (na === null && nb === null) return 0;
      if (na === null) return 1;
      if (nb === null) return -1;
      return nb - na;
    }
    if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });



  const getSystemLabel = (system: string) => {
    switch (system) {
      case "kids":
        return "Kids";
      case "teen":
      case "teens":
        return "Teens";
      case "adult":
      case "adults":
        return "Adults";
      default:
        return system;
    }
  };

  const getSystemColor = (system: string) => {
    switch (system) {
      case "kids":
        return "bg-green-100 text-green-700";
      case "teen":
      case "teens":
        return "bg-purple-100 text-purple-700";
      case "adult":
      case "adults":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // If editing a lesson, show the editor
  if (editingLessonId) {
    return (
      <LessonEditorPage
        lessonId={editingLessonId}
        onBack={() => setEditingLessonId(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            Lesson Library
          </h1>
          <p className="text-muted-foreground">
            Manage and organize AI-generated curriculum lessons
          </p>
        </div>
        <Button onClick={() => window.location.hash = "#ai-generator"}>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Lesson
        </Button>
      </div>

      {/* Critic verdict summary */}
      {(() => {
        const counts = lessons.reduce(
          (acc, l) => {
            const v = (l as any).ai_metadata?.critic_verdict as string | undefined;
            if (v === "publish") acc.publish++;
            else if (v === "repair") acc.repair++;
            else if (v === "block") acc.block++;
            else acc.unscored++;
            return acc;
          },
          { publish: 0, repair: 0, block: 0, unscored: 0 },
        );
        const chip = (label: string, n: number, key: string, cls: string) => (
          <button
            key={key}
            onClick={() => setCriticFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${cls} ${
              criticFilter === key ? "ring-2 ring-offset-1 ring-primary" : "opacity-90 hover:opacity-100"
            }`}
          >
            {label}: {n}
          </button>
        );
        return (
          <div className="flex flex-wrap items-center gap-2">
            {chip("✓ Publish", counts.publish, "publish", "bg-emerald-100 text-emerald-700")}
            {chip("⚠ Repair", counts.repair, "repair", "bg-amber-100 text-amber-700")}
            {chip("✕ Block", counts.block, "block", "bg-rose-100 text-rose-700")}
            {chip("Unscored", counts.unscored, "unscored", "bg-muted text-muted-foreground")}
            {(() => {
              const scored = lessons
                .map((l) => (l as any).ai_metadata?.critic_score)
                .filter((s) => typeof s === "number") as number[];
              if (!scored.length) return null;
              const avg = Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
              const tone =
                avg >= 80 ? "bg-emerald-100 text-emerald-700"
                : avg >= 60 ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700";
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${tone}`}>
                  Avg score: {avg} ({scored.length})
                </span>
              );
            })()}
            {criticFilter !== "all" && (
              <button
                onClick={() => setCriticFilter("all")}
                className="text-xs text-muted-foreground underline"
              >
                Clear
              </button>
            )}
          </div>
        );
      })()}


      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* System Tabs */}
            <Tabs value={systemFilter} onValueChange={setSystemFilter} className="flex-shrink-0">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="kids">Kids</TabsTrigger>
                <TabsTrigger value="teen">Teens</TabsTrigger>
                <TabsTrigger value="adult">Adults</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Unit Filter */}
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    Unit {unit.unit_number}: {unit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Critic Filter */}
            <Select value={criticFilter} onValueChange={setCriticFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Critic verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All verdicts</SelectItem>
                <SelectItem value="publish">✓ Publish</SelectItem>
                <SelectItem value="repair">⚠ Repair</SelectItem>
                <SelectItem value="block">✕ Block</SelectItem>
                <SelectItem value="unscored">Unscored</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="score_asc">Critic score ↑ (worst first)</SelectItem>
                <SelectItem value="score_desc">Critic score ↓ (best first)</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
              </SelectContent>
            </Select>

            {/* Export CSV */}
            <Button
              variant="outline"
              onClick={() => {
                const rows = [
                  ["Title", "System", "Unit", "Published", "Critic Verdict", "Critic Score", "Scored At", "Created At"],
                  ...filteredLessons.map((l) => {
                    const m = (l as any).ai_metadata || {};
                    return [
                      l.title ?? "",
                      l.target_system ?? "",
                      l.unit ? `U${l.unit.unit_number}: ${l.unit.title}` : "",
                      l.is_published ? "yes" : "no",
                      m.critic_verdict ?? "",
                      m.critic_score ?? "",
                      m.critic_scored_at ?? "",
                      l.created_at ?? "",
                    ];
                  }),
                ];
                const csv = rows
                  .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `curriculum-lessons-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Exported ${filteredLessons.length} lessons`);
              }}
            >
              Export CSV
            </Button>

            {/* Reset filters */}
            {(systemFilter !== "all" || unitFilter !== "all" || criticFilter !== "all" || sortBy !== "recent" || searchQuery) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSystemFilter("all");
                  setUnitFilter("all");
                  setCriticFilter("all");
                  setSortBy("recent");
                  setSearchQuery("");
                  toast.success("Filters reset");
                }}
              >
                Reset filters
              </Button>
            )}




            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      {isLoadingLessons ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No lessons found</p>
            <p className="text-sm">
              {searchQuery || systemFilter !== "all" || unitFilter !== "all"
                ? "Try adjusting your filters"
                : "Generate your first lesson to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredLessons.length}</span> of {lessons.length} lessons
              {selectedIds.size > 0 && (
                <span className="ml-2 text-foreground">· {selectedIds.size} selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    filteredLessons.length > 0 &&
                    filteredLessons.every((l) => selectedIds.has(l.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(filteredLessons.map((l) => l.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
                Select all visible
              </label>
              {selectedIds.size > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      bulkUpdatePublish.mutate({ ids: Array.from(selectedIds), publish: true })
                    }
                    disabled={bulkUpdatePublish.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      bulkUpdatePublish.mutate({ ids: Array.from(selectedIds), publish: false })
                    }
                    disabled={bulkUpdatePublish.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Unpublish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={bulkRescore}
                    disabled={!!rescoring}
                  >
                    {rescoring
                      ? `Rescoring ${rescoring.done}/${rescoring.total}…`
                      : "Rescore Critic"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Delete ${selectedIds.size} lessons? This cannot be undone.`)) {
                        bulkDelete.mutate(Array.from(selectedIds));
                      }
                    }}
                    disabled={bulkDelete.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedIds.has(lesson.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setPreviewLesson(lesson)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedIds.has(lesson.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelected(lesson.id)}
                  />
                  <div className="space-y-1 flex-1 min-w-0">

                    {/* Unit & Lesson Number */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {lesson.unit ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          Unit {lesson.unit.unit_number}
                        </Badge>
                      ) : null}
                      {lesson.sequence_order && (
                        <span>Lesson {lesson.sequence_order}</span>
                      )}
                    </div>
                    <CardTitle className="text-base truncate">
                      {lesson.title || "Untitled Lesson"}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => setPreviewLesson(lesson)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingLessonId(lesson.id)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          togglePublishMutation.mutate({
                            id: lesson.id,
                            isPublished: lesson.is_published,
                          })
                        }
                      >
                        {lesson.is_published ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {lesson.description || "No description"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getSystemColor(lesson.target_system)}>
                    {getSystemLabel(lesson.target_system)}
                  </Badge>
                  <Badge variant="outline">{lesson.difficulty_level}</Badge>
                  {lesson.is_published ? (
                    <Badge className="bg-green-100 text-green-700">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                  {(() => {
                    const meta = (lesson as any).ai_metadata || {};
                    const v = meta.critic_verdict as "publish" | "repair" | "block" | undefined;
                    const s = typeof meta.critic_score === "number" ? Math.round(meta.critic_score) : null;
                    if (!v) return null;
                    const cls =
                      v === "publish"
                        ? "bg-emerald-100 text-emerald-700"
                        : v === "repair"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700";
                    const label = v === "publish" ? "✓ Critic" : v === "repair" ? "⚠ Critic" : "✕ Critic";
                    return (
                      <Badge className={cls} title={`Critic verdict: ${v}${s !== null ? ` · ${s}/100` : ""}`}>
                        {label}{s !== null ? ` ${s}` : ""}
                      </Badge>
                    );
                  })()}

                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewLesson} onOpenChange={() => setPreviewLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewLesson?.title || "Lesson Preview"}
            </DialogTitle>
          </DialogHeader>
          {previewLesson?.content && (
            <LessonPreview
              data={previewLesson.content}
              system={previewLesson.target_system}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
