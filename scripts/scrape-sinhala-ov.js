/**
 * Sinhala OV 1938 Bible Scraper
 * Source: http://chamathwebs.com/bible_shb_ov/
 *
 * Usage:
 *   npm install puppeteer --save-dev
 *   node scripts/scrape-sinhala-ov.js
 *
 * Output: public/SinhalaOVBible.xml  (same format as SinhalaSROVBible.xml)
 * Time: ~30-60 minutes for all 66 books
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://chamathwebs.com/bible_shb_ov/index.asp';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'SinhalaOVBible.xml');
const PROGRESS_FILE = path.join(__dirname, '..', 'public', 'SinhalaOVBible_progress.json');

// Books with chapter counts (standard Protestant canon)
const BOOKS = [
  { num: 1,  sinhala: 'උත්පත්ති',                 chapters: 50, testament: 'Old' },
  { num: 2,  sinhala: 'නික්මයාම',                  chapters: 40, testament: 'Old' },
  { num: 3,  sinhala: 'ලෙවී කථාව',                chapters: 27, testament: 'Old' },
  { num: 4,  sinhala: 'ගණන් කථාව',               chapters: 36, testament: 'Old' },
  { num: 5,  sinhala: 'ද්වීතීය කථාව',            chapters: 34, testament: 'Old' },
  { num: 6,  sinhala: 'යෝෂුවා',                   chapters: 24, testament: 'Old' },
  { num: 7,  sinhala: 'විනිශ්චයකාරයන්ගේ පොත',  chapters: 21, testament: 'Old' },
  { num: 8,  sinhala: 'රූත්',                      chapters: 4,  testament: 'Old' },
  { num: 9,  sinhala: '1 සාමුවෙල්',              chapters: 31, testament: 'Old' },
  { num: 10, sinhala: '2 සාමුවෙල්',              chapters: 24, testament: 'Old' },
  { num: 11, sinhala: '1 රාජාවලිය',              chapters: 22, testament: 'Old' },
  { num: 12, sinhala: '2 රාජාවලිය',              chapters: 25, testament: 'Old' },
  { num: 13, sinhala: '1 ලේකම්',                 chapters: 29, testament: 'Old' },
  { num: 14, sinhala: '2 ලේකම්',                 chapters: 36, testament: 'Old' },
  { num: 15, sinhala: 'එස්රා',                    chapters: 10, testament: 'Old' },
  { num: 16, sinhala: 'නෙහෙමියා',                chapters: 13, testament: 'Old' },
  { num: 17, sinhala: 'එස්තර්',                  chapters: 10, testament: 'Old' },
  { num: 18, sinhala: 'යෝබ්',                     chapters: 42, testament: 'Old' },
  { num: 19, sinhala: 'ගීතාවලිය',               chapters: 150, testament: 'Old' },
  { num: 20, sinhala: 'හිතෝපදේශ',               chapters: 31, testament: 'Old' },
  { num: 21, sinhala: 'දේශනාකාරයා',            chapters: 12, testament: 'Old' },
  { num: 22, sinhala: 'සාලමොන්ගේ ගීතිකාව',  chapters: 8,  testament: 'Old' },
  { num: 23, sinhala: 'යෙසායා',                  chapters: 66, testament: 'Old' },
  { num: 24, sinhala: 'යෙරමියා',                 chapters: 52, testament: 'Old' },
  { num: 25, sinhala: 'විලාප ගී',               chapters: 5,  testament: 'Old' },
  { num: 26, sinhala: 'එසකියෙල්',               chapters: 48, testament: 'Old' },
  { num: 27, sinhala: 'දානියෙල්',                chapters: 12, testament: 'Old' },
  { num: 28, sinhala: 'හොෂෙයා',                 chapters: 14, testament: 'Old' },
  { num: 29, sinhala: 'යෝවෙල්',                 chapters: 3,  testament: 'Old' },
  { num: 30, sinhala: 'ආමොස්',                  chapters: 9,  testament: 'Old' },
  { num: 31, sinhala: 'ඔබදියා',                 chapters: 1,  testament: 'Old' },
  { num: 32, sinhala: 'යෝනා',                    chapters: 4,  testament: 'Old' },
  { num: 33, sinhala: 'මීකා',                    chapters: 7,  testament: 'Old' },
  { num: 34, sinhala: 'නාහුම්',                 chapters: 3,  testament: 'Old' },
  { num: 35, sinhala: 'හබක්කුක්',              chapters: 3,  testament: 'Old' },
  { num: 36, sinhala: 'ශෙපනියා',               chapters: 3,  testament: 'Old' },
  { num: 37, sinhala: 'හග්ගයි',                chapters: 2,  testament: 'Old' },
  { num: 38, sinhala: 'සෙකරියා',               chapters: 14, testament: 'Old' },
  { num: 39, sinhala: 'මලාකි',                 chapters: 4,  testament: 'Old' },
  { num: 40, sinhala: 'මතෙව්',                  chapters: 28, testament: 'New' },
  { num: 41, sinhala: 'මාර්ක්',                 chapters: 16, testament: 'New' },
  { num: 42, sinhala: 'ලූක්',                    chapters: 24, testament: 'New' },
  { num: 43, sinhala: 'යොහන්',                   chapters: 21, testament: 'New' },
  { num: 44, sinhala: 'ක්‍රියා',                chapters: 28, testament: 'New' },
  { num: 45, sinhala: 'රෝම',                     chapters: 16, testament: 'New' },
  { num: 46, sinhala: '1 කොරින්ති',             chapters: 16, testament: 'New' },
  { num: 47, sinhala: '2 කොරින්ති',             chapters: 13, testament: 'New' },
  { num: 48, sinhala: 'ගලාති',                  chapters: 6,  testament: 'New' },
  { num: 49, sinhala: 'එපීස',                   chapters: 6,  testament: 'New' },
  { num: 50, sinhala: 'පිලිප්පි',              chapters: 4,  testament: 'New' },
  { num: 51, sinhala: 'කොලොස්සි',              chapters: 4,  testament: 'New' },
  { num: 52, sinhala: '1 තෙසලෝනික',            chapters: 5,  testament: 'New' },
  { num: 53, sinhala: '2 තෙසලෝනික',            chapters: 3,  testament: 'New' },
  { num: 54, sinhala: '1 තිමෝති',              chapters: 6,  testament: 'New' },
  { num: 55, sinhala: '2 තිමෝති',              chapters: 4,  testament: 'New' },
  { num: 56, sinhala: 'තීතස්',                 chapters: 3,  testament: 'New' },
  { num: 57, sinhala: 'පිලෙමොන්',             chapters: 1,  testament: 'New' },
  { num: 58, sinhala: 'හෙබ්‍රෙව්',            chapters: 13, testament: 'New' },
  { num: 59, sinhala: 'යාකොබ්',                chapters: 5,  testament: 'New' },
  { num: 60, sinhala: '1 පේත්‍රැස්',          chapters: 5,  testament: 'New' },
  { num: 61, sinhala: '2 පේත්‍රැස්',          chapters: 3,  testament: 'New' },
  { num: 62, sinhala: '1 යොහන්',               chapters: 5,  testament: 'New' },
  { num: 63, sinhala: '2 යොහන්',               chapters: 1,  testament: 'New' },
  { num: 64, sinhala: '3 යොහන්',               chapters: 1,  testament: 'New' },
  { num: 65, sinhala: 'යූදස්',                 chapters: 1,  testament: 'New' },
  { num: 66, sinhala: 'එළිදරව්ව',             chapters: 22, testament: 'New' },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Load saved progress (allows resuming)
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return {};
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

async function navigateToChapter(page, bookIndex, chapterIndex) {
  // bookIndex = 0-based index into the navigation menu
  // The site uses Bootstrap dropdowns: clicking book opens chapter list

  // Click the correct book link in the navbar
  await page.evaluate((bookIdx) => {
    // Get all dropdown items in the navbar
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    // First dropdown = Old Testament, second = New Testament
    // Find the book by index across all dropdowns
    let allBooks = [];
    document.querySelectorAll('.dropdown-menu .dropdown-menu').forEach(sub => {
      sub.querySelectorAll('a').forEach(a => allBooks.push(a));
    });
    if (!allBooks.length) {
      // Flat structure
      document.querySelectorAll('.dropdown-menu a').forEach(a => allBooks.push(a));
    }
    if (allBooks[bookIdx]) {
      allBooks[bookIdx].click();
    }
  }, bookIndex);

  await sleep(800);

  // Now click chapter button
  await page.evaluate((chapIdx) => {
    const chapBtns = document.querySelectorAll('.chapter-select a, .chapters a, a[onclick*="chapter"], a.chapter-btn, #chapterList a, .chapter-list a');
    if (chapBtns[chapIdx]) {
      chapBtns[chapIdx].click();
      return;
    }
    // Fallback: find button with text = chapter number
    const allLinks = Array.from(document.querySelectorAll('a, button'));
    const target = allLinks.find(el => el.textContent.trim() === String(chapIdx + 1));
    if (target) target.click();
  }, chapterIndex);

  await sleep(1200);
}

async function extractVerses(page) {
  return await page.evaluate(() => {
    const isSinhala = text => /[඀-෿]/.test(text);

    // Strategy 1: look for numbered verse elements
    const verseEls = document.querySelectorAll('[class*="verse"], [id*="verse"], p[id^="v"]');
    if (verseEls.length > 0) {
      const verses = [];
      verseEls.forEach(el => {
        const numEl = el.querySelector('sup, .vn, .verse-num, b');
        const num = numEl ? parseInt(numEl.textContent) : null;
        const clone = el.cloneNode(true);
        if (clone.querySelector('sup')) clone.querySelector('sup').remove();
        const text = clone.textContent.trim();
        if (isSinhala(text) && num) {
          verses.push({ num, text });
        }
      });
      if (verses.length > 0) return verses;
    }

    // Strategy 2: find the main content div and parse superscript numbers
    const contentDivs = [
      document.querySelector('#content'),
      document.querySelector('.content'),
      document.querySelector('main'),
      document.querySelector('#chapter-content'),
      document.querySelector('.chapter-content'),
      document.querySelector('#bible'),
      document.querySelector('.bible'),
    ].filter(Boolean);

    for (const div of contentDivs) {
      const text = div.textContent;
      if (!isSinhala(text)) continue;

      // Parse superscript elements as verse markers
      const sups = Array.from(div.querySelectorAll('sup'));
      if (sups.length > 0) {
        const verses = [];
        for (let i = 0; i < sups.length; i++) {
          const num = parseInt(sups[i].textContent.trim());
          if (isNaN(num)) continue;
          // Get text between this sup and the next
          let node = sups[i].nextSibling;
          let verseText = '';
          while (node && node !== sups[i + 1]) {
            if (node.nodeType === Node.TEXT_NODE) verseText += node.textContent;
            else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SUP') verseText += node.textContent;
            node = node.nextSibling;
          }
          verseText = verseText.trim();
          if (isSinhala(verseText)) {
            verses.push({ num, text: verseText });
          }
        }
        if (verses.length > 0) return verses;
      }
    }

    // Strategy 3: get all Sinhala text blocks and try to find verse structure
    const allText = document.body.innerText;
    // Look for pattern: number followed by Sinhala text
    const matches = [...allText.matchAll(/(\d+)\s+([^\d\n]{10,300})/g)];
    if (matches.length > 3) {
      return matches.slice(0, 200).map(m => ({
        num: parseInt(m[1]),
        text: m[2].trim()
      })).filter(v => isSinhala(v.text));
    }

    return [];
  });
}

async function scrapeBook(page, book, progress) {
  const bookKey = `book_${book.num}`;
  if (progress[bookKey] && progress[bookKey].done) {
    console.log(`  ✅ Book ${book.num} already done, skipping`);
    return progress[bookKey].chapters;
  }

  const bookData = [];

  for (let ch = 1; ch <= book.chapters; ch++) {
    const chKey = `${bookKey}_ch_${ch}`;
    if (progress[chKey]) {
      console.log(`    ✓ Ch ${ch} cached`);
      bookData.push({ chapter: ch, verses: progress[chKey] });
      continue;
    }

    console.log(`    Scraping ${book.sinhala} ch ${ch}/${book.chapters}...`);

    // Navigate using the book index (0-based) and chapter (1-based)
    await navigateToChapter(page, book.num - 1, ch - 1);

    let verses = await extractVerses(page);

    // If nothing found, try waiting longer and retry
    if (verses.length === 0) {
      await sleep(2000);
      verses = await extractVerses(page);
    }

    if (verses.length === 0) {
      console.warn(`    ⚠️  No verses found for ${book.sinhala} ${ch}`);
      // Save empty to avoid infinite retry
      verses = [];
    }

    progress[chKey] = verses;
    saveProgress(progress);

    bookData.push({ chapter: ch, verses });
    await sleep(300); // be polite to the server
  }

  progress[bookKey] = { done: true, chapters: bookData };
  saveProgress(progress);
  return bookData;
}

function generateXml(allData) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<bible translation="Sinhala Holy Bible - Old Version (OV 1938)" status="Ceylon Bible Society" link="http://chamathwebs.com/bible_shb_ov/">\n';

  let currentTestament = null;

  for (const { book, chapters } of allData) {
    if (book.testament !== currentTestament) {
      if (currentTestament !== null) {
        xml += `\t</testament>\n`;
      }
      currentTestament = book.testament;
      xml += `\t<testament name="${book.testament}">\n`;
    }

    xml += `\t\t<book number="${book.num}">\n`;
    for (const { chapter, verses } of chapters) {
      xml += `\t\t\t<chapter number="${chapter}">\n`;
      for (const { num, text } of verses) {
        xml += `\t\t\t\t<verse number="${num}">${escapeXml(text)}</verse>\n`;
      }
      xml += `\t\t\t</chapter>\n`;
    }
    xml += `\t\t</book>\n`;
  }

  if (currentTestament !== null) {
    xml += `\t</testament>\n`;
  }
  xml += '</bible>\n';
  return xml;
}

async function main() {
  console.log('🕊️  Sinhala OV 1938 Bible Scraper');
  console.log('=====================================');
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log('');

  const progress = loadProgress();

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 }
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Block redirects to ceylonbiblesociety.org (site is down for maintenance)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('ceylonbiblesociety.org')) {
      console.log('🚫 Blocked redirect to:', url);
      req.abort();
    } else {
      req.continue();
    }
  });

  // Intercept network requests to discover data endpoints
  const dataUrls = [];
  page.on('response', async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (url.includes('chamathwebs') && !url.match(/\.(js|css|png|gif|ico|jpg|woff|ttf|svg)($|\?)/i)) {
      dataUrls.push(`[${res.status()}] ${url}`);
      if (ct.includes('json') || ct.includes('xml')) {
        try {
          const text = await res.text();
          if (text.length > 50) console.log(`📥 Data: ${url}\n   ${text.substring(0, 200)}`);
        } catch(e) {}
      }
    }
  });

  console.log(`📡 Loading ${BASE_URL}...`);
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch(e) {
    console.log('Navigation note:', e.message);
  }
  await sleep(2000);

  console.log('All chamathwebs URLs seen:', dataUrls);

  // Quick DOM inspection
  const domInfo = await page.evaluate(() => {
    return {
      title: document.title,
      navLinks: Array.from(document.querySelectorAll('nav a, .navbar a')).slice(0, 10).map(a => ({
        text: a.textContent.trim().substring(0, 30),
        href: a.href,
        onclick: a.getAttribute('onclick')?.substring(0, 50)
      })),
      hasContent: document.body.innerText.length,
    };
  });

  console.log('\n🔍 DOM inspection:', JSON.stringify(domInfo, null, 2));
  console.log('\nStarting book scrape in 3 seconds...');
  await sleep(3000);

  const allData = [];

  for (const book of BOOKS) {
    console.log(`\n📖 Book ${book.num}/66: ${book.sinhala} (${book.chapters} chapters)`);
    const chapters = await scrapeBook(page, book, progress);
    allData.push({ book, chapters });
  }

  console.log('\n✅ All books scraped. Generating XML...');
  const xml = generateXml(allData);
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf-8');

  console.log(`\n🎉 Done! Saved to: ${OUTPUT_FILE}`);
  console.log(`Total size: ${(xml.length / 1024).toFixed(1)} KB`);

  await browser.close();

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
