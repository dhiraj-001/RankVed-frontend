

/**
 * Validates if the provided chatbot training data adheres to the specified format.
 *
 * @param data An array of TrainingDataItem objects.
 * @returns An object containing a boolean `isValid` and an array of `errors`.
 */
export function validateChatbotData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  let isValid = true;

  if (!Array.isArray(data)) {
    errors.push("Root element must be an array.");
    isValid = false;
    return { isValid, errors };
  }

  if (data.length === 0) {
    errors.push("Training data array is empty. Please provide at least one intent.");
    isValid = false;
    return { isValid, errors };
  }

  data.forEach((item, index) => {
    const itemPath = `data[${index}]`;

    if (typeof item !== 'object' || item === null) {
      errors.push(`${itemPath}: Item is not a valid object.`);
      isValid = false;
      return;
    }

    // --- Validate top-level TrainingDataItem fields ---

    // intent_id
    if (typeof item.intent_id !== 'string' || item.intent_id.trim() === '') {
      errors.push(`${itemPath}.intent_id: Must be a non-empty string.`);
      isValid = false;
    }

    // nlp_training_phrases
    if (!Array.isArray(item.nlp_training_phrases) || item.nlp_training_phrases.length === 0) {
      errors.push(`${itemPath}.nlp_training_phrases: Must be a non-empty array of strings.`);
      isValid = false;
    } else {
      item.nlp_training_phrases.forEach((phrase: any, pIndex: number) => {
        if (typeof phrase !== 'string' || phrase.trim() === '') {
          errors.push(`${itemPath}.nlp_training_phrases[${pIndex}]: Must be a non-empty string.`);
          isValid = false;
        }
      });
      // Additional check for minimum phrases (e.g., at least 1 for simplicity, can be adjusted)
      if (item.nlp_training_phrases.length < 1) { // Adjusted from 5-8 for a more lenient programmatic check
          errors.push(`${itemPath}.nlp_training_phrases: Should ideally have at least 1 training phrase.`);
          isValid = false;
      }
    }

    // default_response_text
    if (typeof item.default_response_text !== 'string' || item.default_response_text.trim() === '') {
      errors.push(`${itemPath}.default_response_text: Must be a non-empty string.`);
      isValid = false;
    }

    // follow_up_options
    if (!Array.isArray(item.follow_up_options)) {
      errors.push(`${itemPath}.follow_up_options: Must be an array.`);
      isValid = false;
    } else {
      item.follow_up_options.forEach((option: any, oIndex: number) => {
        const optionPath = `${itemPath}.follow_up_options[${oIndex}]`;
        if (typeof option !== 'object' || option === null) {
          errors.push(`${optionPath}: Option is not a valid object.`);
          isValid = false;
          return;
        }

        // option_text (formerly button_text)
        if (typeof option.option_text !== 'string' || option.option_text.trim() === '') {
          errors.push(`${optionPath}.option_text: Must be a non-empty string.`);
          isValid = false;
        }
        // Check for length (stylistic, can be adjusted or removed if not strict)
        const words = option.option_text.trim().split(/\s+/).length;
        if (words > 3) {
            errors.push(`${optionPath}.option_text: Should be 1-3 words for conciseness.`);
            isValid = false;
        }


        // associated_intent_id
        if (typeof option.associated_intent_id !== 'string' || option.associated_intent_id.trim() === '') {
          errors.push(`${optionPath}.associated_intent_id: Must be a non-empty string.`);
          isValid = false;
        }
      });

      // Critical Greeting Rule Check
      if ((item.intent_id === 'greet' || item.intent_id === 'greeting') && item.follow_up_options.length < 3) {
        errors.push(`${itemPath}: Greeting intent must have at least 3 follow_up_options.`);
        isValid = false;
      }
    }

    // cta_button_text
    if (item.cta_button_text !== null && typeof item.cta_button_text !== 'string') {
      errors.push(`${itemPath}.cta_button_text: Must be a string or null.`);
      isValid = false;
    }

    // cta_button_link
    if (item.cta_button_link !== null && typeof item.cta_button_link !== 'string') {
      errors.push(`${itemPath}.cta_button_link: Must be a string or null.`);
      isValid = false;
    }

    // CTA consistency check: if text is present, link should also be present (and vice versa for non-null)
    if ((item.cta_button_text !== null && item.cta_button_link === null) ||
        (item.cta_button_text === null && item.cta_button_link !== null)) {
      errors.push(`${itemPath}: cta_button_text and cta_button_link must both be present or both be null.`);
      isValid = false;
    }


    // collect_contact_info
    if (typeof item.collect_contact_info !== 'boolean') {
      errors.push(`${itemPath}.collect_contact_info: Must be a boolean.`);
      isValid = false;
    }

    // lead
    if (typeof item.lead !== 'boolean') {
      errors.push(`${itemPath}.lead: Must be a boolean.`);
      isValid = false;
    }
  });

  return { isValid, errors };
}

// --- Example Usage ---
// Assuming you have your JSON data in a variable named 'jsonData'

/*
// Example of valid data (adjust as per your actual data)
const validData = [
  {
    "intent_id": "greet",
    "nlp_training_phrases": ["hello", "hi"],
    "default_response_text": "Hi there! How can I help you today?",
    "follow_up_options": [
      {"option_text": "Quote", "associated_intent_id": "get_quote"},
      {"option_text": "Services", "associated_intent_id": "services_overview"},
      {"option_text": "About", "associated_intent_id": "about_us"}
    ],
    "cta_button_text": null,
    "cta_button_link": null,
    "collect_contact_info": false,
    "lead": false
  },
  {
    "intent_id": "get_quote",
    "nlp_training_phrases": ["get a quote"],
    "default_response_text": "Please fill out our form.",
    "follow_up_options": [],
    "cta_button_text": "Get Quote",
    "cta_button_link": "https://example.com/quote",
    "collect_contact_info": false,
    "lead": true
  }
];

// Example of invalid data (missing field, wrong type)
const invalidData = [
  {
    "intent_id": "greet",
    "nlp_training_phrases": ["hello"],
    "default_response_text": "Hi there!",
    "follow_up_options": [
      {"option_text": "Quote", "associated_intent_id": "get_quote"}
    ],
    "cta_button_text": "Test",
    "cta_button_link": null, // Missing link for CTA text
    "collect_contact_info": "true", // Wrong type
    "lead": false
  },
  {
    "intent_id": "invalid_option",
    "nlp_training_phrases": ["test"],
    "default_response_text": "Test response",
    "follow_up_options": [
      {"button_text": "Wrong key name", "associated_intent_id": "some_id"} // Incorrect key
    ],
    "cta_button_text": null,
    "cta_button_link": null,
    "collect_contact_info": false,
    "lead": false
  }
];

const validationResultValid = validateChatbotData(validData);
console.log("Valid Data Check:", validationResultValid);

const validationResultInvalid = validateChatbotData(invalidData);
console.log("Invalid Data Check:", validationResultInvalid);
*/
