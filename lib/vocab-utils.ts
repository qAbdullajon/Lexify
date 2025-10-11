export interface VocabWord {
  uz: string
  en: string
  exampleText: string
}

interface ValidationResult {
  valid: boolean
  data?: VocabWord[]
  error?: string
}

export function validateJSON(content: string): ValidationResult {
  try {
    const parsed = JSON.parse(content)

    // Check if it's an array
    if (!Array.isArray(parsed)) {
      return {
        valid: false,
        error: "JSON must be an array of vocabulary objects",
      }
    }

    // Check if array is empty
    if (parsed.length === 0) {
      return {
        valid: false,
        error: "JSON array cannot be empty",
      }
    }

    // Validate each object
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i]
      const position = i + 1

      if (typeof item !== "object" || item === null) {
        return {
          valid: false,
          error: `Item ${position} is not an object`,
        }
      }

      if (!item.uz || typeof item.uz !== "string") {
        return {
          valid: false,
          error: `Item ${position}: 'uz' field is missing or not a string`,
        }
      }

      if (!item.en || typeof item.en !== "string") {
        return {
          valid: false,
          error: `Item ${position}: 'en' field is missing or not a string`,
        }
      }

      if (!item.exampleText || typeof item.exampleText !== "string") {
        return {
          valid: false,
          error: `Item ${position}: 'exampleText' field is missing or not a string`,
        }
      }
    }

    return {
      valid: true,
      data: parsed as VocabWord[],
    }
  } catch (e) {
    return {
      valid: false,
      error: `Invalid JSON format: ${e instanceof Error ? e.message : "Unknown error"}`,
    }
  }
}
