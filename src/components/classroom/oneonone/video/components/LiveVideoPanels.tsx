
import React from "react";
import { VideoRefs } from "../types";

interface Props {
  isTeacher: boolean;
  media: any;
  lessonStarted: boolean;
  videoRefs: VideoRefs;
}

export function LiveVideoPanels({ isTeacher, media, lessonStarted, videoRefs }: Props) {
  if (!lessonStarted) return null;

  const hasVideo = media.stream && media.isConnected && !media.isCameraOff;
  
  return (
    <div className="absolute inset-3 flex gap-6" style={{ zIndex: 2 }}>
      {/* Teacher Panel */}
      <div className="flex-1 aspect-video max-w-full max-h-full flex items-center justify-center relative group">
        {isTeacher ? (
          // Teacher sees their own video
          hasVideo ? (
            <video
              autoPlay
              muted // Always mute local preview to prevent feedback!
              playsInline
              className="w-full h-full object-cover rounded-3xl shadow-2xl border-2 border-primary/30 ring-2 ring-primary/20 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-glow"
              ref={videoRefs.teacherVideoRef}
              onLoadedMetadata={() => console.log("🎥 Teacher video metadata loaded")}
              onError={e => console.error("🎥 Teacher video error", e)}
            />
          ) : (
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-500/90 via-violet-600/90 to-blue-600/90 flex items-center justify-center shadow-2xl border-2 border-purple-300/50 ring-2 ring-purple-200/30 relative transition-all duration-300 group-hover:scale-[1.02] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
              <div className="text-center relative z-10">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/80 to-blue-500/80 flex items-center justify-center shadow-xl mb-4 mx-auto backdrop-blur-sm border border-white/20 floating-animation">
                  <span className="text-6xl font-bold text-white drop-shadow-lg">T</span>
                </div>
                <p className="text-white font-semibold text-lg drop-shadow-sm">Teacher</p>
              </div>
              {media.isCameraOff && (
                <div className="absolute bottom-4 right-4 glass-subtle text-red-400 text-sm px-3 py-2 rounded-xl font-medium">
                  Camera Off
                </div>
              )}
            </div>
          )
        ) : (
          // Student sees teacher avatar (placeholder - would be teacher's video in real implementation)
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-400/80 via-violet-500/80 to-blue-500/80 flex items-center justify-center shadow-2xl border-2 border-purple-300/50 ring-2 ring-purple-200/30 relative transition-all duration-300 group-hover:scale-[1.02] backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
            <div className="text-center relative z-10">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-300/80 to-blue-400/80 flex items-center justify-center shadow-xl mb-4 mx-auto backdrop-blur-sm border border-white/20 floating-animation">
                <span className="text-6xl font-semibold text-white drop-shadow-lg">T</span>
              </div>
              <p className="text-white font-semibold text-lg drop-shadow-sm">Teacher</p>
            </div>
            <div className="absolute bottom-4 right-4 glass-subtle text-muted-foreground text-sm px-3 py-2 rounded-xl">
              Remote
            </div>
          </div>
        )}
      </div>
      
      {/* Student Panel */}
      <div className="flex-1 aspect-video max-w-full max-h-full flex items-center justify-center relative group">
        {!isTeacher ? (
          // Student sees their own video
          hasVideo ? (
            <video
              autoPlay
              muted // Always mute local preview for student!
              playsInline
              className="w-full h-full object-cover rounded-3xl shadow-2xl border-2 border-secondary/30 ring-2 ring-secondary/20 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-glow"
              ref={videoRefs.studentVideoRef}
              onLoadedMetadata={() => console.log("🎥 Student video metadata loaded")}
              onError={e => console.error("🎥 Student video error", e)}
            />
          ) : (
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-teal-500/90 via-cyan-600/90 to-blue-600/90 flex items-center justify-center shadow-2xl border-2 border-teal-300/50 ring-2 ring-teal-200/30 relative transition-all duration-300 group-hover:scale-[1.02] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
              <div className="text-center relative z-10">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 flex items-center justify-center shadow-xl mb-4 mx-auto backdrop-blur-sm border border-white/20 floating-animation">
                  <span className="text-6xl font-bold text-white drop-shadow-lg">S</span>
                </div>
                <p className="text-white font-semibold text-lg drop-shadow-sm">Student</p>
              </div>
              {media.isCameraOff && (
                <div className="absolute bottom-4 right-4 glass-subtle text-red-400 text-sm px-3 py-2 rounded-xl font-medium">
                  Camera Off
                </div>
              )}
            </div>
          )
        ) : (
          // Teacher sees student avatar (placeholder - would be student's video in real implementation)
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-teal-400/80 via-cyan-500/80 to-blue-500/80 flex items-center justify-center shadow-2xl border-2 border-teal-300/50 ring-2 ring-teal-200/30 relative transition-all duration-300 group-hover:scale-[1.02] backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
            <div className="text-center relative z-10">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-300/80 to-cyan-400/80 flex items-center justify-center shadow-xl mb-4 mx-auto backdrop-blur-sm border border-white/20 floating-animation">
                <span className="text-6xl font-semibold text-white drop-shadow-lg">S</span>
              </div>
              <p className="text-white font-semibold text-lg drop-shadow-sm">Student</p>
            </div>
            <div className="absolute bottom-4 right-4 glass-subtle text-muted-foreground text-sm px-3 py-2 rounded-xl">
              Remote
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
