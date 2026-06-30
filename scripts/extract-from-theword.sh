#!/bin/bash
# Estrae la Bibbia Sinhala OV 1938 dal modulo theWord via Wine
# Prerequisiti: Wine installato con `brew install wine-stable` o Wine da winehq.org

set -e

ONTX_FILE="$1"
OUTPUT_DIR="$(dirname "$(realpath "$0")")/../public"

if [ -z "$ONTX_FILE" ]; then
  echo "Uso: $0 /percorso/SHB-SOV.ontx"
  exit 1
fi

echo "🍷 Setup Wine + theWord..."

# Cartelle Wine
WINE_PREFIX="$HOME/.wine"
TW_DIR="$WINE_PREFIX/drive_c/Program Files/The Word"
TW_DATA="$WINE_PREFIX/drive_c/users/$USER/Application Data/The Word"

# Scarica theWord se non è installato
if [ ! -d "$TW_DIR" ]; then
  echo "📥 Download theWord installer..."
  curl -L "https://www.theword.net/dl/theword-5.0.0.1364-setup.exe" -o /tmp/tw_setup.exe
  echo "🔧 Installa theWord (finestra Wine si aprirà)..."
  wine /tmp/tw_setup.exe /S  # /S = silent install
  sleep 5
fi

# Copia il modulo nella cartella Bibles di theWord
mkdir -p "$TW_DATA/Bibles"
cp "$ONTX_FILE" "$TW_DATA/Bibles/SHB-SOV.ontx"
echo "✅ Modulo copiato in Wine"

# Script Python che verrà eseguito DENTRO theWord tramite la sua console
cat > /tmp/tw_export.py << 'PYEOF'
import tw
import json

bible = tw.getBible("SHB-SOV")
if not bible:
    print("ERROR: Bible not found")
    exit(1)

verses = []
for book_idx in range(1, 67):
    chapter_count = bible.getChapterCount(book_idx)
    for ch in range(1, chapter_count + 1):
        verse_count = bible.getVerseCount(book_idx, ch)
        for v in range(1, verse_count + 1):
            text = bible.getVerseText(book_idx, ch, v)
            verses.append({"b": book_idx, "c": ch, "v": v, "t": text})

with open("C:\\\\bible_ov_export.json", "w", encoding="utf-8") as f:
    json.dump(verses, f, ensure_ascii=False)

print(f"Exported {len(verses)} verses")
PYEOF

echo ""
echo "============================================"
echo "PASSI MANUALI (2 minuti):"
echo "============================================"
echo ""
echo "1. Apri theWord:"
echo "   wine '$TW_DIR/theword.exe' &"
echo ""
echo "2. In theWord: Tools → Python Console"
echo "   Incolla ed esegui il contenuto di: /tmp/tw_export.py"
echo ""
echo "3. Dopo l'esecuzione, il file sarà in:"
echo "   $WINE_PREFIX/drive_c/bible_ov_export.json"
echo ""
echo "4. Poi esegui:"
echo "   node scripts/json-to-xml.js"
echo ""
