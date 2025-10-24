import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://goflytexas.com'),
  title: {
    default: "GoFlyTexas - Discovery Flights & Flight Training in Dallas",
    template: "%s | GoFlyTexas"
  },
  description: "Experience the thrill of flying with GoFlyTexas. Professional flight training and discovery flights in Dallas, Texas. Start your aviation journey today!",
  keywords: ["discovery flight Dallas", "flight school Texas", "learn to fly Dallas", "pilot training Texas", "aviation school Dallas"],
  authors: [{ name: "GoFlyTexas" }],
  creator: "GoFlyTexas",
  publisher: "GoFlyTexas",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://goflytexas.com',
    siteName: 'GoFlyTexas',
    title: 'GoFlyTexas - Discovery Flights & Flight Training in Dallas',
    description: 'Experience the thrill of flying with GoFlyTexas. Professional flight training and discovery flights in Dallas, Texas.',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'GoFlyTexas Aircraft'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoFlyTexas - Discovery Flights & Flight Training',
    description: 'Experience the thrill of flying with GoFlyTexas. Professional flight training and discovery flights in Dallas, Texas.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://goflytexas.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FlightSchool",
              "name": "GoFlyTexas",
              "description": "Professional flight training and discovery flights in Dallas, Texas",
              "url": "https://goflytexas.com",
              "telephone": "+1-XXX-XXX-XXXX",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Airport Address",
                "addressLocality": "Dallas",
                "addressRegion": "TX",
                "postalCode": "75001",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "32.7767",
                "longitude": "-96.7970"
              },
              "openingHours": "Mo-Su 08:00-18:00",
              "priceRange": "$$",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Flight Training Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "name": "Discovery Flight",
                    "description": "30-minute introductory flight experience"
                  },
                  {
                    "@type": "Offer",
                    "name": "Private Pilot License",
                    "description": "Complete private pilot training program"
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}