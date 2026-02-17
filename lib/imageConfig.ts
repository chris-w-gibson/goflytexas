// Image configuration - maps location IDs to image paths
export interface ImageConfig {
  [locationId: string]: string | null;
}

// Default image assignments
export const defaultImageConfig: ImageConfig = {
  // Hero section
  'hero-main': '/4501E and 738UY.jpg',
  'hero-background': null,

  // Aircraft page - N4501E carousel
  'aircraft-n4501e-main': '/4501E in T Hangar.jpg',
  'aircraft-n4501e-1': '/4501E GFT Logo in Background.jpg',
  'aircraft-n4501e-2': '/IMG_4955.jpeg',
  'aircraft-n4501e-3': null,
  'aircraft-n4501e-4': null,

  // Aircraft page - N5217D carousel
  'aircraft-n5217d-main': '/IMG_4960.jpeg',
  'aircraft-n5217d-1': null,
  'aircraft-n5217d-2': null,
  'aircraft-n5217d-3': null,
  'aircraft-n5217d-4': null,

  // Aircraft page - N738UY carousel
  'aircraft-n738uy-main': '/IMG_4954.jpeg',
  'aircraft-n738uy-1': '/4501E and 738UY.jpg',
  'aircraft-n738uy-2': null,
  'aircraft-n738uy-3': null,
  'aircraft-n738uy-4': null,

  // Aircraft page - 4th plane (update registration)
  'aircraft-n0000x-main': null,
  'aircraft-n0000x-1': null,
  'aircraft-n0000x-2': null,
  'aircraft-n0000x-3': null,
  'aircraft-n0000x-4': null,

  'aircraft-hero-background': null,

  // Discovery flight
  'discovery-hero': '/IMG_4569.jpg',
  'discovery-background': null,

  // Homepage sections
  'home-cta-background': null,
  'home-services-background': null,
  'home-about-background': null,

  // Our Team
  'team-hero-background': null,
  'team-cta-background': null,

  // Contact
  'contact-hero-background': null,

  // Flight Training pages
  'private-pilot-hero': null,
  'instrument-hero': null,
  'commercial-hero': null,
  'cfi-academy-hero': null,
};

// Available images in the public folder
export const availableImages = [
  { path: '/Logo.png', name: 'Logo' },
  { path: '/4501E GFT Logo in Background.jpg', name: '4501E Front View with Logo' },
  { path: '/4501E and 738UY.jpg', name: 'Fleet at Sunset' },
  { path: '/4501E in T Hangar.jpg', name: 'N4501E in Hangar' },
  { path: '/IMG_4954.jpeg', name: 'N738UY in Hangar' },
  { path: '/IMG_4955.jpeg', name: 'Aircraft Interior' },
  { path: '/IMG_4956.jpeg', name: 'IMG_4956' },
  { path: '/IMG_4957.jpeg', name: 'IMG_4957' },
  { path: '/IMG_4958.jpeg', name: 'IMG_4958' },
  { path: '/IMG_4960.jpeg', name: 'N5217D Cockpit' },
  { path: '/IMG_4961.jpeg', name: 'IMG_4961' },
  { path: '/IMG_4962.jpeg', name: 'IMG_4962' },
  { path: '/IMG_4963.jpeg', name: 'IMG_4963' },
  { path: '/IMG_4964.jpeg', name: 'IMG_4964' },
  { path: '/IMG_4965.jpeg', name: 'IMG_4965' },
  { path: '/IMG_4569.jpg', name: 'Cockpit Approach View' },
  { path: '/IMG_4430.jpg', name: 'Logo Banner' },
  { path: '/IMG_1101+(2).jpg', name: 'Aircraft with Lens Flare' },
  { path: '/Moto.jpg', name: 'Moto' },
  { path: '/unsplash-image-yQorCngxzwI.jpg', name: 'Clouds Sky' },
  { path: '/unsplash-image-ZEiqbaQhmvE.jpg', name: 'Unsplash 2' },
  { path: '/unsplash-image-NwGMe-NuDm0.jpg', name: 'Unsplash 3' },
  { path: '/tempImageTUnVGB.jpg', name: 'Temp Image 1' },
  { path: '/tempImageft4QAu.jpg', name: 'Temp Image 2' },
  { path: '/tempImageQHtTQX.jpg', name: 'Temp Image 3' },
  { path: '/tempImaget9JWNB.jpg', name: 'Temp Image 4' },
  { path: '/tempImageXJFvll.jpg', name: 'Temp Image 5' },
];
