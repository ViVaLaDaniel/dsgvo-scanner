'use client';

import { DashboardProvider } from './dashboard-context';
import DashboardLayoutContent from './layout-content';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </DashboardProvider>
  );
}
