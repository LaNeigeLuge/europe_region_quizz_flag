// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled copy of the array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Get localized country name from country code
 * @param {string} countryCode - Country code (e.g., 'france', 'germany')
 * @returns {string} - Localized country name
 */
function getCountryName(countryCode) {
    const countries = {
        'france': 'France',
        'germany': 'Allemagne',
        'switzerland': 'Suisse',
        'spain': 'Espagne',
        'italy': 'Italie',
        'belgium': 'Belgique',
        'netherlands': 'Pays-Bas',
        'austria': 'Autriche',
        'ireland': 'Irlande',
        'czechia': 'Tchéquie',
        'croatia': 'Croatie',
        'greece': 'Grèce'
    };
    return countries[countryCode] || countryCode;
}

/**
 * Get number of questions based on difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {number} - Number of questions
 */
function getQuestionCount(difficulty) {
    const counts = {
        'easy': 5,
        'medium': 10,
        'hard': 15
    };
    return counts[difficulty] || 10;
}
