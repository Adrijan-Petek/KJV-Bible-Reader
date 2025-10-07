const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const kjvPath = path.join(__dirname, '../../KJV-1611.pdf');
const outputPath = path.join(__dirname, 'kjv-data.json');

function parseKJV() {
  const dataBuffer = fs.readFileSync(kjvPath);

  pdfParse(dataBuffer).then(function(data) {
    const content = data.text;

    // Find where the actual Bible text starts
    let startIndex = content.indexOf('In the beginning God created');
    if (startIndex === -1) {
      console.error('Could not find start of Bible text');
      return;
    }

    console.log('Found start of Bible text at position:', startIndex);
    const bibleText = content.substring(startIndex);
    console.log('First 500 characters:', bibleText.substring(0, 500));

    const bible = {};
    const books = [];

    // Known Bible books in order
    const bibleBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
      '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
      'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
      'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
      'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
      'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];

    let currentBook = 'Genesis';
    let currentChapter = '1';
    bible[currentBook] = {};
    bible[currentBook][currentChapter] = {};
    books.push(currentBook);

    console.log('Starting parsing with Genesis chapter 1');

    // Split into lines and process sequentially
    const lines = bibleText.split('\n');
    let currentVerseText = '';
    let currentVerseNum = null;
    let verseCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Debug: Show progress every 1000 lines
      if (i % 1000 === 0) {
        console.log(`Processing line ${i}/${lines.length}, current book: ${currentBook}, chapter: ${currentChapter}`);
      }

      // Check for book transitions (various formats: standalone, "X Book", "Book X", "THE BOOK OF X")
      const upperLine = line.toUpperCase();
      let foundBook = null;

      // Check for standalone book names
      foundBook = bibleBooks.find(book => {
        const bookUpper = book.toUpperCase();
        return upperLine === bookUpper && book !== currentBook;
      });

      // Check for "X Book" format (like "4 Genesis")
      if (!foundBook) {
        const numBookMatch = line.match(/^(\d+)\s+([A-Z][a-zA-Z\s]+)$/);
        if (numBookMatch) {
          const bookName = numBookMatch[2].trim();
          foundBook = bibleBooks.find(book => book.toUpperCase() === bookName.toUpperCase() && book !== currentBook);
        }
      }

      // Check for "Book X" format (like "Genesis 5")
      if (!foundBook) {
        const bookNumMatch = line.match(/^([A-Z][a-zA-Z\s]+)\s+(\d+)$/);
        if (bookNumMatch) {
          const bookName = bookNumMatch[1].trim();
          foundBook = bibleBooks.find(book => book.toUpperCase() === bookName.toUpperCase() && book !== currentBook);
        }
      }

      // Check for "THE BOOK OF X" format
      if (!foundBook) {
        const bookOfMatch = line.match(/^THE BOOK OF (.+)$/i);
        if (bookOfMatch) {
          const bookName = bookOfMatch[1].trim();
          foundBook = bibleBooks.find(book => book.toUpperCase() === bookName.toUpperCase() && book !== currentBook);
        }
      }

      // Debug: Log potential book lines
      if (bibleBooks.some(book => upperLine.includes(book.toUpperCase())) && upperLine.length < 50) {
        console.log(`Potential book line: "${line}" (upper: "${upperLine}")`);
      }

      if (foundBook) {
        console.log(`Found book transition: "${line}" -> switching to ${foundBook}`);
        // Save current verse before switching books
        if (currentVerseText && currentVerseNum) {
          bible[currentBook][currentChapter][currentVerseNum] = currentVerseText.trim();
        }

        currentBook = foundBook;
        currentChapter = '1';
        if (!bible[currentBook]) {
          bible[currentBook] = {};
          bible[currentBook][currentChapter] = {};
          books.push(currentBook);
          console.log('Added new book:', currentBook);
        }
        currentVerseText = '';
        currentVerseNum = null;
        verseCount = 0; // Reset verse count for new book
        continue;
      }

      // Check for chapter markers
      if (line.match(/^Chapter \d+$/) || (line.match(/^\d+$/) && parseInt(line) > 1 && parseInt(line) <= 150)) {
        // Save current verse before switching chapters
        if (currentVerseText && currentVerseNum) {
          bible[currentBook][currentChapter][currentVerseNum] = currentVerseText.trim();
          console.log(`Saved final verse ${currentVerseNum} of chapter ${currentChapter}`);
        }

        // Start new chapter
        const chapterNum = line.match(/^Chapter (\d+)$/) ? line.match(/^Chapter (\d+)$/)[1] : line;
        currentChapter = chapterNum;
        if (!bible[currentBook][currentChapter]) {
          bible[currentBook][currentChapter] = {};
        }
        currentVerseText = '';
        currentVerseNum = null;
        verseCount = 0; // Reset verse count for new chapter
        console.log(`Started chapter ${currentChapter} in ${currentBook}`);
        continue;
      }

      // Handle first verse of chapter (no verse number prefix)
      if (verseCount === 0 && currentVerseNum === null && line && !line.match(/^\d+/) && line.length > 10) {
        // This is likely the first verse of the chapter
        currentVerseNum = '1';
        currentVerseText = line;
        verseCount++;
        console.log(`Found ${currentBook} ${currentChapter}:1:`, currentVerseText.substring(0, 50) + '...');
        continue;
      }

      // Check if this line starts with a verse number
      // Must be: number + space + word characters (not just a single word like "Genesis")
      const verseMatch = line.match(/^(\d+)\s+([A-Za-z].+)$/);
      if (verseMatch && verseMatch[2].length > 10) { // Ensure it's substantial text, not just a word
        // Save previous verse if we have one
        if (currentVerseText && currentVerseNum) {
          bible[currentBook][currentChapter][currentVerseNum] = currentVerseText.trim();
          verseCount++;
        }

        // Start new verse
        currentVerseNum = verseMatch[1];
        currentVerseText = verseMatch[2];

        if (verseCount < 5 && currentBook === 'Genesis' && currentChapter === '1') {
          console.log(`Starting verse ${currentVerseNum}:`, currentVerseText.substring(0, 50) + '...');
        }
      } else if (currentVerseText) {
        // Continuation of current verse
        currentVerseText += ' ' + line;
      }
    }

    // Save the last verse
    if (currentVerseText && currentVerseNum) {
      bible[currentBook][currentChapter][currentVerseNum] = currentVerseText.trim();
    }

    console.log(`Parsed complete Bible with ${books.length} books`);

    const result = {
      books,
      bible
    };

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log('KJV data parsed from PDF and saved to kjv-data.json');
    console.log('Found books:', books.length);

  }).catch(function(error) {
    console.error('Error parsing PDF:', error);
  });
}

parseKJV();