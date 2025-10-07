import kjvData from './kjv-data.json'

export interface BibleData {
  books: string[]
  bible: Record<string, Record<string, Record<string, string>>>
}

export const getBibleData = (): BibleData => {
  return kjvData as BibleData
}

export const getBooks = (): string[] => {
  return getBibleData().books
}

export const getChapters = (book: string): string[] => {
  const data = getBibleData()
  return Object.keys(data.bible[book] || {})
}

export const getVerses = (book: string, chapter: string): Record<string, string> => {
  const data = getBibleData()
  return data.bible[book]?.[chapter] || {}
}