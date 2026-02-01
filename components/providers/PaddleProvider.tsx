'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

const PaddleContext = createContext<{ paddle: Paddle | undefined }>({ paddle: undefined });

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        console.log('Paddle: Initializing with env:', process.env.NEXT_PUBLIC_PADDLE_ENV);
        const paddleInstance = await initializePaddle({
          environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox',
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
          eventCallback: (data) => {
             console.log('Paddle Event:', data);
          }
        });

        if (paddleInstance) {
          console.log('Paddle: Initialized successfully');
          setPaddle(paddleInstance);
        } else {
          console.error('Paddle: Failed to create instance (returned undefined)');
        }
      } catch (error) {
        console.error('Paddle: Initialization Error:', error);
      }
    };

    initPaddle();
  }, []);

  return (
    <PaddleContext.Provider value={{ paddle }}>
      {children}
    </PaddleContext.Provider>
  );
}

export const usePaddle = () => useContext(PaddleContext);
