import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'ISET Gafsa - Institut Supérieur des Études Technologiques',
  description: 'Portail universitaire de l\'Institut Supérieur des Études Technologiques de Gafsa — Excellence & Innovation',
  keywords: 'ISET, Gafsa, formation, technologie, enseignement supérieur, Tunisie, université',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
