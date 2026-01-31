import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Scan, Agency, Website } from '@/types/supabase';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  titleContainer: {
    textAlign: 'right',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
    borderLeftWidth: 4,
    paddingLeft: 10,
  },
  websiteInfo: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  findingCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  findingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  findingStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  findingDesc: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#2563eb',
    marginTop: 5,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: 8,
  }
});

interface Props {
  scan: Scan;
  website: Website;
  agency: Agency;
}

export const ScanReportPDF: React.FC<Props> = ({ scan, website, agency }) => {
  const brandColor = agency.brand_color || '#2563eb';
  
  // Helpers for results
  const results = (scan.results as any) || {};
  const findingsList = Array.isArray(results.findings) ? results.findings : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {agency.logo_url ? (
            <Image src={agency.logo_url} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: brandColor }}>{agency.name}</Text>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>DSGVO Audit Report</Text>
            <Text style={styles.subtitle}>Generiert am {new Date().toLocaleDateString('de-DE')}</Text>
          </View>
        </View>

        {/* Website Overview */}
        <View style={styles.websiteInfo}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{website.domain}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Risk Score (0-100)</Text>
            <Text style={[styles.scoreValue, { color: scan.risk_score > 70 ? '#059669' : scan.risk_score > 40 ? '#d97706' : '#dc2626' }]}>
              {scan.risk_score}
            </Text>
          </View>
        </View>

        {/* Audit Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { borderLeftColor: brandColor }]}>Audit-Ergebnisse</Text>
          
          {findingsList.map((f: any, idx: number) => (
            <View key={idx} style={styles.findingCard}>
              <View style={styles.findingHeader}>
                <Text style={styles.findingTitle}>{f.title || f.category}</Text>
                <Text style={[
                  styles.findingStatus, 
                  { 
                    backgroundColor: f.status === 'compliant' ? '#dcfce7' : f.severity === 'high' ? '#fee2e2' : '#fef9c3',
                    color: f.status === 'compliant' ? '#166534' : f.severity === 'high' ? '#991b1b' : '#854d0e'
                  }
                ]}>
                  {(f.status || 'VIOLATION').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.findingDesc}>{f.description_de}</Text>
              {f.status !== 'compliant' && (
                <Text style={styles.recommendation}>Empfehlung: {f.recommendation_de}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Legal Disclaimer */}
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: '#64748b' }}>
            Haftungsausschluss: Dieser Bericht dient nur zu Informationszwecken und stellt keine Rechtsberatung dar. 
            Bitte konsultieren Sie einen qualifizierten Datenschutzbeauftragten oder Rechtsanwalt.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{agency.report_footer}</Text>
          <Text>Seite 1 von 1</Text>
          <Text>{agency.contact_email}</Text>
        </View>
      </Page>
    </Document>
  );
};
