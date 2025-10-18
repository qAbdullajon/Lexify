import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Volume2, Languages, X } from "lucide-react"
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
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isExampeText, setIsExampleText] = useState(false)

  useEffect(() => {
    if (!isFlipped) {
      if (language === "en") {
        playAudio(word.en, "en")
      }
      setShowTranslation(false)
      setTranslatedText("")
      setSelectedWords([])
      setIsCorrect(null)
    } else {
      translateText()
    }
  }, [word, isFlipped])

  useEffect(() => {
    if (isFlipped && word.exampleText) {
      const words = word.exampleText.split(" ")
      setAvailableWords(shuffleArray([...words]))
      setSelectedWords([])
      setIsCorrect(null)
    }
  }, [isFlipped, word.exampleText])

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
    }
  }

  const handleCardClick = () => {
    if (!isFlipped) {
      onFlip()
    }
  }

  const handleWordSelect = (word: string, index: number) => {
    const newAvailable = [...availableWords]
    newAvailable.splice(index, 1)
    setAvailableWords(newAvailable)
    setSelectedWords([...selectedWords, word])
    setIsCorrect(null)
  }

  const handleWordRemove = (word: string, index: number) => {
    const newSelected = [...selectedWords]
    newSelected.splice(index, 1)
    setSelectedWords(newSelected)
    setAvailableWords([...availableWords, word])
    setIsCorrect(null)
  }

  const checkSentence = () => {
    const userSentence = selectedWords.join(" ")
    const isSentenceCorrect = userSentence === word.exampleText

    setIsCorrect(isSentenceCorrect)
    setTimeout(() => {
      setIsCorrect(null)
    }, 2000)
    // if (isSentenceCorrect) {
    //   playAudio("Correct! Well done!", "en")
    // } else {
    //   playAudio("Incorrect. Try again.", "en")
    // }
  }

  useEffect(() => {
    if (availableWords.length === 0) {
      checkSentence()
    }
  }, [availableWords])

  const shuffleArray = (array: string[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  return (
    <div className="perspective-1000">
      <Card
        onClick={handleCardClick}
        className={`relative h-[550px] sm:h-[500px] ${!isFlipped ? "cursor-pointer" : "transition-transform duration-500"
          }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-2 backface-hidden text-center"
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
          className="absolute inset-0 flex flex-col items-center justify-center p-2 backface-hidden bg-card text-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-center gap-1 mb-4 mr-5">
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
            {
              word.exampleText && (
                <div className="mb-6">
                  <p className="text-lg italic text-pretty text-center text-blue-400 font-medium">
                    "{translatedText || "Loading translation..."}"
                  </p>
                </div>
              )
            }

            {/* Selected words (user's sentence) */}
            <div className="py-3 border-y min-h-[70px] border-white/30 mb-6 flex flex-wrap gap-2 justify-center items-center">
              {selectedWords.length === 0 ? (
                ""
              ) : (
                selectedWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWordRemove(word, index)
                    }}
                    className="px-3 py-2 border-[1px] border-white/30 border-b-[4px] active:text-blue-400 active:border-blue-400 text-primary-foreground rounded-lg transition-all"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available words */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {availableWords.map((word, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleWordSelect(word, index)
                  }}
                  className="px-3 py-2 border-[1px] border-white/30 border-b-[4px] active:text-blue-400 active:border-blue-400 text-primary-foreground rounded-lg transition-all"
                >
                  {word}
                </button>
              )
              )}
            </div>

            {
              word.exampleText && isExampeText && (
                <div className="flex items-center justify-center gap-2 mt-4">
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
                  <p className="text-sm italic text-pretty text-center">"{word.exampleText}"</p>
                </div>
              )
            }

            {/* Check button and result */}
            <div className="flex flex-col items-center gap-3">
              {isCorrect !== null && (
                <div
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-500 ${isCorrect
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                >
                  {isCorrect ? "✅ To'g'ri!" : "❌ Noto'g'ri, qayta urinib ko'ring"}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <button onClick={() => setIsExampleText(!isExampeText)} className="w-8 h-8 active:bg-white/30 rounded-full flex items-center justify-center">
                {
                  !isExampeText ? (
                    <Languages className="text-blue-400" size={18} />
                  ) : (
                    <X className="text-blue-400" size={18} />
                  )
                }
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}