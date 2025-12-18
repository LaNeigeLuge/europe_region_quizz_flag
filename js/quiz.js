// Quiz des Drapeaux Régionaux Européens - Version Unifiée
// Supporte mode normal et mode avancé

// Détection du mode
const urlParams = new URLSearchParams(window.location.search);
const isAdvancedMode = urlParams.get('mode') === 'advanced';

// État de l'application
let quizState = {
    selectedCountries: [],
    selectedDifficulty: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    regions: [],
    advancedData: null,
    trapQuestions: [],
    isAdvanced: isAdvancedMode
};

// Sélecteurs DOM
const setupScreen = document.getElementById('setupScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const modeSwitcher = document.getElementById('modeSwitcher');
const difficultyButtons = document.getElementById('difficultyButtons');

// Initialiser l'interface selon le mode
function setupModeUI() {
    if (isAdvancedMode) {
        modeSwitcher.innerHTML = `
            <span class="advanced-badge">🔥 Mode Avancé</span>
            <a href="index.html" class="normal-link">Mode Normal</a>
        `;
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
    } else {
        modeSwitcher.innerHTML = `
            <span class="normal-badge">Mode Normal</span>
            <a href="index.html?mode=advanced" class="advanced-link">🔥 Mode Avancé</a>
        `;
        difficultyButtons.innerHTML = `
            <button class="option-btn" data-difficulty="easy">
                <span>Facile<br>(5 questions)</span>
            </button>
            <button class="option-btn" data-difficulty="medium">
                <span>Moyen<br>(10 questions)</span>
            </button>
            <button class="option-btn" data-difficulty="hard">
                <span>Difficile<br>(15 questions)</span>
            </button>
        `;
    }
}

// Chargement des données
async function loadData() {
    try {
        const dataFile = isAdvancedMode ? 'data/regions_advanced.json' : 'data/regions.json';
        const response = await fetch(dataFile);
        const data = await response.json();

        if (isAdvancedMode) {
            quizState.advancedData = data;
            quizState.regions = data.regions;
            console.log(quizState.regions.length + ' regions loaded (advanced mode)');
        } else {
            quizState.regions = data.regions;
            console.log(quizState.regions.length + ' regions loaded');
        }
    } catch (error) {
        console.error('Error loading data', error);
        alert('Erreur lors du chargement des données. Veuillez recharger la page.');
    }
}

// Configuration du quiz
function setupCountrySelection() {
    document.querySelectorAll('[data-country]').forEach(btn => {
        btn.addEventListener('click', () => {
            const country = btn.dataset.country;

            if (country === 'all') {
                document.querySelectorAll('[data-country]').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                quizState.selectedCountries = ['all'];
            } else {
                const allBtn = document.querySelector('[data-country="all"]');
                allBtn.classList.remove('selected');

                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected');
                    quizState.selectedCountries = quizState.selectedCountries.filter(c => c !== country);
                } else {
                    btn.classList.add('selected');
                    quizState.selectedCountries.push(country);
                }

                if (quizState.selectedCountries.length === 0) {
                    quizState.selectedCountries = [];
                }
            }

            checkStartButton();
        });
    });
}

function setupDifficultySelection() {
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            quizState.selectedDifficulty = btn.dataset.difficulty;
            checkStartButton();
        });
    });
}

function checkStartButton() {
    if (quizState.selectedCountries.length > 0 && quizState.selectedDifficulty) {
        startBtn.disabled = false;
    }
}

