/**
 * One-time analysis of the inspiration zips. Reads HTML, extracts SEO signals
 * and writes a markdown summary to ideas/INSPIRATION_REPORT.md (also gitignored).
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(process.cwd(), 'Ideas-Do not upload or push anywhere');
const OUT = path.join(BASE, 'INSPIRATION_REPORT.md');

function findFiles(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) findFiles(full, ext, results);
    else if (name.toLowerCase().endsWith(ext)) results.push(full);
  }
  return results;
}

function analyzeHtml(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const title = (content.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
  const desc = (content.match(/<meta\s+name="description"\s+content="([^"]+)"/) || [])[1] || '';
  const ogTitle = (content.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) || [])[1] || '';
  const canonical = (content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/) || [])[1] || '';
  const h1Count = (content.match(/<h1\b/g) || []).length;
  const h2Count = (content.match(/<h2\b/g) || []).length;
  const h3Count = (content.match(/<h3\b/g) || []).length;
  const schemaCount = (content.match(/application\/ld\+json/g) || []).length;
  const links = [...content.matchAll(/<a\s+[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const internalLinks = links.filter((l) => !l.startsWith('http') || l.includes('flowrealty') || l.includes('rustomjee'));

  // Pull H2 texts to understand section structure
  const h2Texts = [...content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 30);

  return {
    file: filePath,
    sizeKB: Math.round(fs.statSync(filePath).size / 1024),
    title,
    desc: desc.slice(0, 200),
    ogTitle,
    canonical,
    h1Count,
    h2Count,
    h3Count,
    schemaCount,
    totalLinks: links.length,
    internalLinks: internalLinks.length,
    h2Texts,
  };
}

const flowDir = path.join(BASE, 'flowrealty-current');
const rustomjeeDir = path.join(BASE, 'rustomjee-inspiration');

const flowFiles = findFiles(flowDir, '.html');
const rustFiles = findFiles(rustomjeeDir, '.html');

const lines = [];
lines.push('# Inspiration & Current Site Analysis');
lines.push('');
lines.push(`Generated ${new Date().toISOString()}`);
lines.push('');
lines.push('## Flow Realty (current WordPress site)');
lines.push('');
for (const f of flowFiles.slice(0, 10)) {
  const a = analyzeHtml(f);
  lines.push(`### \`${path.relative(BASE, f)}\``);
  lines.push(`- Size: ${a.sizeKB} KB`);
  lines.push(`- Title: \`${a.title}\``);
  lines.push(`- Description: ${a.desc}`);
  lines.push(`- Canonical: ${a.canonical || '(none)'}`);
  lines.push(`- Headings: H1=${a.h1Count}, H2=${a.h2Count}, H3=${a.h3Count}`);
  lines.push(`- Schema.org blocks: ${a.schemaCount}`);
  lines.push(`- Total links: ${a.totalLinks} (internal-ish: ${a.internalLinks})`);
  if (a.h2Texts.length) {
    lines.push('- H2 sections:');
    a.h2Texts.forEach((t) => lines.push(`  - ${t.slice(0, 100)}`));
  }
  lines.push('');
}

lines.push('## Rustomjee (inspiration)');
lines.push('');
for (const f of rustFiles.slice(0, 10)) {
  const a = analyzeHtml(f);
  lines.push(`### \`${path.relative(BASE, f)}\``);
  lines.push(`- Size: ${a.sizeKB} KB`);
  lines.push(`- Title: \`${a.title}\``);
  lines.push(`- Description: ${a.desc}`);
  lines.push(`- Canonical: ${a.canonical || '(none)'}`);
  lines.push(`- Headings: H1=${a.h1Count}, H2=${a.h2Count}, H3=${a.h3Count}`);
  lines.push(`- Schema.org blocks: ${a.schemaCount}`);
  lines.push(`- Total links: ${a.totalLinks} (internal-ish: ${a.internalLinks})`);
  if (a.h2Texts.length) {
    lines.push('- H2 sections:');
    a.h2Texts.forEach((t) => lines.push(`  - ${t.slice(0, 100)}`));
  }
  lines.push('');
}

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote ${OUT}`);
console.log(`Flow Realty pages analysed: ${flowFiles.length}`);
console.log(`Rustomjee pages analysed: ${rustFiles.length}`);
