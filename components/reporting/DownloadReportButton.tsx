'use client';

import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { ScanReportPDF } from './ScanReportPDF';
import { createClient } from '@/lib/supabase/client';
import { Scan, Website, Agency } from '@/types/supabase';

interface Props {
  scanId: string;
  variant?: 'outline' | 'ghost' | 'default';
  className?: string;
}

export function DownloadReportButton({ scanId, variant = 'outline', className }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ scan: Scan; website: Website; agency: Agency } | null>(null);
  const [supabase] = useState(() => createClient());

  const prepareData = async () => {
    if (data) return;
    setLoading(true);
    try {
      // 1. Fetch Scan
      const { data: scan } = await supabase.from('scans').select('*').eq('id', scanId).single();
      if (!scan) throw new Error('Scan nicht gefunden');

      // 2. Fetch Website
      const { data: website } = await supabase.from('websites').select('*').eq('id', scan.website_id).single();
      if (!website) throw new Error('Website nicht gefunden');

      // 3. Fetch Agency
      const { data: agency } = await supabase.from('agencies').select('*').eq('owner_id', website.owner_id).single();
      if (!agency) throw new Error('Agentureinstellungen nicht gefunden');

      setData({ scan, website, agency });
    } catch (err) {
      console.error('Download Error:', err);
      alert('Fehler bei der Berichtsvorbereitung');
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <Button 
        variant={variant} 
        size="sm" 
        onClick={prepareData} 
        isLoading={loading}
        className={className}
      >
        <FileDown className="h-4 w-4" />
        PDF Report
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ScanReportPDF scan={data.scan} website={data.website} agency={data.agency} />}
      fileName={`DSGVO-Report-${data.website.domain}.pdf`}
    >
      {({ loading: pdfLoading }) => (
        <Button variant={variant} size="sm" isLoading={pdfLoading} className={className}>
          {!pdfLoading && <FileDown className="h-4 w-4" />}
          {pdfLoading ? 'Generiere...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
