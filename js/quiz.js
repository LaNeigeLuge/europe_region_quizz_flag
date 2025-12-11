// Quiz des Drapeaux Régionaux Européens
// Logique principale de l'application

// État de l'application

let quizState = {
    selectedCountries: [],
    selectedDifficulty: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    regions: []
};

// Sélecteurs DOM

const setupScreen = document.getElementById('setupScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Chargement des données

async function loadRegionsData() {
    try {
        const response = await fetch('data/regions.json');
        const data = await response.json();
        quizState.regions = data.regions;
        console.log(quizState.regions.length + ' regions loaded');
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

// Logique du quiz

function startQuiz() {
    let availableRegions = quizState.selectedCountries.includes('all')
        ? [...quizState.regions]
        : quizState.regions.filter(r => quizState.selectedCountries.includes(r.country));

    const numQuestions = {
        'easy': 5,
        'medium': 10,
        'hard': 15
    }[quizState.selectedDifficulty];

    if (availableRegions.length < numQuestions) {
        alert('Pas assez de régions disponibles pour ce pays (minimum ' + numQuestions + ' requis)');
        return;
    }

    quizState.questions = shuffleArray(availableRegions).slice(0, numQuestions);
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.answered = false;

    setupScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    document.getElementById('totalQuestions').textContent = numQuestions;

    showQuestion();
}

function showQuestion() {
    const question = quizState.questions[quizState.currentQuestionIndex];
    quizState.answered = false;

    document.getElementById('currentQuestion').textContent = quizState.currentQuestionIndex + 1;
    document.getElementById('scoreValue').textContent = quizState.score;

    const progress = (quizState.currentQuestionIndex / quizState.questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    document.getElementById('flagImage').src = question.flag;
    document.getElementById('flagImage').alt = 'Drapeau de ' + question.name;

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

    if (selectedAnswer === correctAnswer) {
        selectedBtn.classList.add('correct');
        quizState.score++;
        document.getElementById('scoreValue').textContent = quizState.score;
    } else {
        selectedBtn.classList.add('incorrect');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

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
        selectedCountries: [],
        selectedDifficulty: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answered: false,
        regions: quizState.regions
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
    console.log('Initializing quiz');

    await loadRegionsData();

    setupCountrySelection();
    setupDifficultySelection();

    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', resetQuiz);

    console.log('Quiz ready');
}

document.addEventListener('DOMContentLoaded', init);
