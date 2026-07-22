
import React, { useState, useEffect } from "react";
import { VideoFeed } from "./VideoFeed";
import { type VideoFeedType } from "./types";

interface OneOnOneVideoPanelProps {
  feeds: VideoFeedType[];
  currentUserId: string;
  onToggleMute: (id: string) => void;
  onToggleCamera: (id: string) => void;
  onRaiseHand?: (id: string) => void;
  currentPage?: number;
}

export function OneOnOneVideoPanel({
  feeds,
  currentUserId,
  onToggleMute,
  onToggleCamera,
  onRaiseHand,
  currentPage = 1
}: OneOnOneVideoPanelProps) {
  const isCurrentUser = (id: string) => id === currentUserId;
  const [animating, setAnimating] = useState(false);
  const [prevPage, setPrevPage] = useState(currentPage);
  const [position, setPosition] = useState("static");

  // Determine if current user is teacher or student
  const isCurrentUserTeacher = feeds.find(feed => feed.id === currentUserId)?.isTeacher || false;
  
  // Find the teacher and student feeds
  const teacherFeed = feeds.find(feed => feed.isTeacher);
  const studentFeed = isCurrentUserTeacher 
    ? feeds.find(feed => !feed.isTeacher) 
    : feeds.find(feed => feed.id === currentUserId) || feeds.find(feed => !feed.isTeacher);

  // Calculate position based on current page (each page moves 50px down)
  const topOffset = (currentPage - 1) * 50;

  useEffect(() => {
    if (prevPage !== currentPage) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 500);
      setPrevPage(currentPage);
      return () => clearTimeout(timer);
    }
  }, [currentPage, prevPage]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // When scroll position exceeds threshold, make the panel fixed
      if (window.scrollY > 100) {
        setPosition("fixed");
      } else {
        setPosition("static");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // If there's no teacher or student, show nothing
  if (!teacherFeed || !studentFeed) return null;

  return (
    <div
      className={`bg-black rounded-lg overflow-hidden shadow-md w-full ${
        position === 'fixed'
          ? 'fixed top-2 right-2 z-50 w-[min(400px,_calc(100vw-1rem))]'
          : 'relative'
      }`}
      style={{ transform: position === 'static' ? `translateY(${topOffset}px)` : 'none' }}
    >
      {/* Responsive: stack vertically on small screens, side-by-side on md+ */}
      <div
        className={`flex flex-col sm:flex-row gap-2 p-2 transition-all duration-500 ease-in-out ${
          animating ? 'animate-fade-in' : ''
        }`}
      >
        {/* Teacher video */}
        <div className="w-full sm:flex-1 aspect-video relative bg-muted-foreground/20 rounded overflow-hidden border-2 border-blue-300">
          <VideoFeed
            feed={teacherFeed}
            isSmall={false}
            isCurrentUser={isCurrentUser(teacherFeed.id)}
            onToggleMute={onToggleMute}
            onToggleCamera={onToggleCamera}
            onRaiseHand={onRaiseHand}
          />
          {isCurrentUserTeacher && (
            <div className="absolute bottom-0 left-0 bg-green-500/80 text-white text-[10px] px-1 py-0.5 rounded-tr">
              You (T)
            </div>
          )}
        </div>

        {/* Student video */}
        <div className="w-full sm:flex-1 aspect-video relative bg-muted-foreground/20 rounded overflow-hidden border-2 border-purple-300">
          <VideoFeed
            feed={studentFeed}
            isSmall={false}
            isCurrentUser={isCurrentUser(studentFeed.id)}
            onToggleMute={onToggleMute}
            onToggleCamera={onToggleCamera}
            onRaiseHand={onRaiseHand}
          />
          {!isCurrentUserTeacher && isCurrentUser(studentFeed.id) && (
            <div className="absolute bottom-0 left-0 bg-blue-500/80 text-white text-[10px] px-1 py-0.5 rounded-tr">
              You (S)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
