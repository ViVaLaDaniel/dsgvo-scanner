export const cookieConfig = {
  guiOptions: {
    consentModal: {
      layout: 'box',
      position: 'bottom right',
      equalWeightButtons: true,
      flipButtons: false
    },
    settingsModal: {
      layout: 'box',
      position: 'left',
      equalWeightButtons: true,
      flipButtons: false
    }
  },
  categories: {
    necessary: {
      readOnly: true,
      enabled: true
    },
    analytics: {
      autoClear: {
        cookies: [
          {
            name: /^(_ga|_gid)/ // Google Analytics cookies
          }
        ]
      }
    },
    marketing: {
      autoClear: {
        cookies: [
          {
            name: /^(_fbp|_gcl_au)/ // Facebook and Google Marketing cookies
          }
        ]
      }
    }
  },
  language: {
    default: 'de',
    translations: {
      de: {
        consentModal: {
          title: 'Wir schätzen Ihre Privatsphäre 🛡️',
          description: 'Hallo! Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten und die Nutzung zu analysieren. Mit Ihrer Zustimmung helfen Sie uns, den DSGVO Scanner stetig zu verbessern.',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Nur notwendige',
          showSettingsBtn: 'Einstellungen anpassen',
          footer: `
            <a href="/impressum">Impressum</a>
            <a href="/datenschutz">Datenschutzerklärung</a>
          `
        },
        settingsModal: {
          title: 'Cookie-Einstellungen',
          saveSettingsBtn: 'Einstellungen speichern',
          acceptAllBtn: 'Alle akzeptieren',
          rejectAllBtn: 'Alle ablehnen',
          closeIconLabel: 'Schließen',
          cookieTableHeaders: [
            { col1: 'Name' },
            { col2: 'Domain' },
            { col4: 'Beschreibung' }
          ],
          blocks: [
            {
              title: 'Verwendung von Cookies 🍪',
              description: 'Wir verwenden Cookies, um die grundlegenden Funktionen der Website zu gewährleisten und um Ihr Online-Erlebnis zu verbessern. Sie können für jede Kategorie wählen, ob Sie sich an- oder abmelden möchten, wann immer Sie wollen. Weitere Einzelheiten zu Cookies und anderen sensiblen Daten finden Sie in der vollständigen <a href="/datenschutz" class="cc-link">Datenschutzerklärung</a>.'
            },
            {
              title: 'Notwendige Cookies',
              description: 'Diese Cookies sind für das ordnungsgemäße Funktionieren meiner Website unerlässlich. Ohne diese Cookies würde die Website nicht richtig funktionieren.',
              category: 'necessary'
            },
            {
              title: 'Analyse-Cookies',
              description: 'Diese Cookies ermöglichen es der Website, sich an die von Ihnen getroffenen Entscheidungen zu erinnern (z. B. Ihren Benutzernamen, Ihre Sprache oder die Region, in der Sie sich befinden) und erweiterte, persönlichere Funktionen bereitzustellen.',
              category: 'analytics'
            },
            {
              title: 'Marketing-Cookies',
              description: 'Diese Cookies werden verwendet, um Besuchern auf Websites zu folgen. Die Absicht ist es, Anzeigen zu zeigen, die relevant und ansprechend für den einzelnen Nutzer sind und daher wertvoller für Publisher und werbetreibende Drittparteien sind.',
              category: 'marketing'
            },
            {
              title: 'Mehr Informationen',
              description: 'Bei Fragen zu unserer Richtlinie in Bezug auf Cookies und Ihre Auswahlmöglichkeiten wenden Sie sich bitte an uns.'
            }
          ]
        }
      }
    }
  }
};
