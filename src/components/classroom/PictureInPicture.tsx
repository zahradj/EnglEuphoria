import React from 'react';
import { Rnd } from 'react-rnd';
import { User, Pin, VideoOff, Mic, MicOff } from 'lucide-react';

interface PictureInPictureProps {
  name: string;
  isConnected?: boolean;
  stream?: MediaStream | null;
  /** Mirror the video horizontally and mute local playback (used for the local self-view tile). */
  mirrored?: boolean;
  /** Where the tile starts. Defaults to the top-left corner. */
  defaultPosition?: { x: number; y: number };
  /** Starting size. Defaults larger than the docked sidebar tile. */
  defaultSize?: { width: number; height: number };
  /** Drag/resize boundary. Defaults to the window; pass a container ref/selector to keep it inside the classroom stage. */
  bounds?: string | HTMLElement;
  /** Shown on hover — lets the user dock the tile back into the sidebar. */
  onDock?: () => void;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  name,
  isConnected = true,
  stream,
  mirrored = false,
  defaultPosition = { x: 16, y: 16 },
  defaultSize = { width: 260, height: 195 },
  bounds = 'window',
  onDock,
  isMuted,
  isCameraOff = false,
}) => {
  return (
    <Rnd
      default={{ ...defaultPosition, ...defaultSize }}
      minWidth={180}
      minHeight={135}
      maxWidth={480}
      maxHeight={360}
      bounds={bounds}
      className="z-[85]"
      enableResizing={{ bottomRight: true }}
    >
      <div className="w-full h-full rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50 shadow-2xl shadow-black/50 relative group cursor-grab active:cursor-grabbing">
        {stream && !isCameraOff ? (
          <video
            ref={el => { if (el && stream) el.srcObject = stream; }}
            autoPlay
            playsInline
            muted={mirrored}
            className="w-full h-full object-cover"
            style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            {isCameraOff ? (
              <VideoOff className="w-8 h-8 text-gray-600" />
            ) : (
              <User className="w-10 h-10 text-gray-600" />
            )}
          </div>
        )}

        {onDock && (
          <button
            type="button"
            onClick={onDock}
            title="Dock back to sidebar"
            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <Pin className="w-3 h-3" />
          </button>
        )}

        {/* Name label */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            {isConnected && (
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            )}
            <span className="text-[10px] font-medium text-white truncate">{name}</span>
            {isMuted !== undefined && (
              isMuted ? <MicOff className="w-2.5 h-2.5 text-red-400 shrink-0" /> : <Mic className="w-2.5 h-2.5 text-white/70 shrink-0" />
            )}
          </div>
        </div>
      </div>
    </Rnd>
  );
};
