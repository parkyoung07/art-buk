const fs = require('fs');

const html = fs.readFileSync('.next/server/app/blog.html', 'utf8');
const t = html.match(/<title>(.*?)<\/title>/);
const og = html.match(/<meta property="og:title" content="(.*?)"/);
const tw = html.match(/<meta name="twitter:title" content="(.*?)"/);

console.log('Title:', t ? t[1] : 'NONE');
console.log('OG Title:', og ? og[1] : 'NONE');
console.log('Twitter Title:', tw ? tw[1] : 'NONE');