// Logique avancée - Filtrage par difficulté
function filterRegionsByDifficulty(regions, difficulty) {
    if (!isAdvancedMode) return regions;

    switch(difficulty) {
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

function selectQuestionsForDifficulty(availableRegions, numQuestions, difficulty) {
    if (!isAdvancedMode || difficulty === 'easy' || difficulty === 'hard') {
        return shuffleArray(availableRegions).slice(0, numQuestions);
    }

    // Mode moyen : mix pondéré
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

// Logique des questions pièges (mode avancé uniquement)
function determineTrapQuestions(numQuestions, difficulty) {
    if (!isAdvancedMode || difficulty !== 'hard') {
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

function createSimilarNamesTrap(correctRegion) {
    const trapGroup = correctRegion.trap_group;
    if (!trapGroup) return null;

    const groupData = quizState.advancedData.trap_groups[trapGroup];
    if (!groupData) return null;

    const groupRegions = quizState.regions.filter(r =>
        groupData.regions.includes(r.name)
    );

    if (groupRegions.length < 3) return null;

    let options = [...groupRegions];

    while (options.length < 4) {
        const similarRegions = quizState.regions.filter(r =>
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

function createVisualSimilarityTrap(correctRegion) {
    const visualGroup = correctRegion.visual_group;
    if (!visualGroup) {
        const sameCountry = quizState.regions.filter(r =>
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

    const groupData = quizState.advancedData.visual_groups[visualGroup];
    if (!groupData) return null;

    const groupRegions = quizState.regions.filter(r =>
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

// Logique du quiz
function startQuiz() {
    let availableRegions = quizState.selectedCountries.includes('all')
        ? [...quizState.regions]
        : quizState.regions.filter(r => quizState.selectedCountries.includes(r.country));

    availableRegions = filterRegionsByDifficulty(availableRegions, quizState.selectedDifficulty);

    const numQuestions = {
        'easy': 5,
        'medium': 10,
        'hard': 15
    }[quizState.selectedDifficulty];

    if (availableRegions.length < numQuestions) {
        alert('Pas assez de régions disponibles pour ce pays (minimum ' + numQuestions + ' requis)');
        return;
    }

    quizState.questions = selectQuestionsForDifficulty(availableRegions, numQuestions, quizState.selectedDifficulty);
    quizState.trapQuestions = determineTrapQuestions(numQuestions, quizState.selectedDifficulty);

    if (isAdvancedMode && quizState.trapQuestions.length > 0) {
        console.log('Mode: ' + quizState.selectedDifficulty);
        console.log(numQuestions + ' questions');
        console.log(quizState.trapQuestions.length + ' trap questions at positions: ' +
            quizState.trapQuestions.map(t => t.index + 1).join(', '));
    }

    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.answered = false;

    setupScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    document.getElementById('totalQuestions').textContent = numQuestions;

    showQuestion();
}

function showQuestion() {
    const questionIndex = quizState.currentQuestionIndex;
    const question = quizState.questions[questionIndex];
    quizState.answered = false;

    const trapInfo = isAdvancedMode ? quizState.trapQuestions.find(t => t.index === questionIndex) : null;
    const isTrap = !!trapInfo;

    document.getElementById('currentQuestion').textContent = questionIndex + 1;
    document.getElementById('scoreValue').textContent = quizState.score;

    const progress = (questionIndex / quizState.questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    document.getElementById('flagImage').src = question.flag;
    document.getElementById('flagImage').alt = 'Drapeau de ' + question.name;

    const trapIndicator = document.getElementById('trapIndicator');
    if (isTrap && trapIndicator) {
        let trapData;
        if (trapInfo.type === 'similar_names') {
            trapData = createSimilarNamesTrap(question);
        } else if (trapInfo.type === 'visual_similarity') {
            trapData = createVisualSimilarityTrap(question);
        }

        if (trapData) {
            trapIndicator.textContent = trapData.message;
            trapIndicator.classList.remove('hidden');
            trapIndicator.classList.add('trap-' + trapInfo.type);

            displayOptions(trapData.options, question.name);
            return;
        }
    }

    if (trapIndicator) {
        trapIndicator.classList.add('hidden');
        trapIndicator.className = 'trap-indicator hidden';
    }

    const options = generateOptions(question);
    displayOptions(options, question.name);
}

function generateOptions(correctRegion) {
    let availableForWrong = quizState.selectedCountries.includes('all')
        ? quizState.regions.filter(r => r.name !== correctRegion.name)
        : quizState.regions.filter(r => quizState.selectedCountries.includes(r.country) && r.name !== correctRegion.name);

    const wrongAnswers = shuffleArray(availableForWrong).slice(0, 3);

    const allOptions = shuffleArray([correctRegion, ...wrongAnswers]);

    return allOptions;
}

function displayOptions(options, correctAnswer) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option.name;
        btn.addEventListener('click', () => handleAnswer(option.name, correctAnswer, btn));
        container.appendChild(btn);
    });
}

function handleAnswer(selectedAnswer, correctAnswer, selectedBtn) {
    if (quizState.answered) return;

    quizState.answered = true;
    const buttons = document.querySelectorAll('.answer-btn');

    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        quizState.score++;
        document.getElementById('scoreValue').textContent = quizState.score;

        setTimeout(() => {
            quizState.currentQuestionIndex++;

            if (quizState.currentQuestionIndex < quizState.questions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 1500);
    } else {
        // Add shake animation to flag container
        const flagContainer = document.querySelector('.flag-container');
        flagContainer.classList.add('shake');
        setTimeout(() => flagContainer.classList.remove('shake'), 600);

        selectedBtn.classList.add('incorrect');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        // Show feedback modal with educational information
        setTimeout(() => {
            showFeedbackModal(selectedAnswer, correctAnswer);
        }, 800);
    }
}

function showFeedbackModal(wrongAnswer, correctAnswer) {
    const wrongRegion = quizState.regions.find(r => r.name === wrongAnswer);
    const correctRegion = quizState.regions.find(r => r.name === correctAnswer);

    if (!correctRegion) return;

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

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    modal.classList.add('hidden');

    // Move to next question
    setTimeout(() => {
        quizState.currentQuestionIndex++;

        if (quizState.currentQuestionIndex < quizState.questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 300);
}

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
        'ireland': 'Irlande'
    };
    return countries[countryCode] || countryCode;
}

function showResults() {
    const totalQuestions = quizState.questions.length;
    const correctAnswers = quizState.score;
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

    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
}

function resetQuiz() {
    quizState = {
        selectedCountries: [],
        selectedDifficulty: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answered: false,
        regions: quizState.regions,
        advancedData: quizState.advancedData,
        trapQuestions: [],
        isAdvanced: isAdvancedMode
    };

    document.querySelectorAll('[data-country]').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('selected'));
    startBtn.disabled = true;

    resultsScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
}

// Utilitaires
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Initialisation
async function init() {
    console.log('Initializing quiz (' + (isAdvancedMode ? 'advanced' : 'normal') + ' mode)');

    setupModeUI();
    await loadData();

    setupCountrySelection();
    setupDifficultySelection();

    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', resetQuiz);

    // Feedback modal close button
    const feedbackCloseBtn = document.getElementById('feedbackCloseBtn');
    feedbackCloseBtn.addEventListener('click', closeFeedbackModal);

    console.log('Quiz ready');
}

document.addEventListener('DOMContentLoaded', init);
