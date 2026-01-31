'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

const PaddleContext = createContext<{ paddle: Paddle | undefined }>({ paddle: undefined });

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

  useEffect(() => {
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production' || 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  return (
    <PaddleContext.Provider value={{ paddle }}>
      {children}
    </PaddleContext.Provider>
  );
}

export const usePaddle = () => useContext(PaddleContext);
