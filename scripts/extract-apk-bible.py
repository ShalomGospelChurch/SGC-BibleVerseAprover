#!/usr/bin/env python3
"""
Estrae la Bibbia Sinhala OV 1938 dall'APK Android.
APK = file ZIP → contiene assets/ con database SQLite.

Uso: python3 scripts/extract-apk-bible.py [/percorso/file.apk]
"""

import zipfile
import sqlite3
import json
import os
import sys
import tempfile
import shutil

# Cerca l'APK in posizioni comuni
def find_apk():
    candidates = []
    if len(sys.argv) > 1:
        candidates.append(sys.argv[1])

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    candidates += [
        os.path.join(project_root, 'sinhala_ov.apk'),
        os.path.join(project_root, 'sinhala-holy-bible-ov-1938.apk'),
        os.path.join(project_root, 'com.sinhalaholybible.sov.cbs.android.apk'),
        os.path.expanduser('~/Downloads/sinhala_ov.apk'),
        os.path.expanduser('~/Downloads/sinhala-holy-bible-ov-1938.apk'),
        os.path.expanduser('~/Downloads/com.sinhalaholybible.sov.cbs.android.apk'),
    ]

    for p in candidates:
        if p and os.path.isfile(p):
            return p
    return None

def extract_from_apk(apk_path):
    print(f"📦 APK: {apk_path}")

    tmpdir = tempfile.mkdtemp(prefix='sinhala_apk_')
    try:
        with zipfile.ZipFile(apk_path, 'r') as z:
            names = z.namelist()
            print(f"   {len(names)} file nell'APK")

            # Cerca database SQLite
            dbs = [n for n in names if n.endswith('.db') or n.endswith('.sqlite')]
            print(f"   Database trovati: {dbs}")

            # Cerca anche file nelle assets
            assets = [n for n in names if n.startswith('assets/')]
            print(f"   Assets: {assets[:20]}")

            if not dbs:
                # Forse il db ha un'estensione diversa
                possible = [n for n in names if 'bible' in n.lower() or 'verse' in n.lower()
                           or 'data' in n.lower() or n.startswith('assets/')]
                print(f"\n   File potenzialmente rilevanti: {possible}")

                # Estrai tutto assets/
                for n in assets:
                    z.extract(n, tmpdir)

                # Prova a leggere come SQLite qualunque file binario in assets/
                for n in assets:
                    filepath = os.path.join(tmpdir, n)
                    if os.path.isfile(filepath) and os.path.getsize(filepath) > 1000:
                        try:
                            with open(filepath, 'rb') as f:
                                header = f.read(16)
                            if header[:6] == b'SQLite':
                                dbs = [n]
                                print(f"   ✅ SQLite trovato: {n}")
                                break
                        except:
                            pass

            if not dbs:
                print("\n❌ Nessun database SQLite trovato nell'APK")
                print("   Contenuto completo dell'APK:")
                for n in sorted(names):
                    print(f"   {n}")
                return None

            # Estrai il primo database
            db_name = dbs[0]
            db_path = os.path.join(tmpdir, db_name.replace('/', os.sep))
            z.extract(db_name, tmpdir)
            print(f"\n🗄️  Database: {db_name} ({os.path.getsize(db_path)} bytes)")

            return read_sqlite(db_path)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

