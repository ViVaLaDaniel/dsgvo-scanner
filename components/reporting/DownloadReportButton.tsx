'use client';

import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
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
      if (!scan) throw new Error('Scan не найден');

      // 2. Fetch Website
      const { data: website } = await supabase.from('websites').select('*').eq('id', scan.website_id).single();
      if (!website) throw new Error('Website не найден');

      // 3. Fetch Agency
      const { data: agency } = await supabase.from('agencies').select('*').eq('owner_id', website.owner_id).single();
      if (!agency) throw new Error('Agency настройки не найдены');

      setData({ scan, website, agency });
    } catch (err) {
      console.error('Download Error:', err);
      alert('Ошибка при подготовке отчета');
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
        disabled={loading}
        className={className}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
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
        <Button variant={variant} size="sm" disabled={pdfLoading} className={className}>
          {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
          {pdfLoading ? 'Generiere...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
