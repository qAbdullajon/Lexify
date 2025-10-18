"use client"

import { useState, useEffect } from "react"
import { Download, BookOpen, Loader2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import FileUpload from "@/components/file-upload"
import Flashcard from "@/components/flashcard"
import { type VocabWord, validateJSON } from "@/lib/vocab-utils"

export default function VocabLearner() {
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [language, setLanguage] = useState<"en" | "uz">("en")
  const [pageInput, setPageInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)

  // LocalStorage dan yuklash
  useEffect(() => {
    const saved = localStorage.getItem("vocabulary")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setVocabulary(parsed)
      } catch (e) {
        console.error("Failed to load saved vocabulary")
      }
    }
  }, [])

  // Database dan vocabulary olish
  const fetchVocabularyFromDB = async () => {
    setFetchLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/vocabulary')

      if (!response.ok) {
        throw new Error('Failed to fetch vocabulary from database')
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        setVocabulary(data)
        setCurrentIndex(0)
        setIsFlipped(false)
        setPageInput("")

        // LocalStorage ga ham saqlaymiz
        localStorage.setItem("vocabulary", JSON.stringify(data))

        console.log(`Loaded ${data.length} words from database`)
      } else {
        setError("No vocabulary found in database")
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error)
      setError(`Failed to load vocabulary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("vocabulary")
    if (!saved) {
      fetchVocabularyFromDB()
    }
  }, [])

  useEffect(() => {
    if (vocabulary.length > 0) {
      localStorage.setItem("vocabulary", JSON.stringify(vocabulary))
    }
  }, [vocabulary])

  const handleFileUpload = async (content: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = validateJSON(content)

      if (!result.valid) {
        setError(result.error || "Invalid JSON format")
        return
      }

      setVocabulary(result.data!)
      setCurrentIndex(0)
      setIsFlipped(false)
      setPageInput("")
    } catch (error) {
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setPageInput(String(currentIndex + 2))
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setPageInput(String(currentIndex))
    }
  }

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * vocabulary.length)
    setCurrentIndex(randomIndex)
    setIsFlipped(false)
    setPageInput(String(randomIndex + 1))
  }

  const handlePageNavigation = () => {
    const pageNumber = parseInt(pageInput)
    if (pageNumber >= 1 && pageNumber <= vocabulary.length) {
      setCurrentIndex(pageNumber - 1)
      setIsFlipped(false)
    } else {
      setPageInput(String(currentIndex + 1))
    }
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPageInput(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageNavigation()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-balance">Lexify</h1>
          </div>
          <p className="text-muted-foreground text-lg">Upload your English-Uzbek vocabulary and start learning</p>
        </header>

        {/* Loading State */}
        {(loading || fetchLoading) && (
          <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-blue-50 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-blue-600">
              {fetchLoading ? "Loading from database..." : "Processing vocabulary..."}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Database Actions & Language Toggle */}
          <div className="flex flex-col min-[400px]:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-5">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Word {currentIndex + 1} of {vocabulary.length}
              </span>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={`${currentIndex + 1}`}
                  className="w-16 h-8 text-center text-sm"
                  disabled={vocabulary.length === 0}
                />
                <Button
                  onClick={handlePageNavigation}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  disabled={vocabulary.length === 0}
                >
                  Go
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-secondary rounded-lg p-1">
                <Button
                  variant={language === "en" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setLanguage("en")
                    setIsFlipped(false)
                  }}
                  className="h-8 px-4"
                  disabled={vocabulary.length === 0}
                >
                  EN
                </Button>
                <Button
                  variant={language === "uz" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setLanguage("uz")
                    setIsFlipped(false)
                  }}
                  className="h-8 px-4"
                  disabled={vocabulary.length === 0}
                >
                  UZ
                </Button>
              </div>
            </div>
          </div>

          {/* Flashcard */}
          {vocabulary.length > 0 ? (
            <Flashcard
              word={vocabulary[currentIndex]}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              language={language}
            />
          ) : (
            <Card className="p-12 text-center border-dashed">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No vocabulary loaded
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload a vocabulary file or load from database to get started
              </p>
            </Card>
          )}

          {/* Navigation Controls */}
          {vocabulary.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0 || !isFlipped}
                variant="secondary"
                size="lg"
              >
                Previous
              </Button>

              <Button onClick={handleRandom} disabled={!isFlipped} variant="secondary" size="lg">
                Random
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentIndex === vocabulary.length - 1 || !isFlipped}
                variant="secondary"
                size="lg"
              >
                Next
              </Button>
            </div>
          )}

          {/* Upload New File */}
          <div className="pt-6 border-t border-border">
            <details className="cursor-pointer">
              <summary className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Upload new vocabulary file
              </summary>
              <div className="mt-4">
                <FileUpload onUpload={handleFileUpload} loading={loading} />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}