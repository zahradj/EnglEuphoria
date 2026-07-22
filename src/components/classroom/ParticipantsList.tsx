
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Mic, MicOff, Video, VideoOff, Hand } from "lucide-react";

interface Participant {
  name: string;
  isTeacher?: boolean;
  isCurrentUser?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  const { languageText } = useLanguage();
  
  return (
    <div className="bg-white rounded-lg border h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{languageText.participants}</h2>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{participants.length}</span>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        {participants.map((participant, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
              participant.isTeacher 
                ? "bg-muted/50" 
                : participant.isCurrentUser 
                ? "bg-yellow-light/50" 
                : "hover:bg-muted/30"
            }`}
          >
            <div 
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                participant.isTeacher 
                  ? "bg-purple/20" 
                  : participant.isCurrentUser 
                  ? "bg-yellow/20"
                  : `bg-hsl(${(index * 40) % 360}, 70%, 90%)`
              }`}
            >
              <span className={`font-bold ${
                participant.isTeacher 
                  ? "text-purple" 
                  : participant.isCurrentUser 
                  ? "text-yellow-dark"
                  : ""
              }`}>
                {participant.name.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <p className="font-medium">
                {participant.name} 
                {participant.isCurrentUser && ` (${languageText.you})`}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {participant.isMuted ? <MicOff size={10} /> : <Mic size={10} />}
                {participant.isVideoOff ? <VideoOff size={10} /> : <Video size={10} />}
                {participant.isHandRaised && <Hand size={10} className="text-yellow-dark" />}
              </div>
            </div>
            
            {participant.isTeacher && (
              <div className="text-xs bg-purple/20 text-purple px-2 py-0.5 rounded-full">
                {languageText.host}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
