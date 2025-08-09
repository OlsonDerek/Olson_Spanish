/**
 * Extract all possible forms of a vocabulary word for phrase highlighting
 * @param {Object} vocabItem - The vocabulary item with spanish, english, type, and conjugations
 * @returns {Array} Array of all possible forms of the word
 */
export function extractVocabForms(vocabItem) {
  const forms = [vocabItem.spanish.toLowerCase()]
  
  // If the word has conjugations, add all conjugated forms
  if (vocabItem.conjugations) {
    Object.values(vocabItem.conjugations).forEach(tenseGroup => {
      if (typeof tenseGroup === 'object') {
        Object.values(tenseGroup).forEach(form => {
          if (typeof form === 'string') {
            forms.push(form.toLowerCase())
          }
        })
      }
    })
  }
  
  // For nouns, add common plural forms
  if (vocabItem.type === 'noun') {
    const word = vocabItem.spanish.toLowerCase()
    
    // Add plural forms
    if (word.endsWith('a')) {
      forms.push(word.slice(0, -1) + 'as') // casa -> casas
    } else if (word.endsWith('o')) {
      forms.push(word.slice(0, -1) + 'os') // libro -> libros
    } else if (word.endsWith('e')) {
      forms.push(word + 's') // estudiante -> estudiantes
    } else if (word.endsWith('l') || word.endsWith('r') || word.endsWith('n')) {
      forms.push(word + 'es') // papel -> papeles
    } else {
      forms.push(word + 's') // general case
    }
  }
  
  // For adjectives, add gender/number variations
  if (vocabItem.type === 'adjective') {
    const word = vocabItem.spanish.toLowerCase()
    
    if (word.endsWith('o')) {
      // masculine -> feminine, singular -> plural
      const stem = word.slice(0, -1)
      forms.push(stem + 'a') // bueno -> buena
      forms.push(stem + 'os') // bueno -> buenos
      forms.push(stem + 'as') // bueno -> buenas
    } else if (word.endsWith('a')) {
      // feminine -> masculine, singular -> plural
      const stem = word.slice(0, -1)
      forms.push(stem + 'o') // buena -> bueno
      forms.push(stem + 'as') // buena -> buenas
      forms.push(stem + 'os') // buena -> buenos
    } else if (!word.endsWith('s')) {
      // Add plural for adjectives ending in consonants
      forms.push(word + 's')
      if (word.endsWith('l') || word.endsWith('r') || word.endsWith('n')) {
        forms.push(word + 'es')
      }
    }
  }
  
  // Remove duplicates and empty strings
  return [...new Set(forms.filter(form => form && form.trim()))]
}

/**
 * Highlight vocabulary words in a phrase, including conjugated and inflected forms
 * @param {string} phrase - The Spanish phrase to highlight
 * @param {Array} vocab - Array of vocabulary items
 * @returns {string} HTML string with highlighted vocabulary
 */
export function highlightVocabInPhrase(phrase, vocab) {
  if (!vocab || vocab.length === 0) return phrase
  
  let highlighted = phrase
  
  // Build a map of all possible forms to their base vocabulary
  const formMap = new Map()
  
  vocab.forEach(vocabItem => {
    const forms = extractVocabForms(vocabItem)
    forms.forEach(form => {
      // Store the longest form for each word to avoid partial matches
      if (!formMap.has(form) || form.length > formMap.get(form).spanish.length) {
        formMap.set(form, vocabItem)
      }
    })
  })
  
  // Sort forms by length (longest first) to avoid partial matches
  const sortedForms = Array.from(formMap.keys()).sort((a, b) => b.length - a.length)
  
  sortedForms.forEach(form => {
    const vocabItem = formMap.get(form)
    // Create a regex that matches whole words (with word boundaries)
    // Handle Spanish characters and accents
    const escapedForm = form.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')
    const regex = new RegExp(`\\\\b${escapedForm}\\\\b`, 'gi')
    
    highlighted = highlighted.replace(regex, (match) => {
      return `<mark class="vocab-highlight" data-vocab-id="${vocabItem.id}" title="${vocabItem.english}">${match}</mark>`
    })
  })
  
  return highlighted
}