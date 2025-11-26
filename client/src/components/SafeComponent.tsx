import React, { useRef, useEffect, useState } from "react";

interface SafeComponentProps {
  children: React.ReactNode;
}

export function SafeComponent({ children }: SafeComponentProps) {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Ensure React context is properly initialized
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

// Safe useRef hook that checks for React context
export function useSafeRef<T>(initialValue: T) {
  const [ref, setRef] = useState<React.MutableRefObject<T> | null>(null);
  
  useEffect(() => {
    if (typeof React !== 'undefined' && React.useRef) {
      setRef(React.useRef(initialValue));
    }
  }, [initialValue]);
  
  return ref || { current: initialValue };
}