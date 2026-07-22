import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Maximize2, 
  Volume2,
  VolumeX,
  Signal,
  SignalHigh,
  SignalLow,
  User
} from "lucide-react";

interface ModernUserControlsProps {
  teacher: {
    id: string;
    name: string;
    isVideoOn: boolean;
    isAudioOn: boolean;
    videoStream?: MediaStream;
  };
  student: {
    id: string;
    name: string;
    isVideoOn: boolean;
    isAudioOn: boolean;
    videoStream?: MediaStream;
  };
  connectionQuality: "excellent" | "good" | "poor";
  onToggleTeacherVideo?: () => void;
  onToggleTeacherAudio?: () => void;
  onToggleStudentVideo?: () => void;
  onToggleStudentAudio?: () => void;
  isTeacher?: boolean;
}

interface UserVideoFeedProps {
  name: string;
  role: "teacher" | "student";
  isVideoOn: boolean;
  isAudioOn: boolean;
  videoStream?: MediaStream;
  connectionQuality: "excellent" | "good" | "poor";
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onExpand?: () => void;
  canControl?: boolean;
  size?: "large" | "small";
}

function UserVideoFeed({
  name,
  role,
  isVideoOn,
  isAudioOn,
  videoStream,
  connectionQuality,
  onToggleVideo,
  onToggleAudio,
  onExpand,
  canControl,
  size = "large"
}: UserVideoFeedProps) {
  const [showControls, setShowControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    large: "w-56 h-40",
    small: "w-56 h-40"
  };

  const connectionIcons = {
    excellent: <Signal className="w-3 h-3 text-classroom-success" />,
    good: <SignalHigh className="w-3 h-3 text-classroom-reward" />,
    poor: <SignalLow className="w-3 h-3 text-destructive" />
  };

  const roleColors = {
    teacher: "from-lesson-purple/40 via-lesson-pink/30 to-lesson-blue/40",
    student: "from-lesson-teal/40 via-lesson-lime/30 to-lesson-green/40"
  };

  const roleBorderColors = {
    teacher: "border-lesson-purple/50",
    student: "border-lesson-teal/50"
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowControls(false);
      }}
    >
      <GlassCard 
        className={`${sizeClasses[size]} relative overflow-hidden transition-all duration-300 border-2 ${roleBorderColors[role]} ${
          isHovered ? "scale-105 shadow-glow border-opacity-80" : "border-opacity-40"
        }`}
      >
        {/* Video or placeholder */}
        {isVideoOn && videoStream ? (
          <video
            autoPlay
            playsInline
            muted={role === "teacher"} // Prevent echo
            className="w-full h-full object-cover"
            ref={(el) => {
              if (el && videoStream) {
                el.srcObject = videoStream;
              }
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center relative overflow-hidden`}>
            {/* Animated particles when camera off */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float-slow" />
            </div>
            <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 shadow-lg relative z-10">
              <User className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>
        )}

        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Name and status */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium drop-shadow-lg">
                {name}
              </span>
              <span className="text-[10px] text-white/70 uppercase">{role}</span>
            </div>
            {connectionIcons[connectionQuality]}
          </div>
        </div>

        {/* Muted indicator */}
        {!isAudioOn && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/90 flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Camera off indicator */}
        {!isVideoOn && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center">
            <VideoOff className="w-3 h-3" />
          </div>
        )}

        {/* Hover controls */}
        {showControls && canControl && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 animate-fade-in">
            <GlassButton
              size="sm"
              variant={isAudioOn ? "success" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleAudio?.();
              }}
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </GlassButton>
            <GlassButton
              size="sm"
              variant={isVideoOn ? "success" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVideo?.();
              }}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </GlassButton>
            {onExpand && (
              <GlassButton
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
              >
                <Maximize2 className="w-4 h-4" />
              </GlassButton>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export function ModernUserControls({
  teacher,
  student,
  connectionQuality,
  onToggleTeacherVideo,
  onToggleTeacherAudio,
  onToggleStudentVideo,
  onToggleStudentAudio,
  isTeacher = false
}: ModernUserControlsProps) {
  const [expandedUser, setExpandedUser] = useState<"teacher" | "student" | null>(null);

  return (
    <>
      {/* Normal view */}
      {!expandedUser && (
        <div className="fixed top-20 left-6 z-30 flex flex-col gap-3 p-4 glass-strong rounded-2xl shadow-glow animate-fade-in border-2 border-primary/20">
          <div className="text-xs font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 uppercase tracking-wide">
            Live Session
          </div>
          <UserVideoFeed
            name={teacher.name}
            role="teacher"
            isVideoOn={teacher.isVideoOn}
            isAudioOn={teacher.isAudioOn}
            videoStream={teacher.videoStream}
            connectionQuality={connectionQuality}
            onToggleVideo={isTeacher ? onToggleTeacherVideo : undefined}
            onToggleAudio={isTeacher ? onToggleTeacherAudio : undefined}
            onExpand={() => setExpandedUser("teacher")}
            canControl={isTeacher}
            size="large"
          />
          <UserVideoFeed
            name={student.name}
            role="student"
            isVideoOn={student.isVideoOn}
            isAudioOn={student.isAudioOn}
            videoStream={student.videoStream}
            connectionQuality={connectionQuality}
            onToggleVideo={!isTeacher ? onToggleStudentVideo : undefined}
            onToggleAudio={!isTeacher ? onToggleStudentAudio : undefined}
            onExpand={() => setExpandedUser("student")}
            canControl={!isTeacher}
            size="large"
          />
        </div>
      )}

      {/* Expanded view */}
      {expandedUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in"
          onClick={() => setExpandedUser(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <UserVideoFeed
              name={expandedUser === "teacher" ? teacher.name : student.name}
              role={expandedUser}
              isVideoOn={expandedUser === "teacher" ? teacher.isVideoOn : student.isVideoOn}
              isAudioOn={expandedUser === "teacher" ? teacher.isAudioOn : student.isAudioOn}
              videoStream={expandedUser === "teacher" ? teacher.videoStream : student.videoStream}
              connectionQuality={connectionQuality}
              onToggleVideo={
                expandedUser === "teacher" 
                  ? (isTeacher ? onToggleTeacherVideo : undefined)
                  : (!isTeacher ? onToggleStudentVideo : undefined)
              }
              onToggleAudio={
                expandedUser === "teacher"
                  ? (isTeacher ? onToggleTeacherAudio : undefined)
                  : (!isTeacher ? onToggleStudentAudio : undefined)
              }
              canControl={
                (expandedUser === "teacher" && isTeacher) || 
                (expandedUser === "student" && !isTeacher)
              }
              size="large"
            />
            <GlassButton
              variant="default"
              className="mt-4 mx-auto block"
              onClick={() => setExpandedUser(null)}
            >
              Close Fullscreen
            </GlassButton>
          </div>
        </div>
      )}
    </>
  );
}
