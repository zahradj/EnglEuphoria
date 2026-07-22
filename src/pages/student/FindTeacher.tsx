import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Globe, Clock, Play, Zap, Filter, Video, ChevronRight, Sparkles, GraduationCap, Rocket, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BackNavigation } from '@/components/navigation/BackNavigation';
import { BookMyClassModal } from '@/components/student/BookMyClassModal';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { cn } from '@/lib/utils';
import { useMarketRegion } from '@/contexts/MarketRegionContext';
import { getTeacherRate, formatPrice } from '@/lib/pricing';

interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  video_url: string | null;
  profile_image_url: string | null;
  specializations: string[] | null;
  accent: string | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  rating: number | null;
  total_reviews: number | null;
  hourly_rate_eur: number | null;
  hourly_rate_dzd: number | null;
  timezone: string | null;
  is_available: boolean;
  market_access?: string[] | null;
  _hubs?: string[];
}

type HubFilter = 'all' | 'playground' | 'academy' | 'professional';

// Hub-branded styling
const HUB_CARD_STYLES: Record<string, {
  border: string;
  bg: string;
  badgeBg: string;
  badgeText: string;
  badgeIcon: React.ReactNode;
  badgeLabel: string;
  ctaGradient: string;
}> = {
  Playground: {
    border: 'border-orange-400/40 hover:border-orange-500',
    bg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/50',
    badgeBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    badgeText: 'text-white',
    badgeIcon: <Sun className="h-3 w-3" />,
    badgeLabel: 'Playground Specialist',
    ctaGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
  },
  Academy: {
    border: 'border-blue-400/40 hover:border-blue-500',
    bg: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50',
    badgeBg: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    badgeText: 'text-white',
    badgeIcon: <GraduationCap className="h-3 w-3" />,
    badgeLabel: 'Academy Mentor',
    ctaGradient: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
  },
  Professional: {
    border: 'border-emerald-400/40 hover:border-emerald-500',
    bg: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/50',
    badgeBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    badgeText: 'text-white',
    badgeIcon: <Rocket className="h-3 w-3" />,
    badgeLabel: 'Success Coach',
    ctaGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
  },
  General: {
    border: 'border-border/40 hover:border-primary/30',
    bg: 'bg-card/60',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    badgeIcon: null,
    badgeLabel: 'Teacher',
    ctaGradient: 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90',
  },
};

