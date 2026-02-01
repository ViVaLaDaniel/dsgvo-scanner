'use client';

import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { cookieConfig } from '@/lib/cookie-config';

export function ProfessionalCookieBanner() {
  useEffect(() => {
    /**
     * Initialize CookieConsent v3
     */
    CookieConsent.run(cookieConfig as any);
  }, []);

  // vanilla-cookieconsent manages its own DOM (modal/settings), 
  // so we don't need to return any JSX here.
  return null;
}
