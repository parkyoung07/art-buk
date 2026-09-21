async function checkLive() {
  const urls = [
    'https://art-buk.pages.dev/blog/2026-09-21-library-busan-sasang-main/',
    'https://nadriai.com/blog/2026-09-21-library-busan-sasang-main/',
    'https://art-buk.pages.dev/blog/2026-09-20-library-busan-sasang-main/',
    'https://nadriai.com/blog/2026-09-20-library-busan-sasang-main/'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
      const text = await res.text();
      console.log('==================================================');
      console.log('🌐 URL:', u, 'Status:', res.status);
      const imgMatches = text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/g) || [];
      imgMatches.forEach(m => console.log('   IMG:', m));
    } catch (e) {
      console.log('ERR', u, e.message);
    }
  }
}
checkLive();
