import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface CapturedImage {
  id: string;
  date: string;
  imageBase64: string;
  bounds: [number, number, number, number]; // [W, S, E, N]
}

export interface SharedRegion {
  bbox: string;
  dateStart: string;
  dateEnd: string;
  cloudCover: number;
}

interface CaptureContextType {
  captures: CapturedImage[];
  addCapture: (capture: CapturedImage) => void;
  removeCapture: (id: string) => void;
  clearCaptures: () => void;
  sharedRegion: SharedRegion;
  setSharedRegion: (region: SharedRegion) => void;
}

const CaptureContext = createContext<CaptureContextType | undefined>(undefined);

export const CaptureProvider = ({ children }: { children: ReactNode }) => {
  const [captures, setCaptures] = useState<CapturedImage[]>([]);
  const [sharedRegion, setSharedRegion] = useState<SharedRegion>({
    bbox: '80.35,16.25,80.45,16.35', // Guntur bounds
    dateStart: '2023-05-01',
    dateEnd: '2023-05-31',
    cloudCover: 20
  });

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
    <CaptureContext.Provider value={{ captures, addCapture, removeCapture, clearCaptures, sharedRegion, setSharedRegion }}>
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
