import BibleReader from '@/components/BibleReader'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8">
          <div className="absolute left-0 top-0">
            <Image
              src="/logo.svg"
              alt="KJV Bible Reader Logo"
              width={200}
              height={200}
            />
          </div>
          <div className="text-center py-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              KJV Bible Reader
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Read and study the King James Version of the Holy Bible
            </p>
          </div>
        </div>
        <BibleReader />
      </div>
    </main>
  )
}