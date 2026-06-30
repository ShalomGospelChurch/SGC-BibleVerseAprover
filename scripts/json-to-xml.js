/**
 * Converte bible_ov_export.json → public/SinhalaOVBible.xml
 *
 * Formati JSON accettati:
 * A) [{ "b": 1, "c": 1, "v": 1, "t": "testo..." }, ...]  ← theWord export
 * B) [{ "book": 1, "chapter": 1, "verse": 1, "text": "..." }, ...]
 * C) [{ "BookNumber": 1, "ChapterNumber": 1, "VerseNumber": 1, "VerseText": "..." }, ...]
 */

const fs = require('fs');
const path = require('path');

// Cerca il file JSON in posizioni comuni
const candidates = [
  process.argv[2],
  path.join(__dirname, '..', 'public', 'bible_ov_export.json'),
  path.join(__dirname, '..', 'scripts', 'bible_ov_export.json'),
  path.join(require('os').homedir(), '.wine/drive_c/bible_ov_export.json'),
  'bible_ov_export.json',
].filter(Boolean);

let inputFile = null;
for (const p of candidates) {
  if (p && fs.existsSync(p)) { inputFile = p; break; }
}

if (!inputFile) {
  console.error('❌ File JSON non trovato. Usa: node scripts/json-to-xml.js /percorso/file.json');
  process.exit(1);
}

const OUTPUT = path.join(__dirname, '..', 'public', 'SinhalaOVBible.xml');

// Mappa numero libro → testament
const TESTAMENT = {
  Old: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
        21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39],
  New: [40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,
        58,59,60,61,62,63,64,65,66],
};

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeVerse(raw) {
  // Normalizza i vari formati JSON possibili
  const b = raw.b ?? raw.book ?? raw.BookNumber ?? raw.book_number ?? raw.bookNum;
  const c = raw.c ?? raw.chapter ?? raw.ChapterNumber ?? raw.chapter_number;
  const v = raw.v ?? raw.verse ?? raw.VerseNumber ?? raw.verse_number;
  const t = raw.t ?? raw.text ?? raw.VerseText ?? raw.verse_text ?? raw.content ?? '';
  return { b: parseInt(b), c: parseInt(c), v: parseInt(v), t: String(t).trim() };
}

console.log(`📖 Reading: ${inputFile}`);
const raw = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const verses = raw.map(normalizeVerse).filter(r => r.b && r.c && r.v);

console.log(`   ${verses.length} verses loaded`);

// Raggruppa per libro→capitolo→versetto
const books = {};
for (const { b, c, v, t } of verses) {
  if (!books[b]) books[b] = {};
  if (!books[b][c]) books[b][c] = {};
  books[b][c][v] = t;
}

// Genera XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<bible translation="Sinhala Holy Bible - Old Version (SOV 1938)" status="Ceylon Bible Society" link="http://chamathwebs.com/bible_shb_ov/">\n';

let currentTestament = null;

const bookNums = Object.keys(books).map(Number).sort((a,b) => a-b);
for (const bookNum of bookNums) {
  const testament = TESTAMENT.New.includes(bookNum) ? 'New' : 'Old';
  if (testament !== currentTestament) {
    if (currentTestament !== null) xml += '\t</testament>\n';
    currentTestament = testament;
    xml += `\t<testament name="${testament}">\n`;
  }
  xml += `\t\t<book number="${bookNum}">\n`;
  const chapters = Object.keys(books[bookNum]).map(Number).sort((a,b) => a-b);
  for (const ch of chapters) {
    xml += `\t\t\t<chapter number="${ch}">\n`;
    const verseNums = Object.keys(books[bookNum][ch]).map(Number).sort((a,b) => a-b);
    for (const v of verseNums) {
      xml += `\t\t\t\t<verse number="${v}">${escapeXml(books[bookNum][ch][v])}</verse>\n`;
    }
    xml += `\t\t\t</chapter>\n`;
  }
  xml += `\t\t</book>\n`;
}
if (currentTestament) xml += '\t</testament>\n';
xml += '</bible>\n';

fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`✅ Saved: ${OUTPUT}`);
console.log(`   Size: ${(xml.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Books: ${bookNums.length}, Verses: ${verses.length}`);
