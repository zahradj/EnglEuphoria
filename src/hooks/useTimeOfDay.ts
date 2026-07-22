import { useState, useEffect } from 'react';

export type TimeOfDay = 'day' | 'night';

interface TimeOfDayResult {
  timeOfDay: TimeOfDay;
  isDaytime: boolean;
  currentHour: number;
}

export const useTimeOfDay = (): TimeOfDayResult => {
  const getHour = () => new Date().getHours();
  const getTimeOfDay = (h: number): TimeOfDay => (h >= 6 && h < 18 ? 'day' : 'night');

  const [currentHour, setCurrentHour] = useState(getHour);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(getHour());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = getTimeOfDay(currentHour);

  return { timeOfDay, isDaytime: timeOfDay === 'day', currentHour };
};
