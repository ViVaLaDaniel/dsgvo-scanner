import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Scan, Agency, Website } from '@/types/supabase';

// Register Inter font for proper UTF-8 support (German Umlaute)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZg.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 800 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
  },
  logo: {
    width: 140,
    height: 45,
    objectFit: 'contain',
  },
  titleContainer: {
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  websiteInfo: {
    backgroundColor: '#f8fafc',
    padding: 25,
    borderRadius: 12,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#64748b',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 800,
  },
  findingCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0f172a',
  },
  findingStatus: {
    fontSize: 8,
    fontWeight: 800,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  findingDesc: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#475569',
    marginBottom: 10,
  },
  recommendation: {
    fontSize: 9,
    fontWeight: 600,
    color: '#2563eb',
    marginTop: 5,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: 600,
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
