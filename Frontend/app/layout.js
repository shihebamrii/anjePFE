// Import the global CSS stylesheet (handles tailwind configurations and styles)
import './globals.css';
// Import the global Authentication Provider wrapper
import { AuthProvider } from '@/context/AuthContext';

// Define metadata SEO tags for the university portal pages
export const metadata = {
  title: 'ISET Gafsa - Institut Supérieur des Études Technologiques',
  description: 'Portail universitaire de l\'Institut Supérieur des Études Technologiques de Gafsa — Excellence & Innovation',
  keywords: 'ISET, Gafsa, formation, technologie, enseignement supérieur, Tunisie, université',
};

// Root Layout component that wraps the entire web application structure
export default function RootLayout({ children }) {
  return (
    // Set language to French and disable theme flashing console warnings on hydration
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Preconnect to Google Fonts for faster typography loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Inter and Playfair Display fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Wrap all children components with the AuthProvider so authentication context is globally accessible */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
