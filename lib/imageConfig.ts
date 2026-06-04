// Image configuration - maps location IDs to image paths
export interface ImageConfig {
  [locationId: string]: string | null;
}

// Default image assignments
export const defaultImageConfig: ImageConfig = {
  // Hero section
  'hero-main': '/4501E and 738UY.jpg',
  'hero-background': null,

  // Aircraft page - N4501E carousel (maroon stripe)
  'aircraft-n4501e-main': '/4501E in T Hangar.jpg',
  'aircraft-n4501e-1': '/IMG_4961.jpeg',
  'aircraft-n4501e-2': '/IMG_4962.jpeg',
  'aircraft-n4501e-3': '/IMG_4963.jpeg',
  'aircraft-n4501e-4': '/4501E GFT Logo in Background.jpg',

  // Aircraft page - N5217D carousel (brown/copper stripe; tan/brown leather interior)
  'aircraft-n5217d-main': '/IMG_4957.jpeg',
  'aircraft-n5217d-1': '/IMG_4958.jpeg',
  'aircraft-n5217d-2': '/IMG_4960.jpeg',
  'aircraft-n5217d-3': null,
  'aircraft-n5217d-4': null,

  // Aircraft page - N738UY carousel (blue stripe)
  'aircraft-n738uy-main': '/IMG_4954.jpeg',
  'aircraft-n738uy-1': '/n738uy-ramp.jpg',
  'aircraft-n738uy-2': '/IMG_4955.jpeg',
  'aircraft-n738uy-3': '/n738uy-panel.jpg',
  'aircraft-n738uy-4': null,

  // Aircraft page - N737ET carousel (red stripe)
  'aircraft-n737et-main': '/IMG_4964.jpeg',
  'aircraft-n737et-1': '/N737ET-hangar.jpg',
  'aircraft-n737et-2': '/n737et-ramp-sunny.jpg',
  'aircraft-n737et-3': '/IMG_4965.jpeg',
  'aircraft-n737et-4': null,

  // Aircraft page - N5550J carousel (not on /aircraft page; legacy slots kept for reference)
  'aircraft-n5550j-main': '/5550J-in-Cali.png',
  'aircraft-n5550j-1': '/B88773E1-BA65-43D1-A60C-355E8E7FE5D0.JPG',
  'aircraft-n5550j-2': null,
  'aircraft-n5550j-3': null,
  'aircraft-n5550j-4': null,

  'aircraft-hero-background': '/B88773E1-BA65-43D1-A60C-355E8E7FE5D0.JPG',

  // Homepage sections
  'home-cta-background': '/IMG_4239.JPG',
  'home-services-background': null,
  'home-about-background': '/fleet-in-hangar.jpg',

  // Our Team
  'team-hero-background': '/solo-celebration.jpg',
  'team-cta-background': null,

  // Contact
  'contact-hero-background': null,

  // Flight Training pages
  'private-pilot-hero': '/student-pilot-cockpit.jpg',
  'instrument-hero': '/IMG_4569.jpg',
  'commercial-hero': '/cessna-ramp-sunny.jpg',
  'cfi-academy-hero': '/cessna-hangar-red.jpg',
};

// Available images in the public folder
export const availableImages = [
  // Logos
  { path: '/Logo.png', name: 'Logo' },
  { path: '/logo-new.png', name: 'Logo (New)' },

  // Fleet & Hangar
  { path: '/4501E and 738UY.jpg', name: 'Fleet at Sunset' },
  { path: '/4501E in T Hangar.jpg', name: 'N4501E in T-Hangar' },
  { path: '/4501E GFT Logo in Background.jpg', name: 'N4501E Front View with Logo' },
  { path: '/5550J-in-Cali.png', name: 'N5550J SkyHawk at Sunset' },
  { path: '/B88773E1-BA65-43D1-A60C-355E8E7FE5D0.JPG', name: 'Fleet Exterior at Hangar' },
  { path: '/IMG_4239.JPG', name: '3 Aircraft Lineup at Hangar' },
  { path: '/IMG_4432.JPG', name: '3 Aircraft Lineup (Alternate)' },
  { path: '/fleet-in-hangar.jpg', name: 'Two Planes in Hangar with GFT Logo' },

  // N4501E (maroon stripe)
  { path: '/IMG_4961.jpeg', name: 'N4501E Exterior - Hangar Side' },
  { path: '/IMG_4962.jpeg', name: 'N4501E Interior (Gray Seats)' },
  { path: '/IMG_4963.jpeg', name: 'N4501E Cockpit Panel' },

  // N5217D (brown/copper stripe)
  { path: '/IMG_4957.jpeg', name: 'N5217D Exterior - Hangar w/ Texas Flag' },
  { path: '/IMG_4958.jpeg', name: 'N5217D Interior (Brown Seats)' },
  { path: '/IMG_4960.jpeg', name: 'N5217D Cockpit Panel' },

  // N738UY (blue stripe)
  { path: '/IMG_4954.jpeg', name: 'N738UY Exterior - In Hangar' },
  { path: '/IMG_4955.jpeg', name: 'N738UY Interior (Tan Seats)' },
  { path: '/n738uy-panel.jpg', name: 'N738UY Cockpit Panel (Skyhawk II)' },

  // N737ET (red stripe)
  { path: '/IMG_4964.jpeg', name: 'N737ET Exterior - Hangar w/ Texas Flag' },
  { path: '/IMG_4965.jpeg', name: 'N737ET Cockpit Panel (Wood Trim)' },
  { path: '/n738uy-ramp.jpg', name: 'N738UY on Ramp (Blue)' },
  { path: '/cessna-ramp-sunny.jpg', name: 'Cessna on Ramp - Sunny Day' },
  { path: '/cessna-hangar-red.jpg', name: 'Cessna in Hangar (Red Stripes)' },

  // Flight & Cockpit
  { path: '/IMG_4569.jpg', name: 'Cockpit Approach View' },
  { path: '/student-pilot-cockpit.jpg', name: 'Student Pilot in Cockpit' },

  // People & Events
  { path: '/solo-celebration.jpg', name: 'Solo Flight Celebration' },

  // Promotional
  { path: '/IMG_4430.jpg', name: 'Logo Banner' },
  { path: '/IMG_1101+(2).jpg', name: 'Aircraft with Lens Flare' },
  { path: '/Moto.jpg', name: 'Motto Image' },
  { path: '/og-image.jpg', name: 'Social Share Image (OG)' },

  // Stock Photos
  { path: '/unsplash-image-yQorCngxzwI.jpg', name: 'Clouds Sky' },
  { path: '/unsplash-image-ZEiqbaQhmvE.jpg', name: 'Unsplash Aviation 2' },
  { path: '/unsplash-image-NwGMe-NuDm0.jpg', name: 'Unsplash Aviation 3' },
];
