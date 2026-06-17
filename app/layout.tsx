import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ImageEditProvider } from "@/components/ImageEditContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://goflytexas.com'),
  title: {
    default: "GoFlyTexas - Flight Training at Aero Valley Airport | Roanoke, TX",
    template: "%s | GoFlyTexas"
  },
  description: "One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Aircraft rentals, aerial tours, and pilot training for all levels. Call (940) 905-3090.",
  keywords: ["flight school Roanoke TX", "flight training Dallas Fort Worth", "flight training Texas", "learn to fly DFW", "pilot training Aero Valley Airport", "Cessna 172 rental", "aerial tours Dallas"],
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
    title: 'GoFlyTexas - Flight Training at Aero Valley Airport',
    description: 'One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Aircraft rentals and pilot training for all levels.',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'GoFlyTexas Aircraft Fleet at Aero Valley Airport'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoFlyTexas - Flight Training in DFW',
    description: 'One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Aircraft rentals and pilot training for all levels.',
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
              "description": "One-on-one flight training at Aero Valley Airport in Roanoke, Texas. Aircraft rentals, aerial tours, and pilot training.",
              "url": "https://goflytexas.com",
              "telephone": "+1-940-905-3090",
              "email": "info@goflytexas.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "104 Boeing Way",
                "addressLocality": "Roanoke",
                "addressRegion": "TX",
                "postalCode": "76262",
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
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  "opens": "08:00",
                  "closes": "17:00"
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
        {/* Google Ads global site tag (gtag.js) — Conversion ID AW-986774654 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-986774654"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-986774654');
          `}
        </Script>
        <ImageEditProvider>
          {children}
        </ImageEditProvider>
      </body>
    </html>
  );
}
