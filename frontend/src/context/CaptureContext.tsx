import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CapturedImage {
  id: string;
  date: string;
  imageBase64: string;
  bounds: [number, number, number, number]; // [W, S, E, N]
}

interface CaptureContextType {
  captures: CapturedImage[];
  addCapture: (capture: CapturedImage) => void;
  removeCapture: (id: string) => void;
  clearCaptures: () => void;
}

const CaptureContext = createContext<CaptureContextType | undefined>(undefined);

export const CaptureProvider = ({ children }: { children: ReactNode }) => {
  const [captures, setCaptures] = useState<CapturedImage[]>([]);

  const addCapture = (capture: CapturedImage) => {
    setCaptures((prev) => [...prev, capture]);
  };

  const removeCapture = (id: string) => {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCaptures = () => {
    setCaptures([]);
  };

  return (
    <CaptureContext.Provider value={{ captures, addCapture, removeCapture, clearCaptures }}>
      {children}
    </CaptureContext.Provider>
  );
};

export const useCapture = () => {
  const context = useContext(CaptureContext);
  if (context === undefined) {
    throw new Error('useCapture must be used within a CaptureProvider');
  }
  return context;
};
