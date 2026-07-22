import React from 'react';
import { Rnd } from 'react-rnd';
import { User } from 'lucide-react';

interface PictureInPictureProps {
  name: string;
  isConnected?: boolean;
  stream?: MediaStream | null;
}

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  name,
  isConnected = true,
  stream
}) => {
  return (
    <Rnd
      default={{ x: 16, y: 16, width: 200, height: 150 }}
      minWidth={160}
      minHeight={120}
      maxWidth={320}
      maxHeight={240}
      bounds="window"
      className="z-40"
      enableResizing={{ bottomRight: true }}
    >
      <div className="w-full h-full rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50 shadow-2xl shadow-black/50 relative group cursor-grab active:cursor-grabbing">
        {stream ? (
          <video
            ref={el => { if (el && stream) el.srcObject = stream; }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <User className="w-10 h-10 text-gray-600" />
          </div>
        )}

        {/* Name label */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            {isConnected && (
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            )}
            <span className="text-[10px] font-medium text-white truncate">{name}</span>
          </div>
        </div>
      </div>
    </Rnd>
  );
};
