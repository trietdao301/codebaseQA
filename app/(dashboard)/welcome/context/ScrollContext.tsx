// context/ScrollContext.tsx
"use client";
import { createContext, useContext, useRef, RefObject } from "react";

type ScrollContextType = {
  projectsRef: RefObject<HTMLDivElement | null>;
  howItWorksRef: RefObject<HTMLDivElement | null>;
};

const ScrollContext = createContext<ScrollContextType | null>(null);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const projectsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  return (
    <ScrollContext.Provider value={{ projectsRef, howItWorksRef }}>
      {children}
    </ScrollContext.Provider>
  );
}

export const useScroll = () => {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScroll must be used within ScrollProvider");
  return ctx;
};
