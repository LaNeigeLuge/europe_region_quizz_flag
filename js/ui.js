// ============================================
// UI MANAGEMENT & DOM MANIPULATION
// ============================================

/**
 * Setup difficulty buttons UI
 */
function setupDifficultyUI() {
    const difficultyButtons = document.getElementById('difficultyButtons');
    difficultyButtons.innerHTML = `
        <button class="option-btn" data-difficulty="easy">
            <span>Facile<br>(5 questions)<br><small>Régions connues uniquement</small></span>
        </button>
        <button class="option-btn" data-difficulty="medium">
            <span>Moyen<br>(10 questions)<br><small>Mix de régions</small></span>
        </button>
        <button class="option-btn" data-difficulty="hard">
            <span>Difficile<br>(15 questions)<br><small>Avec questions pièges</small></span>
        </button>
    `;
}

/**
 * Display answer options
 * @param {Array} options - Array of region objects
 * @param {string} correctAnswer - The correct region name
 * @param {Function} handleAnswerCallback - Callback function when answer is clicked
 */
function displayOptions(options, correctAnswer, handleAnswerCallback) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option.name;
        btn.addEventListener('click', () => handleAnswerCallback(option.name, correctAnswer, btn));
        container.appendChild(btn);
    });
}

/**
 * Update quiz progress UI
 * @param {number} currentIndex - Current question index
 * @param {number} totalQuestions - Total number of questions
 * @param {number} score - Current score
 */
function updateQuizProgress(currentIndex, totalQuestions, score) {
    document.getElementById('currentQuestion').textContent = currentIndex + 1;
    document.getElementById('scoreValue').textContent = score;

    const progress = (currentIndex / totalQuestions) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

/**
 * Update flag display
 * @param {Object} question - Question object with flag and name
 */
function updateFlagDisplay(question) {
    const flagImg = document.getElementById('flagImage');
    flagImg.src = question.flag;
    flagImg.alt = 'Drapeau de ' + question.name;
}

/**
 * Show or hide trap indicator
 * @param {boolean} isTrap - Whether current question is a trap
 * @param {string} message - Trap message to display
 */
function updateTrapIndicator(isTrap, message = '') {
    const trapIndicator = document.getElementById('trapIndicator');
    if (!trapIndicator) return;

    if (isTrap) {
        trapIndicator.textContent = message;
        trapIndicator.classList.remove('hidden');
    } else {
        trapIndicator.classList.add('hidden');
        trapIndicator.className = 'trap-indicator hidden';
    }
}

/**
 * Add shake animation to flag container
 */
function shakeFlag() {
    const flagContainer = document.querySelector('.flag-container');
    flagContainer.classList.add('shake');
    setTimeout(() => flagContainer.classList.remove('shake'), 600);
}

/**
 * Show feedback modal with educational information
 * @param {string} wrongAnswer - User's wrong answer
 * @param {string} correctAnswer - Correct answer
 * @param {Object} wrongRegion - Wrong region data
 * @param {Object} correctRegion - Correct region data
 */
function showFeedbackModal(wrongAnswer, correctAnswer, wrongRegion, correctRegion) {
    if (!correctRegion) {
        console.error('Correct region not found:', correctAnswer);
        return;
    }

    console.log('Correct region data:', correctRegion);

    // Populate modal with data
    document.getElementById('wrongFlagImg').src = wrongRegion?.flag || '';
    document.getElementById('wrongRegionName').textContent = wrongAnswer;
    document.getElementById('correctFlagImg').src = correctRegion.flag;
    document.getElementById('correctRegionName').textContent = correctAnswer;

    document.getElementById('regionInfoTitle').innerHTML = `📍 ${correctAnswer}`;
    document.getElementById('regionCountry').textContent = `${correctRegion.countryEmoji || ''} ${getCountryName(correctRegion.country)}`;
    document.getElementById('regionPosition').textContent = correctRegion.position || 'Non spécifié';
    document.getElementById('regionCapital').textContent = correctRegion.capital || 'Non spécifié';

    // Show modal
    const modal = document.getElementById('feedbackModal');
    modal.classList.remove('hidden');
}

/**
 * Close feedback modal
 */
function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    modal.classList.add('hidden');
}

/**
 * Show results screen
 * @param {number} score - Final score
 * @param {number} totalQuestions - Total questions
 */
function showResults(score, totalQuestions) {
    const correctAnswers = score;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    let message = '';
    if (percentage === 100) {
        message = "Parfait ! Vous êtes un expert des régions européennes";
    } else if (percentage >= 80) {
        message = "Excellent ! Très bonne maîtrise des drapeaux régionaux";
    } else if (percentage >= 60) {
        message = "Bien joué ! Continuez à vous améliorer";
    } else if (percentage >= 40) {
        message = "Pas mal, mais il y a encore du travail";
    } else {
        message = "Continuez à apprendre, vous progresserez";
    }

    document.getElementById('finalScore').textContent = percentage + '%';
    document.getElementById('resultMessage').textContent = message;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    document.getElementById('percentageScore').textContent = percentage + '%';

    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
}

/**
 * Show screen by ID and hide others
 * @param {string} screenId - ID of screen to show
 */
function showScreen(screenId) {
    const screens = ['setupScreen', 'quizScreen', 'resultsScreen'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (id === screenId) {
            screen.classList.remove('hidden');
        } else {
            screen.classList.add('hidden');
        }
    });
}

/**
 * Show error modal for insufficient regions
 * @param {string} countryNames - Names of selected countries
 * @param {number} available - Number of available regions
 * @param {number} required - Number of required regions
 */
function showErrorModal(countryNames, available, required) {
    document.getElementById('errorCountry').textContent = countryNames;
    document.getElementById('errorAvailable').textContent = available;
    document.getElementById('errorRequired').textContent = required;

    const modal = document.getElementById('errorModal');
    modal.classList.remove('hidden');
}

/**
 * Close error modal
 */
function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.add('hidden');
}
