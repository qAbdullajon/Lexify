export interface VocabWord {
  uz: string;
  en: string;
  exampleText: string;
}

interface ValidationResult {
  valid: boolean;
  data?: VocabWord[];
  error?: string;
}

// utils/validators.ts
export function validateJSON(content: string): ValidationResult {
  try {
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      return {
        valid: false,
        error: "JSON must be an array of vocabulary objects",
      };
    }

    if (parsed.length === 0) {
      return {
        valid: false,
        error: "JSON array cannot be empty",
      };
    }

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      const position = i + 1;

      if (typeof item !== "object" || item === null) {
        return {
          valid: false,
          error: `Item ${position} is not an object`,
        };
      }

      if (!item.uz || typeof item.uz !== "string") {
        return {
          valid: false,
          error: `Item ${position}: 'uz' field is missing or not a string`,
        };
      }

      if (!item.en || typeof item.en !== "string") {
        return {
          valid: false,
          error: `Item ${position}: 'en' field is missing or not a string`,
        };
      }
    }

    return {
      valid: true,
      data: parsed as VocabWord[],
    };
  } catch (e) {
    return {
      valid: false,
      error: `Invalid JSON format: ${
        e instanceof Error ? e.message : "Unknown error"
      }`,
    };
  }
}

// utils/textToJsonConverter.js
export function convertTextToJson(text: string) {
  if (!text.trim()) {
    return { valid: false, error: "Text is empty" };
  }

  const lines = text.split("\n").filter((line) => line.trim());
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Format: english, uzbek, example sentence
    // Comma bilan ajratilgan, lekin example textda comma bo'lishi mumkin
    const firstComma = line.indexOf(",");
    const secondComma = line.indexOf(",", firstComma + 1);

    let en, uz, exampleText;

    if (secondComma === -1) {
      // Faqat 2 qism: english, uzbek
      if (firstComma === -1) {
        return {
          valid: false,
          error: `Line ${i + 1}: Must use comma to separate English and Uzbek`,
        };
      }
      en = line.slice(0, firstComma).trim();
      uz = line.slice(firstComma + 1).trim();
      exampleText = "";
    } else {
      // 3 qism: english, uzbek, example
      en = line.slice(0, firstComma).trim();
      uz = line.slice(firstComma + 1, secondComma).trim();
      exampleText = line.slice(secondComma + 1).trim();
    }

    if (!en || !uz) {
      return {
        valid: false,
        error: `Line ${i + 1}: Both English and Uzbek are required`,
      };
    }

    result.push({
      uz: uz,
      en: en,
      exampleText: exampleText || "",
    });
  }

  return {
    valid: true,
    data: result,
  };
}
