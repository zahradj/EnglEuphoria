import React from 'react';
import { motion } from 'framer-motion';
import { DoorOpen, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnterClassroomCTAProps {
  nextLessonRoomLink?: string | null;
  nextLessonTitle?: string;
}

export const EnterClassroomCTA: React.FC<EnterClassroomCTAProps> = ({
  nextLessonRoomLink,
  nextLessonTitle,
}) => {
  const navigate = useNavigate();
  const hasUpcoming = !!nextLessonRoomLink;

  const handleClick = () => {
    if (hasUpcoming && nextLessonRoomLink) {
      navigate(nextLessonRoomLink);
    } else {
      navigate('/student?tab=book');
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="w-full py-4 rounded-3xl font-bold text-white text-lg flex items-center justify-center gap-3 shadow-xl border-2 border-white/20"
      style={{
        fontFamily: "'Fredoka', cursive",
        background: hasUpcoming
          ? 'linear-gradient(135deg, #f472b6, #c084fc, #818cf8)'
          : 'linear-gradient(135deg, #a78bfa, #818cf8)',
      }}
      animate={{
        y: [0, -6, 0],
        boxShadow: [
          '0 8px 30px rgba(196,132,252,0.3)',
          '0 14px 40px rgba(196,132,252,0.5)',
          '0 8px 30px rgba(196,132,252,0.3)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      {hasUpcoming ? (
        <>
          <DoorOpen className="w-6 h-6" />
          Enter the Classroom 🚀
        </>
      ) : (
        <>
          <CalendarPlus className="w-6 h-6" />
          Book a Lesson ✨
        </>
      )}
    </motion.button>
  );
};
