// Quiz des Drapeaux Régionaux Européens - Version Avancée
// Avec questions pièges et système de difficulté

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
    trapQuestions: []
};

// Sélecteurs DOM

const setupScreen = document.getElementById('setupScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Chargement des données

async function loadAdvancedData() {
    try {
        const response = await fetch('data/regions_advanced.json');
        const data = await response.json();
        quizState.advancedData = data;
        quizState.regions = data.regions;
        console.log(quizState.regions.length + ' regions loaded (advanced mode)');
        console.log(Object.keys(data.trap_groups).length + ' trap groups available');
        console.log(Object.keys(data.visual_groups).length + ' visual groups available');
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

// Logique de sélection des régions

function filterRegionsByDifficulty(regions, difficulty) {
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
    let selected = [];

    if (difficulty === 'easy') {
        selected = shuffleArray(availableRegions).slice(0, numQuestions);
    }
    else if (difficulty === 'medium') {
        const easy = availableRegions.filter(r => r.difficulty <= 2);
        const medium = availableRegions.filter(r => r.difficulty === 3);
        const hard = availableRegions.filter(r => r.difficulty >= 4);

        const numEasy = Math.floor(numQuestions * 0.5);
        const numMedium = Math.floor(numQuestions * 0.3);
        const numHard = numQuestions - numEasy - numMedium;

        selected = [
            ...shuffleArray(easy).slice(0, numEasy),
            ...shuffleArray(medium).slice(0, numMedium),
            ...shuffleArray(hard).slice(0, numHard)
        ];

        selected = shuffleArray(selected);
    }
    else if (difficulty === 'hard') {
        selected = shuffleArray(availableRegions).slice(0, numQuestions);
    }

    return selected;
}

// Logique des questions pièges

function determineTrapQuestions(numQuestions, difficulty) {
    const trapIndices = [];

    if (difficulty !== 'hard') {
        return trapIndices;
    }

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

    console.log('Mode: ' + quizState.selectedDifficulty);
    console.log(numQuestions + ' questions');
    console.log(quizState.trapQuestions.length + ' trap questions at positions: ' +
        quizState.trapQuestions.map(t => t.index + 1).join(', '));

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

    const trapInfo = quizState.trapQuestions.find(t => t.index === questionIndex);
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

    // Désactiver tous les boutons
    buttons.forEach(btn => btn.disabled = true);

    // Vérifier la réponse
    if (selectedAnswer === correctAnswer) {
        selectedBtn.classList.add('correct');
        quizState.score++;
        document.getElementById('scoreValue').textContent = quizState.score;
    } else {
        selectedBtn.classList.add('incorrect');
        // Montrer la bonne réponse
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    // Passer à la question suivante après 2 secondes
    setTimeout(() => {
        quizState.currentQuestionIndex++;

        if (quizState.currentQuestionIndex < quizState.questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 2000);
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
        selectedCountry: null,
        selectedDifficulty: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answered: false,
        regions: quizState.regions,
        advancedData: quizState.advancedData,
        trapQuestions: []
    };

    // Réinitialiser les sélections
    document.querySelectorAll('[data-country]').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('selected'));
    startBtn.disabled = true;

    // Afficher l'écran de configuration
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
    console.log('Initializing quiz (advanced mode)');

    await loadAdvancedData();

    setupCountrySelection();
    setupDifficultySelection();

    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', resetQuiz);

    console.log('Advanced quiz ready');
}

document.addEventListener('DOMContentLoaded', init);
