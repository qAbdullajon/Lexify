"use client"

import { useState, useEffect } from "react"
import { Download, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input" // Input komponentini qo'shing
import FileUpload from "@/components/file-upload"
import Flashcard from "@/components/flashcard"
import { type VocabWord, validateJSON } from "@/lib/vocab-utils"

export default function VocabLearner() {
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [language, setLanguage] = useState<"en" | "uz">("en")
  const [pageInput, setPageInput] = useState("") // Input qiymati

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

  useEffect(() => {
    if (vocabulary.length > 0) {
      localStorage.setItem("vocabulary", JSON.stringify(vocabulary))
    }
  }, [vocabulary])

  const handleFileUpload = (content: string) => {
    setError(null)
    const result = validateJSON(content)

    if (!result.valid) {
      setError(result.error || "Invalid JSON format")
      return
    }

    setVocabulary(result.data!)
    setCurrentIndex(0)
    setIsFlipped(false)
    setPageInput("") // Inputni tozalash
  }

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setPageInput(String(currentIndex + 2)) // Inputni yangilash
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setPageInput(String(currentIndex)) // Inputni yangilash
    }
  }

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * vocabulary.length)
    setCurrentIndex(randomIndex)
    setIsFlipped(false)
    setPageInput(String(randomIndex + 1)) // Inputni yangilash
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(vocabulary, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "vocabulary.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearVocabulary = () => {
    setVocabulary([])
    setCurrentIndex(0)
    setIsFlipped(false)
    setPageInput("") // Inputni tozalash
    localStorage.removeItem("vocabulary")
  }

  // Page navigation funksiyasi
  const handlePageNavigation = () => {
    const pageNumber = parseInt(pageInput)
    if (pageNumber >= 1 && pageNumber <= vocabulary.length) {
      setCurrentIndex(pageNumber - 1)
      setIsFlipped(false)
    } else {
      // Agar noto'g'ri raqam kiritilsa, inputni hozirgi page ga qaytarish
      setPageInput(String(currentIndex + 1))
    }
  }

  // Input o'zgarganda ham avtomatik navigatsiya qilish (ixtiyoriy)
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPageInput(value)

    // Faqat raqam kiritilganini tekshirish

  }

  // Enter bosilganda navigatsiya qilish
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageNavigation()
      if (/^\d+$/.test(pageInput)) {
        const pageNumber = parseInt(pageInput)
        if (pageNumber >= 1 && pageNumber <= vocabulary.length) {
          setCurrentIndex(pageNumber - 1)
          setIsFlipped(false)
        }
      }
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {vocabulary.length === 0 ? (
          <Card className="p-8">
            <FileUpload onUpload={handleFileUpload} />

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold mb-3">Expected JSON Format:</h3>
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-sm">
                {`
[
  {
    "uz": "alifbo tarzida",
    "en": "alphabetical",
    "exampleText": "The list was in alphabetical order."
  },
  {
    "uz": "qatnashchi",
    "en": "attendant",
    "exampleText": "The attendant gave me a map."
  }
]`}
              </pre>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Language Toggle Buttons */}
            <div className="flex flex-col gap-3 items-center justify-between">
              {/* Page Navigation */}
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
                  />
                  <Button
                    onClick={handlePageNavigation}
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                  >
                    Go
                  </Button>
                </div>
              </div>

              <div className="flex gap-1 bg-secondary rounded-lg p-1">
                <Button
                  variant={language === "en" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setLanguage("en")
                    setIsFlipped(false)
                  }}
                  className="h-8 px-4"
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
                >
                  UZ
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearVocabulary}>
                  Clear All
                </Button>
              </div>
            </div>

            {/* Flashcard */}
            <Flashcard
              word={vocabulary[currentIndex]}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              language={language}
            />

            {/* Navigation Controls */}
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

            {/* Upload New File */}
            <div className="pt-6 border-t border-border">
              <details className="cursor-pointer">
                <summary className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Upload new vocabulary file
                </summary>
                <div className="mt-4">
                  <FileUpload onUpload={handleFileUpload} />
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}