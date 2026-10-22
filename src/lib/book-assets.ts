import cover from '@/assets/mechatronics-book-cover.asset.json';
import source from '@/assets/mechatronics-source.asset.json';

// Lovable serves these paths; external hosts such as Vercel do not.
const assetOrigin = 'https://smart-circuit-academy.lovable.app';

export const bookCoverUrl = new URL(cover.url, assetOrigin).href;
export const referenceBookUrl = new URL(source.url, assetOrigin).href;