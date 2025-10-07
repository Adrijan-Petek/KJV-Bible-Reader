'use client'

import { useState } from 'react'
import { getBibleData } from '@/data/bible-utils'

interface BibleData {
  books: string[]
  bible: Record<string, Record<string, Record<string, string>>>
}

interface SearchResult {
  book: string
  chapter: string
  verse: string
  text: string
}

export default function BibleSearch({ onVerseSelect }: { onVerseSelect: (book: string, chapter: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [bibleData] = useState(() => getBibleData())

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    const results: SearchResult[] = []
    const query = searchQuery.toLowerCase()

    for (const book of bibleData.books) {
      for (const chapter in bibleData.bible[book]) {
        for (const verse in bibleData.bible[book][chapter]) {
          const text = bibleData.bible[book][chapter][verse]
          if (text.toLowerCase().includes(query)) {
            results.push({
              book,
              chapter,
              verse,
              text: text.replace(/\r$/, '')
            })
          }
        }
      }
    }

    setSearchResults(results.slice(0, 50)) // Limit to 50 results
    setIsSearching(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search the Bible..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Search Results ({searchResults.length})
          </h3>
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="mb-3 p-3 bg-white dark:bg-gray-800 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onVerseSelect(result.book, result.chapter)}
            >
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                {result.book} {result.chapter}:{result.verse}
              </div>
              <div className="text-gray-900 dark:text-white text-sm">
                {result.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <p className="text-gray-500 dark:text-gray-400">No results found for &quot;{searchQuery}&quot;</p>
      )}
    </div>
  )
}