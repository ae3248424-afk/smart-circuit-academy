import { describe, expect, it } from 'vitest';
import { bookCoverUrl, referenceBookUrl } from '@/lib/book-assets';

describe('portable reference book assets', () => {
  it('opens the reference PDF from the published asset host, not Vercel', () => {
    expect(referenceBookUrl).toBe('https://smart-circuit-academy.lovable.app/__l5e/assets-v1/8d27e395-7e3d-4e12-96ca-aab5e4b71c3a/mechatronics-source.pdf');
    expect(new URL(referenceBookUrl, 'https://example.vercel.app').origin).toBe('https://smart-circuit-academy.lovable.app');
  });

  it('loads the same cover from the published asset host on external deployments', () => {
    expect(bookCoverUrl).toBe('https://smart-circuit-academy.lovable.app/__l5e/assets-v1/86add608-17d3-402c-ae16-28ecfc7d1c43/mechatronics-book-cover.jpg');
    expect(new URL(bookCoverUrl, 'https://example.vercel.app').origin).toBe('https://smart-circuit-academy.lovable.app');
  });
});