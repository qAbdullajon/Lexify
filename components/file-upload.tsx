"use client"

import { useEffect, useState } from "react"
import { FileJson, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface FileUploadProps {
  onUpload: (content: string) => void
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [jsonInput, setJsonInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("vocabulary");
    if (saved) {
      setJsonInput(saved);
    }
  }, []);

  const handleImport = () => {
    if (jsonInput.trim()) {
      onUpload(jsonInput)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <FileJson className="w-8 h-8 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Paste Your Vocabulary JSON</h3>
          <p className="text-sm text-muted-foreground">Copy and paste your JSON data below</p>
        </div>
      </div>

      <Textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='[{"uz": "alifbo tarzida", "en": "alphabetical", "exampleText": "The list was in alphabetical order."}]'
        className="min-h-[200px] font-mono text-sm bg-secondary/50"
      />

      <Button onClick={handleImport} size="lg" className="w-full gap-2" disabled={!jsonInput.trim()}>
        <Upload className="w-4 h-4" />
        Import Vocabulary
      </Button>
    </div>
  )
}
