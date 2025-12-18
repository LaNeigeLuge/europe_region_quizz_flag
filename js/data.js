// ============================================
// DATA MANAGEMENT
// ============================================

/**
 * Load regions data from JSON file
 * @returns {Promise<Object>} - Data object containing regions, metadata, trap_groups, visual_groups
 */
async function loadRegionsData() {
    try {
        const response = await fetch('data/regions.json');
        const data = await response.json();
        console.log(data.regions.length + ' regions loaded');
        return data;
    } catch (error) {
        console.error('Error loading data', error);
        alert('Erreur lors du chargement des données. Veuillez recharger la page.');
        throw error;
    }
}

/**
 * Filter regions by difficulty level
 * @param {Array} regions - Array of region objects
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Array} - Filtered regions
 */
function filterRegionsByDifficulty(regions, difficulty) {
    switch (difficulty) {
        case 'easy':
            return regions.filter(r => r.difficulty <= 2);
        case 'medium':
            return regions;
        case 'hard':
            return regions.filter(r => r.difficulty >= 2);
        default:
            return regions;
    }
}

/**
 * Select questions based on difficulty with weighted distribution
 * @param {Array} availableRegions - Regions to choose from
 * @param {number} numQuestions - Number of questions to select
 * @param {string} difficulty - Difficulty level
 * @returns {Array} - Selected regions for questions
 */
function selectQuestionsForDifficulty(availableRegions, numQuestions, difficulty) {
    if (difficulty === 'easy' || difficulty === 'hard') {
        return shuffleArray(availableRegions).slice(0, numQuestions);
    }

    // Medium mode: weighted mix
    const easy = availableRegions.filter(r => r.difficulty <= 2);
    const medium = availableRegions.filter(r => r.difficulty === 3);
    const hard = availableRegions.filter(r => r.difficulty >= 4);

    const numEasy = Math.floor(numQuestions * 0.5);
    const numMedium = Math.floor(numQuestions * 0.3);
    const numHard = numQuestions - numEasy - numMedium;

    const selected = [
        ...shuffleArray(easy).slice(0, numEasy),
        ...shuffleArray(medium).slice(0, numMedium),
        ...shuffleArray(hard).slice(0, numHard)
    ];

    return shuffleArray(selected);
}

/**
 * Determine which questions should be trap questions
 * @param {number} numQuestions - Total number of questions
 * @param {string} difficulty - Difficulty level
 * @returns {Array} - Array of trap question configurations
 */
function determineTrapQuestions(numQuestions, difficulty) {
    if (difficulty !== 'hard') {
        return [];
    }

    const trapIndices = [];

    if (numQuestions >= 15) {
        trapIndices.push({
            index: 14,
            type: 'similar_names'
        });
    }

    const visualTrapInterval = 10;
    for (let i = visualTrapInterval - 1; i < numQuestions; i += visualTrapInterval) {
        trapIndices.push({
            index: i,
            type: 'visual_similarity'
        });
    }

    return trapIndices;
}

/**
 * Create a trap question with similar region names
 * @param {Object} correctRegion - The correct region
 * @param {Object} metadata - Full metadata with trap_groups
 * @param {Array} allRegions - All available regions
 * @returns {Object|null} - Trap question data or null
 */
function createSimilarNamesTrap(correctRegion, metadata, allRegions) {
    const trapGroup = correctRegion.trap_group;
    if (!trapGroup) return null;

    const groupData = metadata.trap_groups[trapGroup];
    if (!groupData) return null;

    const groupRegions = allRegions.filter(r =>
        groupData.regions.includes(r.name)
    );

    if (groupRegions.length < 3) return null;

    let options = [...groupRegions];

    while (options.length < 4) {
        const similarRegions = allRegions.filter(r =>
            !options.includes(r) &&
            r.country === correctRegion.country
        );
        if (similarRegions.length > 0) {
            options.push(shuffleArray(similarRegions)[0]);
        } else {
            break;
        }
    }

    return {
        type: 'similar_names',
        options: shuffleArray(options).slice(0, 4),
        message: 'Question Piège - Noms Similaires'
    };
}

/**
 * Create a trap question with visually similar flags
 * @param {Object} correctRegion - The correct region
 * @param {Object} metadata - Full metadata with visual_groups
 * @param {Array} allRegions - All available regions
 * @returns {Object|null} - Trap question data or null
 */
function createVisualSimilarityTrap(correctRegion, metadata, allRegions) {
    const visualGroup = correctRegion.visual_group;
    if (!visualGroup) {
        const sameCountry = allRegions.filter(r =>
            r.country === correctRegion.country &&
            r.name !== correctRegion.name
        );

        if (sameCountry.length >= 3) {
            return {
                type: 'visual_similarity',
                options: shuffleArray([correctRegion, ...shuffleArray(sameCountry).slice(0, 3)]),
                message: 'Question Piège - Drapeaux Similaires'
            };
        }
        return null;
    }

    const groupData = metadata.visual_groups[visualGroup];
    if (!groupData) return null;

    const groupRegions = allRegions.filter(r =>
        groupData.regions.includes(r.name) &&
        r.name !== correctRegion.name
    );

    if (groupRegions.length < 2) return null;

    let options = shuffleArray([correctRegion, ...shuffleArray(groupRegions).slice(0, 3)]);

    return {
        type: 'visual_similarity',
        options: options,
        message: 'Question Piège - Drapeaux Similaires'
    };
}
