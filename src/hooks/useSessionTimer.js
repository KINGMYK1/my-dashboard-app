import { useState, useEffect, useRef } from 'react';

export const useSessionTimer = (isActive = true) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  return currentTime;
};