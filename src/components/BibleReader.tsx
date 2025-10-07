'use client'

import { useState, useEffect } from 'react'
import { getBibleData } from '@/data/bible-utils'
import BibleSearch from './BibleSearch'

interface BibleData {
  books: string[]
  bible: Record<string, Record<string, Record<string, string>>>
}

export default function BibleReader() {
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [verses, setVerses] = useState<Record<string, string>>({})
  const [chapters, setChapters] = useState<string[]>([])
  const [bibleData, setBibleData] = useState<any>(null)

  useEffect(() => {
    // Load Bible data on component mount
    const data = getBibleData()
    setBibleData(data)
  }, [])

  useEffect(() => {
    if (bibleData && selectedBook) {
      const bookChapters = Object.keys(bibleData.bible[selectedBook] || {})
      setChapters(bookChapters)
      setSelectedChapter('')
      setVerses({})
    }
  }, [bibleData, selectedBook])

  useEffect(() => {
    if (bibleData && selectedBook && selectedChapter) {
      const chapterVerses = bibleData.bible[selectedBook][selectedChapter] || {}
      setVerses(chapterVerses)
    }
  }, [bibleData, selectedBook, selectedChapter])

  const handleBookChange = (book: string) => {
    setSelectedBook(book)
  }

  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(chapter)
  }

  const handleVerseSelect = (book: string, chapter: string) => {
    setSelectedBook(book)
    setSelectedChapter(chapter)
  }

  if (!bibleData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading Bible data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <BibleSearch onVerseSelect={handleVerseSelect} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Book Selection */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Books</h2>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              {bibleData.books.map((book) => (
                <button
                  key={book}
                  onClick={() => handleBookChange(book)}
                  className={`w-full text-left p-2 rounded mb-1 transition-colors text-sm ${
                    selectedBook === book
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {book}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Selection */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chapters</h2>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => handleChapterChange(chapter)}
                  className={`w-full text-left p-2 rounded mb-1 transition-colors text-sm ${
                    selectedChapter === chapter
                      ? 'bg-green-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Chapter {chapter}
                </button>
              ))}
            </div>
          </div>

          {/* Verses Display */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedBook && selectedChapter ? `${selectedBook} ${selectedChapter}` : 'Verses'}
            </h2>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              {Object.entries(verses).map(([verseNum, text]) => (
                <div key={verseNum} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border text-center">
                  <div className="inline-block">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {verseNum}.
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white leading-relaxed">
                      {text.replace(/\r$/, '')}
                    </span>
                  </div>
                </div>
              ))}
              {Object.keys(verses).length === 0 && selectedBook && selectedChapter && (
                <p className="text-gray-500 dark:text-gray-400">No verses found.</p>
              )}
              {!selectedBook && (
                <p className="text-gray-500 dark:text-gray-400">Select a book and chapter to read.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}