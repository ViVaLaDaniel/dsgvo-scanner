'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseScannerProps {
  onSuccess?: (scanId: string) => void;
  onError?: (error: string) => void;
}

export function useScanner({ onSuccess, onError }: UseScannerProps = {}) {
  const [isScanning, setIsScanning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const startScan = async (websiteId: string) => {
    setIsScanning(websiteId);
    setError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Scan failed');
      }

      if (onSuccess) {
        onSuccess(result.scanId);
      } else {
        // Default behavior: redirect to results
        router.push(`/dashboard/scans/${result.scanId}`);
      }

      return result.scanId;
    } catch (err: any) {
      const errorMessage = err.message || 'Ein unerwarteter Fehler ist aufgetreten';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return null;
    } finally {
      setIsScanning(null);
    }
  };

  return {
    startScan,
    isScanning,
    error,
    clearError: () => setError(null)
  };
}
