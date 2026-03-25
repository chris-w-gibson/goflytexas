import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ImageEditProvider } from "@/components/ImageEditContext";
import EditModeToggle from "@/components/EditModeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://goflytexas.com'),
  title: {
    default: "Go Fly Texas - Flight Training at Aero Valley Airport | Roanoke, TX",
    template: "%s | Go Fly Texas"
  },
  description: "One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Discovery flights, aircraft rentals, aerial tours, and pilot training for all levels. Call (940) 905-3090.",
  keywords: ["flight school Roanoke TX", "discovery flight Dallas Fort Worth", "flight training Texas", "learn to fly DFW", "pilot training Aero Valley Airport", "Cessna 172 rental", "aerial tours Dallas"],
  authors: [{ name: "Go Fly Texas" }],
  creator: "Go Fly Texas",
  publisher: "Go Fly Texas",
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
    siteName: 'Go Fly Texas',
    title: 'Go Fly Texas - Flight Training at Aero Valley Airport',
    description: 'One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Discovery flights, aircraft rentals, and pilot training.',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Go Fly Texas Aircraft Fleet at Aero Valley Airport'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go Fly Texas - Flight Training in DFW',
    description: 'One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Discovery flights, aircraft rentals, and pilot training.',
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
              "name": "Go Fly Texas",
              "description": "One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Discovery flights, aircraft rentals, aerial tours, and pilot training.",
              "url": "https://goflytexas.com",
              "telephone": "+1-940-905-3090",
              "email": "info@goflytexas.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "104 Boeing Way",
                "addressLocality": "Roanoke",
                "addressRegion": "TX",
                "postalCode": "76272",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "33.0462",
                "longitude": "-97.2006"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "08:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "08:00",
                  "closes": "17:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Sunday",
                  "opens": "09:00",
                  "closes": "16:00"
                }
              ],
              "priceRange": "$$",
              "sameAs": [
                "https://www.facebook.com/goflytexas",
                "https://www.instagram.com/goflytx"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Flight Training & Aviation Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "name": "Discovery Flight",
                    "description": "30-60 minute introductory flight experience"
                  },
                  {
                    "@type": "Offer",
                    "name": "Private Pilot License",
                    "description": "Complete private pilot training program"
                  },
                  {
                    "@type": "Offer",
                    "name": "Aircraft Rental",
                    "description": "Cessna 172N rental for certified pilots"
                  },
                  {
                    "@type": "Offer",
                    "name": "Aerial Tours",
                    "description": "Scenic flights over Dallas-Fort Worth"
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ImageEditProvider>
          {children}
          <EditModeToggle />
        </ImageEditProvider>
      </body>
    </html>
  );
}