const FindTeacher: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { studentLevel } = useStudentLevel();
  const { region } = useMarketRegion();
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Auto-set hub filter from URL param (e.g. /find-teacher?hub=playground)
  const initialHub = (searchParams.get('hub') as HubFilter) || 'all';
  const [hubFilter, setHubFilter] = useState<HubFilter>(initialHub);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Auto-lock hub filter to the student's actual level. Students cannot browse other hubs.
  useEffect(() => {
    if (studentLevel && ['playground', 'academy', 'professional'].includes(studentLevel)) {
      setHubFilter(studentLevel as HubFilter);
    }
  }, [studentLevel]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const isLockedToHub = !!studentLevel && ['playground', 'academy', 'professional'].includes(studentLevel);
  const lockedHubLabel: Record<string, { emoji: string; label: string }> = {
    playground: { emoji: '🎪', label: 'Playground Teachers' },
    academy: { emoji: '📘', label: 'Academy Teachers' },
    professional: { emoji: '🏆', label: 'Success Hub Teachers' },
  };

  const fetchTeachers = async () => {
    try {
      let teacherList: any[] = [];

      // Primary: approved teachers RPC (now includes hub_role + flags)
      const { data, error } = await supabase.rpc('get_approved_teachers');
      if (error) {
        console.warn('[FindTeacher] get_approved_teachers RPC failed, falling back:', error);
      } else {
        teacherList = (data as any[]) || [];
      }

      // Fallback: query user_roles + teacher_profiles directly so the page
      // never goes blank when the RPC errors out.
      if (teacherList.length === 0) {
        const { data: roleRows, error: roleErr } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'teacher');

        if (roleErr) {
          console.error('[FindTeacher] user_roles fallback failed:', roleErr);
        } else if (roleRows && roleRows.length > 0) {
          const ids = roleRows.map((r) => r.user_id);
          const [{ data: usersData }, { data: profilesData }] = await Promise.all([
            supabase.from('users').select('id, full_name').in('id', ids),
            supabase
              .from('teacher_profiles')
              .select(
                'id, user_id, bio, video_url, profile_image_url, specializations, accent, languages_spoken, years_experience, rating, total_reviews, hourly_rate_eur, hourly_rate_dzd, timezone, is_available, hub_role, can_teach, profile_complete, profile_approved_by_admin, market_access'
              )
              .in('user_id', ids),
          ]);
          const userMap = new Map((usersData || []).map((u) => [u.id, u.full_name]));
          teacherList = (profilesData || [])
            .filter((p: any) => p.profile_complete && p.can_teach)
            .map((p: any) => ({
              id: p.id,
              user_id: p.user_id,
              full_name: userMap.get(p.user_id) || 'Teacher',
              bio: p.bio,
              video_url: p.video_url,
              profile_image_url: p.profile_image_url,
              specializations: p.specializations,
              accent: p.accent,
              languages_spoken: p.languages_spoken,
              years_experience: p.years_experience,
              rating: p.rating,
              total_reviews: p.total_reviews,
              hourly_rate_eur: p.hourly_rate_eur,
              hourly_rate_dzd: p.hourly_rate_dzd,
              timezone: p.timezone,
              is_available: p.is_available ?? true,
              hub_role: p.hub_role,
              market_access: Array.isArray((p as any).market_access) && (p as any).market_access.length
                ? (p as any).market_access
                : ['DZ'],
            }));
        }
      }

      // Map hub_role -> visible hub badge(s). The RPC now returns hub_role
      // directly, so we don't need a second round-trip.
      teacherList.forEach((t) => {
        const role = (t as any).hub_role || 'unassigned';
        switch (role) {
          case 'playground_specialist':
            (t as any)._hubs = ['Playground'];
            break;
          case 'academy_mentor':
            (t as any)._hubs = ['Academy'];
            break;
          case 'success_mentor':
            (t as any)._hubs = ['Professional'];
            break;
          case 'academy_success_mentor':
            (t as any)._hubs = ['Academy', 'Professional'];
            break;
          default:
            (t as any)._hubs = [];
        }
      });

      setTeachers(teacherList);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherHub = (teacher: TeacherProfile): string => {
    const hubs = (teacher as any)._hubs || [];
    if (hubs.includes('Playground')) return 'Playground';
    if (hubs.includes('Academy')) return 'Academy';
    if (hubs.includes('Professional')) return 'Professional';
    // Fallback: infer from specializations
    const specs = teacher.specializations?.join(' ').toLowerCase() || '';
    if (specs.includes('kid') || specs.includes('playground') || specs.includes('young')) return 'Playground';
    if (specs.includes('teen') || specs.includes('academy')) return 'Academy';
    if (specs.includes('adult') || specs.includes('professional') || specs.includes('business')) return 'Professional';
    return 'General';
  };

  const studentMarket = region ?? 'INTL';
  const filteredTeachers = teachers.filter(t => {
    // Strict Market Visibility Barrier: teacher must list student's market in market_access.
    const markets = Array.isArray(t.market_access) && t.market_access.length ? t.market_access : ['DZ'];
    const matchesMarket = markets.includes(studentMarket);

    const matchesSearch = !searchTerm ||
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.accent?.toLowerCase().includes(searchTerm.toLowerCase());

    const hubFilterMap: Record<string, string> = {
      playground: 'Playground',
      academy: 'Academy',
      professional: 'Professional',
    };

    const matchesHub = hubFilter === 'all' ||
      ((t as any)._hubs || []).includes(hubFilterMap[hubFilter]) ||
      getTeacherHub(t) === hubFilterMap[hubFilter];

    return matchesMarket && matchesSearch && matchesHub;
  });

  const handleBookTeacher = (teacherUserId: string) => {
    setSelectedTeacherId(teacherUserId);
    setShowBookingModal(true);
  };

  const getStudentLevel = (): 'playground' | 'academy' | 'professional' => {
    if (studentLevel === 'playground' || studentLevel === 'academy' || studentLevel === 'professional') {
      return studentLevel;
    }
    if (hubFilter === 'playground') return 'playground';
    if (hubFilter === 'professional') return 'professional';
    return 'academy';
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackNavigation />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
            Find Your Perfect Teacher
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our expert educators, watch their intro videos, and book your first session
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, specialization, or accent..."
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
            />
          </div>
          {isLockedToHub ? (
            <Badge className="px-4 py-2 text-sm font-semibold self-center" variant="secondary">
              {lockedHubLabel[studentLevel!]?.emoji} {lockedHubLabel[studentLevel!]?.label}
            </Badge>
          ) : (
            <Tabs value={hubFilter} onValueChange={(v) => setHubFilter(v as HubFilter)}>
              <TabsList className="bg-card/50 border border-border/30">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="playground">🎪 Playground</TabsTrigger>
                <TabsTrigger value="academy">📘 Academy</TabsTrigger>
                <TabsTrigger value="professional">🏆 Success</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </motion.div>

        {/* Teacher Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="h-80 animate-pulse bg-card/30" />
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {hubFilter === 'playground' ? 'No Playground teachers currently available'
                : hubFilter === 'academy' ? 'No Academy teachers currently available'
                : hubFilter === 'professional' ? 'No Success Hub teachers currently available'
                : 'No teachers found'}
            </h3>
            <p className="text-muted-foreground">Please check back soon — we add teachers regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTeachers.map((teacher, i) => {
                const hub = getTeacherHub(teacher);
                const style = HUB_CARD_STYLES[hub] || HUB_CARD_STYLES.General;

                return (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                  >
                    <Card className={cn(
                      "group relative overflow-hidden border-2 backdrop-blur-sm hover:shadow-lg transition-all duration-300",
                      style.border,
                      style.bg
                    )}>
                      {/* Hub Badge — top right */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md",
                          style.badgeBg,
                          style.badgeText
                        )}>
                          {style.badgeIcon}
                          {style.badgeLabel}
                        </div>
                      </div>

                      {/* Teacher Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className={cn("h-16 w-16 border-2", style.border)}>
                              {teacher.profile_image_url ? (
                                <AvatarImage
                                  src={teacher.profile_image_url}
                                  alt={teacher.full_name || 'Teacher'}
                                  className="object-cover"
                                  onError={(e) => {
                                    console.warn('[FindTeacher] Avatar image failed to load', teacher.profile_image_url, e);
                                  }}
                                />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {teacher.full_name?.charAt(0)?.toUpperCase() || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            {teacher.is_available && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-20">
                            <h3 className="font-bold text-lg text-foreground truncate">{teacher.full_name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {teacher.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-medium text-foreground">{teacher.rating.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">({teacher.total_reviews})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="px-6 pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {teacher.bio || 'Passionate English teacher ready to help you succeed.'}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="px-6 pb-4 flex flex-wrap gap-2">
                        {teacher.accent && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Globe className="h-3 w-3" /> {teacher.accent}
                          </Badge>
                        )}
                        {teacher.years_experience && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Clock className="h-3 w-3" /> {teacher.years_experience}y exp
                          </Badge>
                        )}
                        {teacher.video_url && (
                          <Badge variant="secondary" className="text-xs gap-1 text-indigo-400 border-indigo-500/20">
                            <Video className="h-3 w-3" /> Intro Video
                          </Badge>
                        )}
                      </div>

                      {/* Languages */}
                      {teacher.languages_spoken && teacher.languages_spoken.length > 0 && (
                        <div className="px-6 pb-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">Speaks:</span>
                            {teacher.languages_spoken.slice(0, 3).map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs px-1.5 py-0 h-5">
                                {lang}
                              </Badge>
                            ))}
                            {teacher.languages_spoken.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{teacher.languages_spoken.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="px-6 pb-6 flex items-center justify-end">
                        <Button
                          onClick={() => handleBookTeacher(teacher.user_id)}
                          size="sm"
                          className={cn("text-white shadow-md gap-1.5", style.ctaGradient)}
                        >
                          Book Session <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>


                      {/* Live indicator */}
                      {teacher.is_available && (
                        <div className="absolute top-12 right-3">
                          <Badge className="bg-emerald-500/90 text-white border-0 gap-1 text-xs animate-pulse">
                            <Zap className="h-3 w-3" /> Live
                          </Badge>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookMyClassModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedTeacherId(null);
        }}
        studentLevel={getStudentLevel()}
        teacherId={selectedTeacherId}
      />
    </div>
  );
};

export default FindTeacher;
