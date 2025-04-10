import React, { useEffect, useRef, useState } from 'react';
 
const AssessmentProtection: React.FC = () => {
  const [warningCount, setWarningCount] = useState(0);
  const warningLimit = 3;
  const hasWarnedRef = useRef(false);
 
  useEffect(() => {
    // --- 1. Tab Switch Detection ---
    const handleVisibilityChange = () => {
      if (document.hidden && warningCount < warningLimit && !hasWarnedRef.current) {
        hasWarnedRef.current = true;
        const newCount = warningCount + 1;
        setWarningCount(newCount);
        alert(`Warning ${newCount}/${warningLimit}: Do not switch tabs.`);
 
        // Optional: Send warning log to backend
        // fetch('/api/log-warning', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ type: 'tab-switch', count: newCount }),
        // });
 
        if (newCount === warningLimit) {
          alert("You have reached the maximum tab switches. Your test will be submitted.");
          // Auto-submit test here (example)
          // submitTest(); // call your submit logic
        }
      } else if (!document.hidden) {
        hasWarnedRef.current = false;
      }
    };
 
    // --- 2. Location Permission ---
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords);
          // Optional: Send location to backend
          // fetch('/api/log-location', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     lat: position.coords.latitude,
          //     lng: position.coords.longitude,
          //   }),
          // });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
 
    // --- 3. Disable Copy/Paste/Cut/Right-Click ---
    const blockEvent = (e: Event) => {
      e.preventDefault();
      alert("Copying, pasting, cutting, and right-clicking are disabled.");
    };
 
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("paste", blockEvent);
    document.addEventListener("contextmenu", blockEvent);
 
    // --- 4. Disable Keyboard Shortcuts ---
    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedKeys = [
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'u')), // Ctrl+C/V/X/U
        (e.key === 'F12'), // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'I'), // Ctrl+Shift+I
        (e.metaKey && e.key === 's'), // Cmd+S
      ];
 
      if (blockedKeys.some(Boolean)) {
        e.preventDefault();
        alert("Certain keyboard shortcuts are disabled during the assessment.");
      }
    };
 
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
 
    return () => {
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("paste", blockEvent);
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [warningCount]);
 
  return (
    <div>
      {warningCount >= warningLimit && (
        <p style={{ color: 'red' }}>
          You have reached the maximum number of tab switches. Your test has been submitted.
        </p>
      )}
    </div>
  );
};
 
export default AssessmentProtection;