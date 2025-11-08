import { useState, useEffect, useRef, useCallback } from 'react';

export const usePracticeTimer = (startActive = true) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(startActive);
  const elapsedTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const pause = useCallback(() => {
    if (isActive) {
      elapsedTimeRef.current += (Date.now() - startTimeRef.current);
      setIsActive(false);
    }
  }, [isActive]);

  const resume = useCallback(() => {
    if (!isActive) {
      startTimeRef.current = Date.now();
      setIsActive(true);
    }
  }, [isActive]);

  const reset = useCallback(() => {
    elapsedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    setTimer(0);
    setIsActive(true); // Start immediately on reset
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        // Only resume if it was active before tab became hidden
        // This prevents resuming a timer that was manually paused (e.g. by flipping the card)
        if (!isActive) {
           resume();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, pause, resume]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (isActive) {
      timerInterval = setInterval(() => {
        const totalElapsedTime = elapsedTimeRef.current + (Date.now() - startTimeRef.current);
        setTimer(Math.floor(totalElapsedTime / 1000));
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isActive]);

  return { timer, pauseTimer: pause, resetTimer: reset };
};