def read_sqlite(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Mostra le tabelle
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cursor.fetchall()]
    print(f"   Tabelle: {tables}")

    verses = []

    # Prova pattern comuni per app bibliche Android
    patterns = [
        # (query, book_col, chapter_col, verse_col, text_col)
        ("SELECT book, chapter, verse, text FROM verses ORDER BY book, chapter, verse",
         0, 1, 2, 3),
        ("SELECT book_number, chapter_number, verse_number, verse_text FROM verses ORDER BY book_number, chapter_number, verse_number",
         0, 1, 2, 3),
        ("SELECT b, c, v, t FROM verses ORDER BY b, c, v",
         0, 1, 2, 3),
    ]

    for table in tables:
        print(f"\n   Tabella '{table}':")
        cursor.execute(f"PRAGMA table_info({table})")
        cols = cursor.fetchall()
        print(f"   Colonne: {[c[1] for c in cols]}")

        cursor.execute(f"SELECT * FROM {table} LIMIT 3")
        rows = cursor.fetchall()
        for row in rows:
            print(f"   Esempio: {row}")

    # Prova a estrarre i versetti da qualsiasi tabella con colonne numeriche + testo
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        col_info = cursor.fetchall()
        col_names = [c[1].lower() for c in col_info]

        # Identifica colonne
        book_col = next((c[1] for c in col_info if any(k in c[1].lower() for k in ['book', 'buku', 'libro', 'b'])), None)
        chap_col = next((c[1] for c in col_info if any(k in c[1].lower() for k in ['chapter', 'chap', 'chapter_num', 'c', 'ch'])), None)
        vers_col = next((c[1] for c in col_info if any(k in c[1].lower() for k in ['verse', 'vers', 'v', 'num'])), None)
        text_col = next((c[1] for c in col_info if any(k in c[1].lower() for k in ['text', 'content', 'body', 't', 'verse_text', 'versetext'])), None)

        if book_col and chap_col and vers_col and text_col:
            print(f"\n✅ Tabella '{table}' - colonne trovate: {book_col}, {chap_col}, {vers_col}, {text_col}")
            cursor.execute(f"SELECT {book_col}, {chap_col}, {vers_col}, {text_col} FROM {table} ORDER BY {book_col}, {chap_col}, {vers_col}")
            rows = cursor.fetchall()
            verses = [{"b": r[0], "c": r[1], "v": r[2], "t": r[3]} for r in rows]
            print(f"   {len(verses)} versetti estratti")
            break

    conn.close()
    return verses

def verses_to_xml(verses, output_path):
    TESTAMENT_NEW = set(range(40, 67))

    def escape(s):
        return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

    # Raggruppa
    books = {}
    for v in verses:
        b, c, vn, t = int(v['b']), int(v['c']), int(v['v']), str(v.get('t', ''))
        if b not in books: books[b] = {}
        if c not in books[b]: books[b][c] = {}
        books[b][c][vn] = t

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<bible translation="Sinhala Holy Bible - Old Version (SOV 1938)" status="Ceylon Bible Society" link="http://chamathwebs.com/bible_shb_ov/">\n'

    current_testament = None
    for book_num in sorted(books.keys()):
        testament = 'New' if book_num in TESTAMENT_NEW else 'Old'
        if testament != current_testament:
            if current_testament is not None:
                xml += '\t</testament>\n'
            current_testament = testament
            xml += f'\t<testament name="{testament}">\n'
        xml += f'\t\t<book number="{book_num}">\n'
        for ch in sorted(books[book_num].keys()):
            xml += f'\t\t\t<chapter number="{ch}">\n'
            for vn in sorted(books[book_num][ch].keys()):
                xml += f'\t\t\t\t<verse number="{vn}">{escape(books[book_num][ch][vn])}</verse>\n'
            xml += '\t\t\t</chapter>\n'
        xml += '\t\t</book>\n'
    if current_testament:
        xml += '\t</testament>\n'
    xml += '</bible>\n'

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(xml)
    print(f"\n✅ XML salvato: {output_path}")
    print(f"   Size: {len(xml)/1024/1024:.2f} MB")
    print(f"   Libri: {len(books)}, Versetti: {len(verses)}")

# MAIN
apk = find_apk()
if not apk:
    print("❌ APK non trovato!")
    print()
    print("Scarica l'APK da:")
    print("  https://d.apkpure.com/b/APK/com.sinhalaholybible.sov.cbs.android?versionCode=3")
    print()
    print("Poi salva il file come uno di questi nomi nella cartella sgc-bibleverse/:")
    print("  - sinhala_ov.apk")
    print("  - sinhala-holy-bible-ov-1938.apk")
    print("  - com.sinhalaholybible.sov.cbs.android.apk")
    print()
    print("Oppure: python3 scripts/extract-apk-bible.py /percorso/completo/file.apk")
    sys.exit(1)

verses = extract_from_apk(apk)
if not verses:
    sys.exit(1)

script_dir = os.path.dirname(os.path.abspath(__file__))
output = os.path.join(script_dir, '..', 'public', 'SinhalaOVBible.xml')
verses_to_xml(verses, os.path.normpath(output))
