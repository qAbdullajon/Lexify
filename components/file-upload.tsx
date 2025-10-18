// components/FileUpload.tsx
"use client"

import { useEffect, useState } from "react"
import { FileJson, Upload, Text, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertTextToJson } from "@/lib/vocab-utils"

interface FileUploadProps {
  onUpload: (content: string) => void
  loading?: boolean
}

export default function FileUpload({ onUpload, loading = false }: FileUploadProps) {
  const [textInput, setTextInput] = useState("")
  const [format, setFormat] = useState<'json' | 'text'>('text')
  const [isConverting, setIsConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("vocabulary")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const textFormat = parsed.map(item =>
            `${item.en}, ${item.uz}${item.exampleText ? `, ${item.exampleText}` : ''}`
          ).join('\n')
          setTextInput(textFormat)
        }
      } catch {
        setTextInput(saved)
      }
    }
  }, [])

  const handleImport = async () => {
    if (!textInput.trim()) return

    setIsConverting(true)
    setConvertError(null)

    try {
      if (format === 'text') {
        const result = convertTextToJson(textInput)

        if (result.valid && result.data) {
          const jsonString = JSON.stringify(result.data, null, 2)

          // Backend ga saqlash
          try {
            const response = await fetch('/api/vocabulary', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ vocabulary: result.data }),
            })

            if (response.ok) {
              console.log('Vocabulary saved to database')
              // Local storage ga saqlash
              localStorage.setItem("vocabulary", jsonString)
              onUpload(jsonString)
            } else {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to save vocabulary')
            }
          } catch (error) {
            console.error('Error saving to database:', error)
            setConvertError(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        } else {
          setConvertError(result.error || "Conversion failed")
        }
      } else {
        // JSON format uchun ham database ga saqlash
        try {
          // JSON ni validatsiya qilish
          const parsedData = JSON.parse(textInput)

          if (!Array.isArray(parsedData)) {
            throw new Error('JSON must be an array')
          }

          // Backend ga saqlash
          const response = await fetch('/api/vocabulary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vocabulary: parsedData }),
          })

          if (response.ok) {
            console.log('Vocabulary saved to database')
            // Local storage ga saqlash
            localStorage.setItem("vocabulary", textInput)
            onUpload(textInput)
          } else {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to save vocabulary')
          }
        } catch (error) {
          console.error('Error saving JSON to database:', error)
          setConvertError(`Database error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`)
        }
      }
    } catch (error) {
      setConvertError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConverting(false)
    }
  }

  const exampleText = `alphabetical, alifbo tarzida, The list was in alphabetical order.
book, kitob, I read an interesting book.
computer, kompyuter, He works on his computer every day.`

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Text className="w-8 h-8 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Enter Your Vocabulary</h3>
          <p className="text-sm text-muted-foreground">
            Enter vocabulary in format: english, uzbek, example (optional)
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <Button
          variant={format === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFormat('text')}
          disabled={isConverting || loading}
        >
          Text Format
        </Button>
        <Button
          variant={format === 'json' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFormat('json')}
          disabled={isConverting || loading}
        >
          JSON Format
        </Button>
      </div>

      <Textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder={format === 'text' ? exampleText : '[{"uz": "alifbo tarzida", "en": "alphabetical", "exampleText": "The list was in alphabetical order."}]'}
        className="min-h-[200px] font-mono text-sm bg-secondary/50"
        disabled={isConverting || loading}
      />

      {convertError && (
        <Alert variant="destructive">
          <AlertDescription>{convertError}</AlertDescription>
        </Alert>
      )}

      {format === 'text' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Format:</strong> english, uzbek, example sentence<br />
            <strong>Example:</strong> alphabetical, alifbo tarzida, The list was in alphabetical order.
          </p>
        </div>
      )}

      <Button
        onClick={handleImport}
        size="lg"
        className="w-full gap-2"
        disabled={!textInput.trim() || isConverting || loading}
      >
        {(isConverting || loading) ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {format === 'text' ? 'Convert & Save' : 'Import Vocabulary'}
        {(isConverting || loading) && '...'}
      </Button>
    </div>
  )
}