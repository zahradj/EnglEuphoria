
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useMediaContext } from "@/components/classroom/oneonone/video/MediaContext";

interface StudentVideoPanelProps {
  studentName: string;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
}

export function StudentVideoPanel({ studentName, currentUser }: StudentVideoPanelProps) {
  const media = useMediaContext();
  const isTeacher = currentUser.role === 'teacher';
  const hasVideo = media.stream && media.isConnected && !media.isCameraOff;

  const handleJoinVideo = () => {
    media.join();
  };

  return (
    <Card className="h-[300px] p-0 bg-white/90 border-2 border-purple-300 shadow-lg rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white/70 to-pink-50 pointer-events-none"></div>
      
      <div className="w-full h-full relative flex flex-col">
        {!media.isConnected ? (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center shadow-lg mb-3 mx-auto">
                <span className="text-2xl font-bold text-purple-600">S</span>
              </div>
              <p className="text-purple-600 font-semibold mb-2">Student Video</p>
              {!isTeacher ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Ready to join video?</p>
                  <Button 
                    onClick={handleJoinVideo}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow-lg"
                  >
                    Join Video
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Waiting for student to join...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Student Video Area - Fixed container size matching teacher */}
            {!isTeacher ? (
              // Student sees their own video
              hasVideo ? (
                <video
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(ref) => {
                    if (ref && media.stream) {
                      ref.srcObject = media.stream;
                    }
                  }}
                  onLoadedMetadata={() => console.log("🎥 Student video metadata loaded")}
                  onError={e => console.error("🎥 Student video error", e)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-purple-400 flex items-center justify-center shadow-xl mb-3 mx-auto">
                      <span className="text-4xl font-bold text-white">S</span>
                    </div>
                    <p className="text-white font-semibold">{currentUser.name}</p>
                  </div>
                  {media.isCameraOff && (
                    <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Camera Off
                    </div>
                  )}
                </div>
              )
            ) : (
              // Teacher sees student avatar/video placeholder
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-purple-300 flex items-center justify-center shadow-xl mb-3 mx-auto">
                    <span className="text-4xl font-semibold text-white">S</span>
                  </div>
                  <p className="text-white font-semibold">{studentName}</p>
                </div>
                <div className="absolute bottom-3 right-3 bg-gray-600 text-white text-xs px-2 py-1 rounded">
                  Remote
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {media.isConnected && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  ● Live
                </Badge>
              )}
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Student
              </Badge>
            </div>

            {/* Student Video Controls - Only show for students when connected */}
            {!isTeacher && media.isConnected && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  variant={media.isMuted ? "destructive" : "outline"}
                  size="icon"
                  onClick={media.toggleMicrophone}
                  className="w-8 h-8"
                >
                  {media.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
                <Button
                  variant={media.isCameraOff ? "destructive" : "outline"}
                  size="icon"
                  onClick={media.toggleCamera}
                  className="w-8 h-8"
                >
                  {media.isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={media.leave}
                  className="w-8 h-8"
                  title="Leave Video"
                >
                  <span className="text-xs">⏻</span>
                </Button>
              </div>
            )}

            {/* Student Name Label */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {isTeacher ? studentName : currentUser.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
