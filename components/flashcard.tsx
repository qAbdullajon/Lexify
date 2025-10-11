"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Volume2, Languages } from "lucide-react"
import type { VocabWord } from "@/lib/vocab-utils"

interface FlashcardProps {
  word: VocabWord
  isFlipped: boolean
  onFlip: () => void
  language: "en" | "uz"
}

export default function Flashcard({ word, isFlipped, onFlip, language }: FlashcardProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const [translatedText, setTranslatedText] = useState<string>("")
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    if (!isFlipped && language === "en") {
      playAudio(word.en, "en")
      setShowTranslation(false)
      setTranslatedText("")
    }
  }, [word, isFlipped])

  const playAudio = (text: string, lang: "en") => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const translateText = async () => {
    if (translatedText) {
      setShowTranslation(!showTranslation)
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=uz&dt=t&q=${encodeURIComponent(
          word.exampleText,
        )}`,
      )
      const data = await response.json()
      const translation = data[0][0][0]
      setTranslatedText(translation)
      setShowTranslation(true)
    } catch (error) {
      console.error("Translation failed:", error)
      setTranslatedText("Translation unavailable")
      setShowTranslation(true)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCardClick = () => {
    if (!isFlipped) {
      onFlip()
    }
  }

  return (
    <div className="perspective-1000">
      <Card
        onClick={handleCardClick}
        className={`relative h-[400px] transition-transform duration-500 preserve-3d ${!isFlipped ? "cursor-pointer" : ""
          }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-center gap-4">
            {
              language === "en" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playAudio(word.en, "en")
                  }}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  aria-label="Play audio"
                >
                  <Volume2 className="w-6 h-6 text-primary" />
                </button>
              )
            }
            <h2 className="text-5xl font-bold text-center text-balance">{word[language]}</h2>
          </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden bg-card text-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">

            <button
              onClick={(e) => {
                e.stopPropagation()
                playAudio(word.en, "en")
              }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Play audio"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </button>
            <h3 className="text-2xl font-semibold text-muted-foreground text-center">{word.en}</h3>
          </div>

          <h2 className="text-5xl font-bold text-center text-balance mb-8">{word.uz}</h2>

          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(word.exampleText, "en")
                }}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                aria-label="Play example audio"
              >
                <Volume2 className="w-4 h-4 text-primary" />
              </button>
              <p className="text-base italic text-pretty text-center">"{word.exampleText}"</p>
            </div>

            {showTranslation && translatedText && (
              <p className="text-sm text-muted-foreground italic text-center">"{translatedText}"</p>
            )}

            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  translateText()
                }}
                disabled={isTranslating}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                aria-label="Translate example"
              >
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {isTranslating ? "Translating..." : showTranslation ? "Hide" : "Translate"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
