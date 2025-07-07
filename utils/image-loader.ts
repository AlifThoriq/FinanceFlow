export default function imageLoader({ src }: { src: string }) {
  try {
    const url = new URL(src);
    
    // Optimized domains - let Next.js handle normally
    const optimizedDomains = [
      'coin-images.coingecko.com',
      // Tambah domain lain yang mau di-optimize
    ];
    
    if (optimizedDomains.includes(url.hostname)) {
      // Return as-is untuk domains yang sudah di-configure
      return src;
    }
    
    // Bypass optimization untuk domains lain (news images, etc)
    return src;
  } catch {
    // Fallback jika URL parsing gagal
    return src;
  }
}
