import { createContext, useContext } from 'react';

export interface UrgeSurfSession {
  active: boolean;
  timeLeft: number;
  startTime: number | null;
}

export interface UrgeSurfContextType {
  session: UrgeSurfSession;
  startSession: () => void;
  stopSession: () => void;
  updateTimeLeft: (time: number) => void;
  openUrgeSurfToolbox: () => void;
  registerOpenCallback: (callback: () => void) => void;
}

export const UrgeSurfContext = createContext<UrgeSurfContextType | null>(null);

export const useUrgeSurfSession = () => {
  const context = useContext(UrgeSurfContext);
  if (!context) {
    throw new Error('useUrgeSurfSession must be used within an UrgeSurfProvider');
  }
  return context;
};