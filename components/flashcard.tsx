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
  const [hiddenWords, setHiddenWords] = useState<number[]>([])

  useEffect(() => {
    if (!isFlipped) {
      if (language === "en") {
        playAudio(word.en, "en")
      }
      setShowTranslation(false)
      setTranslatedText("")
      setSelectedWords([])
      setIsCorrect(null)
      setHiddenWords([])
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
      setHiddenWords([])
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
    if (!hiddenWords.includes(index)) {
      setHiddenWords([...hiddenWords, index])
      setSelectedWords([...selectedWords, word])
      setIsCorrect(null)
    }
  }

  const handleWordRemove = (word: string, index: number) => {
    const newSelected = [...selectedWords]
    newSelected.splice(index, 1)
    setSelectedWords(newSelected)

    const newHidden = [...hiddenWords]
    const removedIndex = newHidden.findIndex(hiddenIndex =>
      availableWords[hiddenIndex] === word
    )
    if (removedIndex !== -1) {
      newHidden.splice(removedIndex, 1)
      setHiddenWords(newHidden)
    }
    setIsCorrect(null)
  }

  const checkSentence = () => {
    const userSentence = selectedWords.join(" ")
    const isSentenceCorrect = userSentence === word.exampleText

    setIsCorrect(isSentenceCorrect)
    setTimeout(() => {
      setIsCorrect(null)
    }, 2000)
  }

  useEffect(() => {
    if (availableWords.length > 0 && hiddenWords.length === availableWords.length) {
      checkSentence()
    }
  }, [hiddenWords, availableWords])

  const shuffleArray = (array: string[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  return (
    <div className="perspective-1000 w-full mx-auto">
      <Card
        onClick={handleCardClick}
        className={`relative w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] ${!isFlipped ? "cursor-pointer" : "transition-transform duration-500"
          }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4 backface-hidden text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            {
              language === "en" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playAudio(word.en, "en")
                  }}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors"
                  aria-label="Play audio"
                >
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </button>
              )
            }
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-balance px-2">{word[language]}</h2>
          </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 backface-hidden bg-card rounded-xl text-center overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                playAudio(word.en, "en")
              }}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              aria-label="Play audio"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </button>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground text-center">{word.en}</h3>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-balance mb-4 sm:mb-6 md:mb-8 px-2">{word.uz}</h2>

          <div className="w-full max-w-sm space-y-3 sm:space-y-4">
            {
              word.exampleText && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base md:text-lg italic text-pretty text-center text-blue-400 font-medium px-2">
                    "{translatedText || "Loading translation..."}"
                  </p>
                </div>
              )
            }

            {/* Selected words (user's sentence) */}
            <div className="py-2 sm:py-3 border-y min-h-[60px] sm:min-h-[70px] border-white/30 mb-4 sm:mb-6 flex flex-wrap gap-1 sm:gap-2 justify-start items-center px-2">
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
                    className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border-[1px] border-white/30 border-b-[3px] active:text-blue-400 active:border-blue-400 text-primary-foreground rounded-lg transition-all"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available words */}
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-3 sm:mb-4 px-2">
              {availableWords.map((word, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleWordSelect(word, index)
                  }}
                  className={`px-2 py-1.5 sm:px-3 no-select sm:py-2 text-xs sm:text-sm border-[1px] border-white/30 border-b-[3px] active:text-blue-400 active:border-blue-400 text-primary-foreground rounded-lg transition-all ${hiddenWords.includes(index) ? 'bg-[#171a22] !text-[#171a22] !border-[#171a22]' : ''
                    }`}
                >
                  {word}
                </button>
              )
              )}
            </div>

            {
              word.exampleText && isExampeText && (
                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playAudio(word.exampleText, "en")
                    }}
                    className="p-1 rounded-full hover:bg-secondary transition-colors"
                    aria-label="Play example audio"
                  >
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </button>
                  <p className="text-xs sm:text-sm italic text-pretty text-center">"{word.exampleText}"</p>
                </div>
              )
            }

            {/* Check button and result */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 px-2">
              {isCorrect !== null && (
                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-500 text-xs sm:text-sm ${isCorrect
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                >
                  {isCorrect ? "✅ To'g'ri!" : "❌ Noto'g'ri, qayta urinib ko'ring"}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => setIsExampleText(!isExampeText)}
                className="w-7 h-7 sm:w-8 sm:h-8 active:bg-white/30 rounded-full flex items-center justify-center"
              >
                {
                  !isExampeText ? (
                    <Languages className="text-blue-400" size={16} />
                  ) : (
                    <X className="text-blue-400" size={16} />
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