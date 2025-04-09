// --- START OF SCRIPT ---

// NOTE: The 'biases' and 'quizScenarios' constants are now expected to be loaded
// from biases.js and quizScenarios.js respectively, before this script runs.

// --- Game State & Config ---
const defaultGameState = {
    points: 0, level: 1, xp: 0, xpRequired: 100, streakDays: 0, lastCheckIn: null, // YYYY-MM-DD
    biasesExplored: [], // Array of bias names
    quizzesCompleted: 0,
    achievements: {}, // Key: achievementKey, Value: true
    journalEntries: [], // Array of {id, title, biasName, content, date}
    currentFilter: 'all', currentSearch: '', dailyChallengeBias: null // Bias name
};
let gameState = { ...defaultGameState };
const GAME_STATE_KEY = 'cognitiveBiasGameState'; // Local storage key
const THEME_KEY = 'cognitiveBiasTheme'; // Local storage key for theme
const DEFAULT_THEME = 'dark'; // Default theme

const categoryCounts = {
    memory: biases.filter(b => b.category === 'memory').length,
    social: biases.filter(b => b.category === 'social').length,
    learning: biases.filter(b => b.category === 'learning').length,
    belief: biases.filter(b => b.category === 'belief').length,
    money: biases.filter(b => b.category === 'money').length,
    politics: biases.filter(b => b.category === 'politics').length
};

const achievements = {
    'memory-master': { title: 'Memory Master', description: `Explore all ${categoryCounts.memory} memory biases`, category: 'memory', icon: 'brain', backgroundColor: '#FF6B6B', requiredCount: categoryCounts.memory, points: 100 },
    'social-butterfly': { title: 'Social Butterfly', description: `Explore all ${categoryCounts.social} social biases`, category: 'social', icon: 'users', backgroundColor: '#4ECDC4', requiredCount: categoryCounts.social, points: 150 },
    'perpetual-learner': { title: 'Perpetual Learner', description: `Explore all ${categoryCounts.learning} learning biases`, category: 'learning', icon: 'book', backgroundColor: '#FFD166', requiredCount: categoryCounts.learning, points: 100 },
    'belief-breaker': { title: 'Belief Breaker', description: `Explore all ${categoryCounts.belief} belief biases`, category: 'belief', icon: 'lightbulb', backgroundColor: '#6A0572', requiredCount: categoryCounts.belief, points: 200 },
    'money-minded': { title: 'Money Minded', description: `Explore all ${categoryCounts.money} money biases`, category: 'money', icon: 'coins', backgroundColor: '#5D8233', requiredCount: categoryCounts.money, points: 100 },
    'political-pundit': { title: 'Political Pundit', description: `Explore all ${categoryCounts.politics} politics biases`, category: 'politics', icon: 'landmark', backgroundColor: '#457B9D', requiredCount: categoryCounts.politics, points: 75 },
    'quiz-master': { title: 'Quiz Master', description: 'Complete 10 bias challenges', icon: 'trophy', backgroundColor: '#4F46E5', requiredCount: 10, points: 200 },
    'journal-keeper': { title: 'Journal Keeper', description: 'Create 5 journal entries', icon: 'book-open', backgroundColor: '#EC4899', requiredCount: 5, points: 150 },
    'streak-seeker': { title: 'Streak Seeker', description: 'Maintain a 7-day streak', icon: 'fire-alt', backgroundColor: '#F59E0B', requiredCount: 7, points: 250 },
    'bias-expert': { title: 'Bias Expert', description: 'Reach level 10', icon: 'graduation-cap', backgroundColor: '#374151', requiredCount: 10, points: 500 }
};
const totalAchievementsCount = Object.keys(achievements).length;

// --- DOM Element Cache ---
const userPointsElement = document.getElementById('userPoints');
const userLevelElement = document.getElementById('userLevel');
const currentXPElement = document.getElementById('currentXP');
const requiredXPElement = document.getElementById('requiredXP');
const levelProgressBar = document.getElementById('levelProgressBar');
const biasesExploredElement = document.getElementById('biasesExplored');
const totalBiasesElement = document.getElementById('totalBiases');
const biasesProgressBar = document.getElementById('biasesProgressBar');
const streakCountElement = document.getElementById('streakCount');
const checkInBtn = document.getElementById('checkInBtn');
const dailyPickText = document.getElementById('dailyPickText');
const dailyPickBtn = document.getElementById('dailyPickBtn');
const achievementsContainer = document.getElementById('achievementsSection');
const exploreBtn = document.getElementById('exploreBtn');
const challengeBtn = document.getElementById('challengeBtn');
const journalBtn = document.getElementById('journalBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const exploreContent = document.getElementById('exploreContent');
const challengeContent = document.getElementById('challengeContent');
const journalContent = document.getElementById('journalContent');
const leaderboardContent = document.getElementById('leaderboardContent');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-button');
const randomBiasBtn = document.getElementById('randomBiasBtn');
const showAllBtn = document.getElementById('showAllBtn');
const featuredBiasSection = document.getElementById('featuredBiasSection');
const featuredBiasElement = document.getElementById('featuredBias');
const biasesGrid = document.getElementById('biasesGrid');
const biasesContainer = document.getElementById('biasesContainer');
const noResultsMessage = document.getElementById('noResultsMessage');
const startQuizBtn = document.getElementById('startQuizBtn');
const scenarioBtn = document.getElementById('scenarioBtn');
const addJournalEntryBtn = document.getElementById('addJournalEntryBtn');
const journalEntriesContainer = document.getElementById('journalEntriesContainer');
const userRankRow = document.getElementById('userRankRow');
const shareLeaderboardBtn = document.getElementById('shareLeaderboardBtn');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const tabButtons = [exploreBtn, challengeBtn, journalBtn, leaderboardBtn];
const tabContents = [exploreContent, challengeContent, journalContent, leaderboardContent];
const confettiCanvas = document.getElementById('confetti');
// Burger Menu Elements
const burgerBtn = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');
const closeNavBtn = document.getElementById('closeNavBtn');
const navLinks = mobileNav.querySelectorAll('.nav-link');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const menuOverlay = document.getElementById('menuOverlay');
// const settingsBtn = document.getElementById('settingsBtn'); // Removed
// const settingsPanel = document.getElementById('settingsPanel'); // Removed
// const themeToggle = document.getElementById('themeToggle'); // Removed (using themeToggleMobile now)

// Modals & related elements
const quizModal = document.getElementById('quizModal');
const closeQuizBtn = document.getElementById('closeQuizBtn');
const quizContent = document.getElementById('quizContent');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptionsContainer = document.getElementById('quizOptions');
const scenarioText = document.getElementById('scenarioText');
const submitQuizBtn = document.getElementById('submitQuizBtn');
const quizResult = document.getElementById('quizResult');
const correctAnswerDiv = document.getElementById('correctAnswer');
const wrongAnswerDiv = document.getElementById('wrongAnswer');
const correctBiasName = document.getElementById('correctBiasName');
const correctExplanation = document.getElementById('correctExplanation');
const actualBiasName = document.getElementById('actualBiasName');
const wrongExplanation = document.getElementById('wrongExplanation');
const nextQuizBtn = document.getElementById('nextQuizBtn');
const endQuizBtn = document.getElementById('endQuizBtn');
const quizComplete = document.getElementById('quizComplete');
const correctCount = document.getElementById('correctCount');
const totalCount = document.getElementById('totalCount');
const pointsEarned = document.getElementById('pointsEarned');
const xpEarned = document.getElementById('xpEarned');
const newQuizBtn = document.getElementById('newQuizBtn');
const closeQuizCompleteBtn = document.getElementById('closeQuizCompleteBtn');
const shareQuizResultBtn = document.getElementById('shareQuizResultBtn');

const journalModal = document.getElementById('journalModal');
const closeJournalBtn = document.getElementById('closeJournalBtn');
const journalTitleInput = document.getElementById('journalTitle');
const journalBiasSelect = document.getElementById('journalBias');
const journalContentInput = document.getElementById('journalContentInput');
const saveJournalBtn = document.getElementById('saveJournalBtn');

const scenarioModal = document.getElementById('scenarioModal');
const closeScenarioBtn = document.getElementById('closeScenarioBtn');
const scenarioContainer = document.getElementById('scenarioContainer');
const completeScenarioBtn = document.getElementById('completeScenarioBtn');
const scenarioComplete = document.getElementById('scenarioComplete');
const newScenarioBtn = document.getElementById('newScenarioBtn');
const closeScenarioCompleteBtn = document.getElementById('closeScenarioCompleteBtn');

const levelUpModal = document.getElementById('levelUpModal');
const newLevel = document.getElementById('newLevel');
const closeLevelUpBtn = document.getElementById('closeLevelUpBtn');

const achievementModal = document.getElementById('achievementModal');
const achievementIconContainer = document.getElementById('achievementIconContainer'); // Container for icon div
const achievementIcon = document.getElementById('achievementIcon'); // The icon div itself
const achievementTitle = document.getElementById('achievementTitle');
const achievementDescription = document.getElementById('achievementDescription');
const achievementPoints = document.getElementById('achievementPoints');
const shareAchievementBtn = document.getElementById('shareAchievementBtn');
const closeAchievementBtn = document.getElementById('closeAchievementBtn');

// Bias Detail Modal Elements
const biasDetailModal = document.getElementById('biasDetailModal');
const closeBiasDetailBtn = document.getElementById('closeBiasDetailBtn');
const biasDetailTitle = document.getElementById('biasDetailTitle');
const biasDetailBadge = document.getElementById('biasDetailBadge');
const biasDetailShortDesc = document.getElementById('biasDetailShortDesc');
const biasDetailLongDesc = document.getElementById('biasDetailLongDesc');
const biasDetailExample = document.getElementById('biasDetailExample');
const exploreFromModalBtn = document.getElementById('exploreFromModalBtn');
const exploredInModalText = document.getElementById('exploredInModalText');
let currentBiasInModal = null; // To store the bias object currently shown

// --- Utility Functions ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const openModal = (modal) => modal.classList.remove('hidden');
const closeModal = (modal) => modal.classList.add('hidden');

// --- Theme Management ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    // Update toggle state visually (use the mobile toggle now)
    if (themeToggleMobile) {
        themeToggleMobile.checked = (theme === 'dark');
    }
}

function loadAndApplyTheme() {
    let currentTheme = localStorage.getItem(THEME_KEY);
    if (!currentTheme) {
        currentTheme = DEFAULT_THEME; // Set default if nothing is saved
        localStorage.setItem(THEME_KEY, currentTheme); // Save the default
    }
    applyTheme(currentTheme);
}

// --- State Management ---
function saveGameState() {
    try { localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState)); }
    catch (e) { console.error("Failed to save game state:", e); }
}

function loadGameState() {
    try {
        const savedStateRaw = localStorage.getItem(GAME_STATE_KEY);
        if (savedStateRaw) {
            const parsedState = JSON.parse(savedStateRaw);
            gameState = { ...defaultGameState, ...parsedState };
            // Data type validation/coercion
            gameState.points = Number(gameState.points) || 0;
            gameState.level = Number(gameState.level) || 1;
            gameState.xp = Number(gameState.xp) || 0;
            gameState.xpRequired = Number(gameState.xpRequired) || 100;
            gameState.streakDays = Number(gameState.streakDays) || 0;
            gameState.quizzesCompleted = Number(gameState.quizzesCompleted) || 0;
            gameState.biasesExplored = Array.isArray(gameState.biasesExplored) ? gameState.biasesExplored : [];
            gameState.journalEntries = Array.isArray(gameState.journalEntries) ? gameState.journalEntries : [];
            gameState.achievements = typeof gameState.achievements === 'object' && gameState.achievements !== null ? gameState.achievements : {};
        } else {
            gameState = { ...defaultGameState };
        }
    } catch (e) {
        console.error("Failed to load/parse game state, resetting:", e);
        gameState = { ...defaultGameState };
    }
}

function resetGameState() {
    if (confirm("Are you sure you want to reset ALL your progress?\nThis action cannot be undone.")) {
        localStorage.removeItem(GAME_STATE_KEY);
        gameState = { ...defaultGameState }; // Reset in-memory state
        setDailyChallengeBias(); // Set a new challenge for the reset state
        saveGameState(); // Save the fresh default state
        initializeGame(); // Re-initialize the UI and logic fully
        alert("Progress has been reset.");
        window.location.reload(); // Force reload for cleanest possible state
    }
}

// --- UI Update Functions ---
function updateUI() {
    userPointsElement.textContent = gameState.points.toLocaleString();
    userLevelElement.textContent = gameState.level;
    currentXPElement.textContent = gameState.xp.toLocaleString();
    requiredXPElement.textContent = gameState.xpRequired.toLocaleString();
    levelProgressBar.style.width = `${Math.min(100, (gameState.xp / gameState.xpRequired) * 100)}%`;
    biasesExploredElement.textContent = gameState.biasesExplored.length;
    totalBiasesElement.textContent = totalBiasesCount; // Use the constant calculated from data
    biasesProgressBar.style.width = `${Math.min(100, (gameState.biasesExplored.length / totalBiasesCount) * 100)}%`;
    streakCountElement.textContent = gameState.streakDays;
    // Update sticky header
    document.getElementById('userLevelSticky').textContent = gameState.level;
    document.getElementById('userPointsSticky').textContent = gameState.points.toLocaleString();
    document.getElementById('currentXPSticky').textContent = gameState.xp.toLocaleString();
    document.getElementById('requiredXPSticky').textContent = gameState.xpRequired.toLocaleString();
    document.getElementById('levelProgressBarSticky').style.width = `${Math.min(100, (gameState.xp / gameState.xpRequired) * 100)}%`;
    document.getElementById('biasesExploredSticky').textContent = gameState.biasesExplored.length;
    document.getElementById('totalBiasesSticky').textContent = totalBiasesCount;
    document.getElementById('biasesProgressBarSticky').style.width = `${Math.min(100, (gameState.biasesExplored.length / totalBiasesCount) * 100)}%`;
    updateCheckInButton();
    updateDailyChallenge();
    updateAchievementProgress();
    updateLeaderboardUserRow();
}

function setupStickyHeader() {
    const stickyHeader = document.getElementById('stickyHeader');
    let lastScrollY = window.scrollY;
    const showThreshold = 200; // Show header after scrolling this many pixels

    window.addEventListener('scroll', () => {
        if (window.scrollY > showThreshold) {
            stickyHeader.classList.add('visible');
        } else {
            stickyHeader.classList.remove('visible');
        }
        lastScrollY = window.scrollY;
    });
}

function updateCheckInButton() {
    const today = getTodayDateString();
    const isChecked = gameState.lastCheckIn === today;
    if (checkInBtn) {
        checkInBtn.textContent = isChecked ? 'Checked In Today!' : 'Check In Today';
        checkInBtn.disabled = isChecked;
    } else {
        console.error("Could not find checkInBtn element in updateCheckInButton");
    }
}

function updateDailyChallenge() {
    if (!gameState.dailyChallengeBias) setDailyChallengeBias(); // Ensure one is set
    const bias = biases.find(b => b.name === gameState.dailyChallengeBias);
    dailyPickText.textContent = bias ? `Learn about "${bias.name}"!` : `Explore a new bias today!`;
    // Optionally disable button if the challenge bias is locked
    dailyPickBtn.disabled = bias ? bias.requiredLevel > gameState.level : true;
    if (dailyPickBtn.disabled) {
        dailyPickText.textContent += ` (Requires Lvl ${bias?.requiredLevel})`;
        dailyPickBtn.title = `Requires Level ${bias?.requiredLevel} to start`;
    } else {
        dailyPickBtn.title = '';
    }
}


function updateLeaderboardUserRow() {
    userRankRow.querySelector('td:nth-child(3) div').textContent = gameState.level;
    userRankRow.querySelector('td:nth-child(4) div').textContent = gameState.points.toLocaleString();
    userRankRow.querySelector('td:nth-child(5) div').textContent = `${Object.keys(gameState.achievements).length}/${totalAchievementsCount}`;
}

function updateAchievementProgress() {
    for (const key in achievements) {
        const achievement = achievements[key];
        const element = achievementsContainer.querySelector(`[data-achievement="${key}"]`);
        if (!element) continue;
        const textElement = element.parentElement.querySelector('.text-xs');
        if (!textElement) continue;

        let currentCount = 0;
        const isUnlocked = (gameState.achievements && gameState.achievements[key] === true) || false;

        // Calculate current progress based on achievement type
        if (achievement.category) {
            const categoryBiases = biases.filter(b => b.category === achievement.category);
            const unlockedInCategory = categoryBiases.filter(b => b.requiredLevel <= gameState.level);
            const exploredUnlockedInCategory = unlockedInCategory.filter(b => gameState.biasesExplored.includes(b.name)).length;
            // Note: Required count for category achievements should ideally be based on total in category, not just unlocked ones
            // But display progress based on *explorable* items
            textElement.textContent = `${exploredUnlockedInCategory}/${achievement.requiredCount} biases`;
            currentCount = exploredUnlockedInCategory; // Use this for checking unlock condition below
        } else if (key === 'quiz-master') {
            currentCount = gameState.quizzesCompleted;
            textElement.textContent = `${currentCount}/${achievement.requiredCount} quizzes`;
        } else if (key === 'journal-keeper') {
            currentCount = gameState.journalEntries.length;
            textElement.textContent = `${currentCount}/${achievement.requiredCount} entries`;
        } else if (key === 'streak-seeker') {
            currentCount = gameState.streakDays;
            textElement.textContent = `${currentCount}/${achievement.requiredCount} days`;
        } else if (key === 'bias-expert') {
            currentCount = gameState.level;
            textElement.textContent = `Level ${currentCount}/${achievement.requiredCount}`;
        } else {
            textElement.textContent = `Progress N/A`;
        }
        element.classList.toggle('locked-badge', !isUnlocked);
    }
}

function checkForNewAchievements() {
    let stateChanged = false;
    for (const key in achievements) {
        const achievement = achievements[key];
        const isAlreadyUnlocked = (gameState.achievements && gameState.achievements[key] === true) || false;
        if (isAlreadyUnlocked) continue;

        let currentCount = 0;
        let shouldUnlock = false;

        if (achievement.category) {
            // Recalculate based on *explored* count for the unlock check
            currentCount = gameState.biasesExplored.filter(name => biases.find(b => b.name === name)?.category === achievement.category).length;
            shouldUnlock = currentCount >= achievement.requiredCount;
        } else if (key === 'quiz-master') {
            currentCount = gameState.quizzesCompleted;
            shouldUnlock = currentCount >= achievement.requiredCount;
        } else if (key === 'journal-keeper') {
            currentCount = gameState.journalEntries.length;
            shouldUnlock = currentCount >= achievement.requiredCount;
        } else if (key === 'streak-seeker') {
            currentCount = gameState.streakDays;
            shouldUnlock = currentCount >= achievement.requiredCount;
        } else if (key === 'bias-expert') {
            currentCount = gameState.level;
            shouldUnlock = currentCount >= achievement.requiredCount;
        }

        if (shouldUnlock) {
            unlockAchievement(key);
            stateChanged = true; // Flag that state changed, though save happens in unlockAchievement
        }
    }
}


// --- Bias Exploration ---
function createBiasCard(bias) {
    const isExplored = gameState.biasesExplored.includes(bias.name);
    const isUnlocked = bias.requiredLevel <= gameState.level;
    // Blur is now applied based *only* on lock status, not the filter.

    const card = document.createElement('div');
    // Apply 'locked-bias' class if it's locked, regardless of view mode for consistent styling base
    card.className = `bias-card category-${bias.category} bg-white rounded-lg shadow-md overflow-hidden animate-slideInUp flex flex-col ${!isUnlocked ? 'locked-bias' : ''}`;
    card.dataset.category = bias.category;
    card.dataset.name = bias.name.toLowerCase();
    card.style.animationDelay = `${Math.random() * 0.2}s`;

    // --- Button/Status generation logic remains mostly the same ---
    // It correctly disables buttons/shows lock status based purely on `isUnlocked`
    let exploreStatusHTML = '';
    let readMoreButtonHTML = '';

    if (isUnlocked) {
        readMoreButtonHTML = `
            <button class="read-more-btn text-indigo-600 hover:text-indigo-800 text-xs font-medium py-1 transition duration-200" data-bias-id="${bias.id}">
                Read More <i class="fas fa-info-circle text-xs ml-1"></i>
            </button>`;
        exploreStatusHTML = !isExplored
            ? `<button class="explore-bias-btn bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-1 px-2.5 rounded-full text-xs transition duration-200" data-bias="${bias.name}"><i class="fas fa-check mr-1"></i> Mark Explored</button>`
            : `<span class="inline-flex items-center bg-green-100 text-green-700 font-medium py-1 px-2.5 rounded-full text-xs"><i class="fas fa-check-circle mr-1"></i> Explored</span>`;
    } else {
        // Locked state visuals (buttons/status text) - no changes needed here
        readMoreButtonHTML = `
            <button class="read-more-btn text-gray-400 text-xs font-medium py-1 transition duration-200 disabled" disabled data-bias-id="${bias.id}" title="Requires Level ${bias.requiredLevel}">
                Read More <i class="fas fa-lock text-xs ml-1"></i>
            </button>`;
        exploreStatusHTML = `<span class="inline-flex items-center bg-gray-100 text-gray-500 font-medium py-1 px-2.5 rounded-full text-xs" title="Requires Level ${bias.requiredLevel}"><i class="fas fa-lock mr-1"></i> Locked</span>`;
    }
    // --- End button logic ---

    // Apply blur class directly if the card is locked
    const descBlurClass = !isUnlocked ? 'blur-text' : '';
    const exampleBlurClass = !isUnlocked ? 'blur-text' : '';

    card.innerHTML = `
        ${!isUnlocked ? `<div class="locked-indicator" title="Requires Level ${bias.requiredLevel}"><i class="fas fa-lock"></i> Lvl ${bias.requiredLevel}</div>` : ''}
        <div class="p-5 flex flex-col h-full">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold text-gray-800 flex-1 mr-2">${bias.name}</h3>
                <span class="badge-${bias.category} text-xs font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 whitespace-nowrap">${bias.category}</span>
            </div>

            
            <p class="text-sm text-gray-600 mb-3 short-desc ${descBlurClass}">${bias.description}</p>

            <div class="bg-gray-100 p-2.5 rounded mt-auto border border-gray-200 example-section">
                <p class="text-xs text-gray-500 mb-1 font-medium">Example:</p>
                
                <p class="text-xs text-gray-700 italic ${exampleBlurClass}">${bias.example}</p>
            </div>

            <div class="mt-3 flex justify-between items-center controls-area">
                ${readMoreButtonHTML}
                <div class="explore-status">
                    ${exploreStatusHTML}
                </div>
            </div>
        </div>`;

    // --- Event Listeners (only add if unlocked) ---
    if (isUnlocked) {
        const readMoreBtn = card.querySelector('.read-more-btn');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const biasId = e.currentTarget.dataset.biasId;
                openBiasDetailModal(biasId);
            });
        }

        const exploreBtn = card.querySelector('.explore-bias-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exploreBias(bias.name, e.target.closest('.explore-status'));
            });
        }
    } else {
        // Existing logic for locked card feedback (optional)
        card.addEventListener('click', (e) => {
            if (e.target !== card && e.target !== card.querySelector(':scope > div')) return;
            console.log(`Bias "${bias.name}" requires Level ${bias.requiredLevel}`);
            const indicator = card.querySelector('.locked-indicator');
            if (indicator) {
                indicator.classList.add('animate-pulse');
                setTimeout(() => indicator.classList.remove('animate-pulse'), 1000);
            }
        });
    }

    return card;
}


function createFeaturedBiasCard(bias) {
    const isExplored = gameState.biasesExplored.includes(bias.name);
    // Featured bias assumes it's unlocked because it was selected by showRandomBias (which filters)
    const longDescContent = bias.longDescription || "More details coming soon.";

    return `
        <div class="category-${bias.category} animate-fadeIn">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-5">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">${bias.name}</h2>
                    <span class="badge-${bias.category} text-xs font-bold px-2 py-0.5 rounded-full uppercase inline-block mt-1.5">${bias.category}</span>
                </div>
                <button id="backToAllBtn" class="mt-3 md:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm"><i class="fas fa-arrow-left mr-2"></i> Back to Grid</button>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-700 mb-1">Quick Summary</h3>
                <p class="text-sm text-gray-600">${bias.description}</p>
            </div>
            <div class="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100">
                <h3 class="text-base font-semibold text-indigo-800 mb-1">In-Depth Overview</h3>
                <p class="text-sm text-indigo-900 leading-relaxed">${longDescContent}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-700 mb-1">Example</h3>
                <p class="text-sm text-gray-600 italic">${bias.example}</p>
            </div>
            <div class="mt-5 flex justify-center explore-status">
                ${!isExplored ? `<button id="exploreFeaturedBiasBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg transition duration-200 text-sm" data-bias="${bias.name}"><i class="fas fa-check mr-2"></i> Mark as Explored</button>`
            : `<span class="inline-flex items-center bg-green-100 text-green-700 font-medium py-2 px-5 rounded-lg text-sm"><i class="fas fa-check-circle mr-2"></i> Explored</span>`}
            </div>
        </div>`;
}

function renderBiases() {
    biasesContainer.innerHTML = '';
    let visibleCount = 0; // Counts cards actually appended
    const fragment = document.createDocumentFragment();
    const searchLower = gameState.currentSearch.toLowerCase();
    // Implement multi-level sort: Unlocked first, then alphabetical
    const allBiasesSorted = [...biases].sort((a, b) => {
        const aUnlocked = a.requiredLevel <= gameState.level;
        const bUnlocked = b.requiredLevel <= gameState.level;
        if (aUnlocked && !bUnlocked) return -1; // a (unlocked) comes before b (locked)
        if (!aUnlocked && bUnlocked) return 1;  // b (unlocked) comes before a (locked)
        return a.name.localeCompare(b.name); // Otherwise, sort alphabetically
    });

    // Iterate through all biases, applying filters below.

    allBiasesSorted.forEach(bias => {
        const isUnlocked = bias.requiredLevel <= gameState.level;

        // --- Filter Logic ---
        // 1. Check level filter: ONLY skip locked biases if the 'all' (All Unlocked) filter is active.
        // if (gameState.currentFilter === 'all' && !isUnlocked) {
        //     return; // Skip locked biases only for the "All Unlocked" view
        // }

        // 2. Check category filter: Skip if a category filter is active AND it doesn't match.
        //    ('all' and 'all-with-locked' filters pass this check).
        const isCategoryFilterActive = gameState.currentFilter && gameState.currentFilter !== 'all';
        if (isCategoryFilterActive && bias.category !== gameState.currentFilter) {
            return; // Skip if category doesn't match the active category filter
        }

        // 3. Check search filter
        const matchesSearch = !searchLower || bias.name.toLowerCase().includes(searchLower) || bias.description.toLowerCase().includes(searchLower) || bias.example.toLowerCase().includes(searchLower) || bias.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
            return; // Skip if search doesn't match
        }
        // --- End Filter Logic ---

        // If we reach here, the bias should be displayed (unlocked)
        fragment.appendChild(createBiasCard(bias)); // createBiasCard handles visual locking/blurring
        visibleCount++;
    });

    biasesContainer.appendChild(fragment);

    // --- Update No Results Logic ---
    noResultsMessage.classList.toggle('hidden', visibleCount > 0);

    if (visibleCount === 0) {
        // Determine the reason for no results
        const anyUnlockedBiasesExist = biases.some(b => b.requiredLevel <= gameState.level);
        if (!anyUnlockedBiasesExist && gameState.level === 1) {
            noResultsMessage.innerHTML = `
                  <i class="fas fa-rocket text-4xl text-gray-400 mb-4"></i>
                  <h3 class="text-xl font-semibold text-gray-600">Welcome, Explorer!</h3>
                  <p class="text-gray-500 mt-2">Your journey begins. Level up to unlock your first biases!</p>`;
        } else {
            // Default message if filters/search match nothing
            noResultsMessage.innerHTML = `
                  <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                  <h3 class="text-xl font-semibold text-gray-600">No biases found</h3>
                  <p class="text-gray-500 mt-2">Try adjusting your search or filters.</p>`;
        }
    }
}

function showSelectedBiasOption() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedBiasOption = categoryFilter.querySelector('option[value="selectedBias"]');
    selectedBiasOption.hidden = false;
    categoryFilter.value = 'selectedBias';
}

function hideSelectedBiasOption() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedBiasOption = categoryFilter.querySelector('option[value="selectedBias"]');
    selectedBiasOption.hidden = true;
    if (categoryFilter.value === 'selectedBias') {
        categoryFilter.value = 'all';
    }
}

function showRandomBias() {
    const availableBiases = biases.filter(b => b.requiredLevel <= gameState.level);
    if (availableBiases.length === 0) {
        alert("Level up to unlock your first biases!");
        return;
    }

    const unexploredAvailable = availableBiases.filter(b => !gameState.biasesExplored.includes(b.name));
    const biasToShow = unexploredAvailable.length > 0
        ? unexploredAvailable[Math.floor(Math.random() * unexploredAvailable.length)]
        : availableBiases[Math.floor(Math.random() * availableBiases.length)];

    featuredBiasElement.innerHTML = createFeaturedBiasCard(biasToShow);
    featuredBiasSection.classList.remove('hidden');
    biasesGrid.classList.add('hidden');
    attachFeaturedBiasListeners(biasToShow);
    showSelectedBiasOption();
    window.scrollTo({ top: featuredBiasSection.offsetTop - 20, behavior: 'smooth' });
}

function attachFeaturedBiasListeners(bias) {
    document.getElementById('backToAllBtn')?.addEventListener('click', () => {
        featuredBiasSection.classList.add('hidden');
        biasesGrid.classList.remove('hidden');
        hideSelectedBiasOption();
        renderBiases();
    });
    // Target the container div now
    const exploreBtnContainer = document.querySelector('#featuredBias .explore-status');
    const exploreBtn = exploreBtnContainer?.querySelector('#exploreFeaturedBiasBtn');

    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => exploreBias(bias.name, exploreBtnContainer, true));
    }
}

function exploreBias(biasName, statusContainerElement = null, isFeatured = false) {
    const bias = biases.find(b => b.name === biasName);
    // Add check: Can only explore if bias is unlocked
    if (!bias || bias.requiredLevel > gameState.level) {
        console.warn(`Attempted to explore locked bias: ${biasName}`);
        // Optionally provide user feedback, e.g., flashing the lock icon
        return;
    }

    if (gameState.biasesExplored.includes(biasName)) {
        return; // Already explored
    }

    // 1. Update State & Animate
    gameState.biasesExplored.push(biasName);
    addPoints(20);
    addXP(5);
    const sourceElementForAnim = statusContainerElement?.querySelector('button') || document.getElementById('exploreFromModalBtn') || userPointsElement; // Include modal button as possible source
    showPointsAnimation(20, sourceElementForAnim);

    // 2. Update Visuals (Triggering Element OR Find Card in Grid)
    if (statusContainerElement) {
        // Called from Grid Card or Featured Card
        if (isFeatured) {
            // Re-render featured card entirely
            featuredBiasElement.innerHTML = createFeaturedBiasCard(bias);
            attachFeaturedBiasListeners(bias);
        } else {
            // Update the specific grid card's status div directly
            statusContainerElement.innerHTML = `<span class="inline-flex items-center bg-green-100 text-green-700 font-medium py-1 px-2.5 rounded-full text-xs"><i class="fas fa-check-circle mr-1"></i> Explored</span>`;
        }
    } else {
        // --- ADDED: Called from Modal - Find and update the corresponding grid card ---
        // Find the card in the grid using the data-name attribute
        const gridCard = biasesContainer.querySelector(`.bias-card[data-name="${biasName.toLowerCase()}"]`);
        if (gridCard) {
            const gridCardStatusDiv = gridCard.querySelector('.explore-status');
            if (gridCardStatusDiv) {
                gridCardStatusDiv.innerHTML = `<span class="inline-flex items-center bg-green-100 text-green-700 font-medium py-1 px-2.5 rounded-full text-xs"><i class="fas fa-check-circle mr-1"></i> Explored</span>`;
            }
        }
        // --- END ADDED ---
    }

    // 3. Check Achievements, Save State, Update Main UI
    checkForNewAchievements();
    saveGameState();
    updateUI(); // Updates dashboard, achievements panel etc.

    // 4. Update Modal if it's open for this bias
    if (!biasDetailModal.classList.contains('hidden') && currentBiasInModal && currentBiasInModal.name === biasName) {
        exploreFromModalBtn.classList.add('hidden');
        exploredInModalText.classList.remove('hidden');
    }
}

// --- Points, XP, Leveling ---
function addPoints(points) { gameState.points += points; }
function addXP(xp) {
    gameState.xp += xp;
    let leveledUpInThisCall = false;
    while (gameState.xp >= gameState.xpRequired) {
        // levelUp() now handles rendering, UI update, and saving for the level-up event
        levelUp();
        leveledUpInThisCall = true;
    }

    // If no level up happened in this call, we still need to update UI and save
    // for the simple XP gain.
    if (!leveledUpInThisCall) {
        updateUI(); // Update UI for XP gain without level up
        saveGameState(); // Save state if only XP was gained
    }
    // If leveledUpInThisCall is true, levelUp() already handled UI updates and saving.
}

function levelUp() {
    gameState.xp -= gameState.xpRequired;
    gameState.level++;
    // Adjust XP required formula slightly for smoother progression early on
    gameState.xpRequired = Math.floor(100 + (gameState.level - 1) * 50 * Math.pow(1.1, gameState.level - 1));

    console.log(`%c[GAME] Level Up! Reached Level ${gameState.level}`, 'color: green; font-weight: bold;'); // Add logging

    // --- Remove the visibility check and call unconditionally ---
    renderBiases(); // Always re-render biases in the background
    // --- End modification ---

    // Also update other level-dependent things
    populateJournalBiasOptions();
    updateDailyChallenge();

    // Update the main UI display immediately (level number, XP bar etc.)
    // This ensures the dashboard reflects the new level right away
    updateUI();

    // Save the fully updated game state *after* all modifications
    saveGameState();

    // Show the level up modal last - this feels cleaner UX-wise
    showLevelUpModal(gameState.level);
}

// --- Daily Features ---
function handleCheckIn() {
    const today = getTodayDateString();
    if (gameState.lastCheckIn !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        gameState.streakDays = gameState.lastCheckIn === yesterday.toISOString().split('T')[0] ? gameState.streakDays + 1 : 1;
        gameState.lastCheckIn = today;
        const points = 10 + gameState.streakDays * 5;
        addPoints(points);
        addXP(5);
        showPointsAnimation(points, checkInBtn);
        checkForNewAchievements(); // Check if streak unlocked achievement
        saveGameState();
        updateUI();
    }
}

function setDailyChallengeBias() {
    // Filter for biases accessible at the current level
    const availableBiases = biases.filter(b => b.requiredLevel <= gameState.level);
    if (availableBiases.length === 0) {
        // Handle case where no biases are unlocked yet - pick a Level 1 bias
        const levelOneBiases = biases.filter(b => b.requiredLevel === 1);
        gameState.dailyChallengeBias = levelOneBiases.length > 0
            ? levelOneBiases[Math.floor(Math.random() * levelOneBiases.length)].name
            : (biases.length > 0 ? biases[0].name : null); // Absolute fallback
        console.log("No available biases for level, setting Level 1 challenge:", gameState.dailyChallengeBias);
        return;
    }

    const unexploredAvailable = availableBiases.filter(b => !gameState.biasesExplored.includes(b.name));

    gameState.dailyChallengeBias = unexploredAvailable.length > 0
        ? unexploredAvailable[Math.floor(Math.random() * unexploredAvailable.length)].name
        : availableBiases[Math.floor(Math.random() * availableBiases.length)].name;
    console.log("Set daily challenge bias:", gameState.dailyChallengeBias);
}


function startDailyPick() {
    const bias = biases.find(b => b.name === gameState.dailyChallengeBias);
    if (bias && bias.requiredLevel <= gameState.level) { // Check level again just in case
        switchTab('explore');
        featuredBiasElement.innerHTML = createFeaturedBiasCard(bias);
        featuredBiasSection.classList.remove('hidden');
        biasesGrid.classList.add('hidden');
        attachFeaturedBiasListeners(bias);
        showSelectedBiasOption();
        window.scrollTo({ top: featuredBiasSection.offsetTop - 20, behavior: 'smooth' });
    } else if (bias) {
        alert(`This challenge bias (${bias.name}) requires Level ${bias.requiredLevel}. Keep playing to unlock it!`);
    } else {
        console.warn("Daily challenge bias not found:", gameState.dailyChallengeBias);
        showRandomBias(); // Fallback to random unlocked bias
    }
}


// --- Achievements ---
function unlockAchievement(achievementKey) {
    if (!gameState.achievements) gameState.achievements = {};
    if (gameState.achievements[achievementKey]) return;

    const achievement = achievements[achievementKey];
    if (!achievement) return;

    console.log(`%c[GAME] Achievement Unlocked: ${achievement.title}`, 'color: blue; font-weight: bold;');
    gameState.achievements[achievementKey] = true;
    addPoints(achievement.points);
    saveGameState(); // Save immediately after unlocking
    showAchievementModal(achievementKey);
    updateUI(); // Update the achievement panel visually
}


// --- Modals Display Logic ---
function showLevelUpModal(level) { newLevel.textContent = level; openModal(levelUpModal); showConfetti(); }
function showAchievementModal(achievementKey) {
    const achievement = achievements[achievementKey];
    if (!achievement) return;
    achievementIconContainer.innerHTML = `<div id="achievementIcon" class="achievement-badge mx-auto" style="background-color: ${achievement.backgroundColor};"><i class="fas fa-${achievement.icon}"></i></div>`;
    achievementTitle.textContent = achievement.title;
    achievementDescription.textContent = achievement.description;
    achievementPoints.textContent = achievement.points.toLocaleString();
    openModal(achievementModal);
    showConfetti();
}

// --- Quiz Logic ---
let currentQuizState = null;

function startQuiz() {
    const unlockedBiasesForQuiz = biases.filter(b => b.requiredLevel <= gameState.level);
    if (unlockedBiasesForQuiz.length < 4) { // Need at least 4 biases for decent quiz options
        alert(`You need to unlock more biases (reach higher levels) to take quizzes! Explore some biases first.`);
        return;
    }

    currentQuizState = { scenarios: getRandomQuizScenarios(5), currentScenarioIndex: 0, correctAnswers: 0, userSelection: null };
    quizComplete.classList.add('hidden');
    quizContent.classList.remove('hidden');
    displayQuizQuestion();
    openModal(quizModal);
}

function getRandomQuizScenarios(count) {
    // Filter scenarios based on whether the *correct* bias is unlocked
    const availableScenarios = quizScenarios.filter(scenario => {
        const correctBias = getBiasDetails(scenario.correctBias);
        return correctBias && correctBias.requiredLevel <= gameState.level;
    });

    if (availableScenarios.length === 0) {
        console.error("No available quiz scenarios for the current level!");
        // Handle this case - maybe show a message or prevent quiz start?
        alert("Error: No quiz questions available for your current level.");
        return []; // Return empty array
    }

    // Shuffle and take 'count', ensuring we don't request more than available
    return [...availableScenarios].sort(() => 0.5 - Math.random()).slice(0, Math.min(count, availableScenarios.length));
}


function displayQuizQuestion() {
    if (!currentQuizState || currentQuizState.scenarios.length === 0 || currentQuizState.currentScenarioIndex >= currentQuizState.scenarios.length) {
        console.error("Quiz state invalid or no scenarios loaded.");
        // Maybe end the quiz prematurely or show an error
        closeModal(quizModal); // Close the modal if something went wrong
        return;
    }
    const currentScenario = currentQuizState.scenarios[currentQuizState.currentScenarioIndex];
    currentQuizState.userSelection = null;
    scenarioText.textContent = currentScenario.scenario;
    quizQuestion.classList.remove('hidden'); quizResult.classList.add('hidden');
    correctAnswerDiv.classList.add('hidden'); wrongAnswerDiv.classList.add('hidden');
    submitQuizBtn.classList.remove('hidden'); submitQuizBtn.disabled = true;
    quizOptionsContainer.innerHTML = '';

    // Ensure options are also from unlocked biases (or the correct bias itself)
    const unlockedBiases = biases.filter(b => b.requiredLevel <= gameState.level);
    const unlockedBiasIds = unlockedBiases.map(b => b.id);

    // Filter the provided options to only include unlocked ones, ALWAYS including the correct answer even if somehow locked (edge case)
    let validOptionIds = currentScenario.options.filter(id => unlockedBiasIds.includes(id) || id === currentScenario.correctBias);

    // Ensure we have 4 options. If not, add random unlocked biases (excluding correct and already selected)
    const neededOptions = 4 - validOptionIds.length;
    if (neededOptions > 0) {
        const otherUnlockedIds = unlockedBiasIds.filter(id => !validOptionIds.includes(id));
        const shuffledOthers = [...otherUnlockedIds].sort(() => 0.5 - Math.random());
        validOptionIds.push(...shuffledOthers.slice(0, neededOptions));
    }
    // Final shuffle of the options presented
    const optionBiasIds = [...validOptionIds].sort(() => 0.5 - Math.random()).slice(0, 4); // Ensure max 4

    optionBiasIds.forEach(biasId => {
        const bias = getBiasDetails(biasId);
        if (!bias) { console.warn(`Quiz option bias ${biasId} not found`); return; }
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option p-4 rounded-lg border border-gray-200 hover:bg-indigo-50';
        optionElement.dataset.value = biasId;
        optionElement.innerHTML = `
            <div class="flex items-center">
                <div class="option-radio h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center flex-shrink-0 bg-white"><div class="h-2.5 w-2.5 rounded-full bg-indigo-600 hidden option-selected"></div></div>
                <div><h5 class="font-medium text-gray-900 text-sm">${bias.name}</h5><p class="text-gray-600 text-xs mt-1">${bias.description}</p></div>
            </div>`;
        optionElement.addEventListener('click', () => selectQuizOption(optionElement));
        quizOptionsContainer.appendChild(optionElement);
    });
    nextQuizBtn.classList.add('hidden'); endQuizBtn.classList.add('hidden');
}

function selectQuizOption(selectedElement) {
    document.querySelectorAll('.quiz-option').forEach(el => {
        el.classList.remove('selected', 'border-indigo-500', 'bg-indigo-50');
        el.querySelector('.option-selected').classList.add('hidden');
        el.querySelector('.option-radio').classList.replace('border-indigo-500', 'border-gray-300');
    });
    selectedElement.classList.add('selected', 'border-indigo-500', 'bg-indigo-50');
    selectedElement.querySelector('.option-selected').classList.remove('hidden');
    selectedElement.querySelector('.option-radio').classList.replace('border-gray-300', 'border-indigo-500');
    currentQuizState.userSelection = selectedElement.dataset.value;
    submitQuizBtn.disabled = false;
}

function submitQuizAnswer() {
    if (!currentQuizState || currentQuizState.userSelection === null) return;
    const currentScenario = currentQuizState.scenarios[currentQuizState.currentScenarioIndex];
    const isCorrect = currentQuizState.userSelection === currentScenario.correctBias;
    const correctBiasDetails = getBiasDetails(currentScenario.correctBias);

    submitQuizBtn.classList.add('hidden'); quizResult.classList.remove('hidden');
    document.querySelectorAll('.quiz-option').forEach(el => el.style.pointerEvents = 'none');

    if (isCorrect) {
        correctAnswerDiv.classList.remove('hidden');
        correctBiasName.textContent = correctBiasDetails?.name || 'the correct bias';
        correctExplanation.textContent = currentScenario.explanation;
        currentQuizState.correctAnswers++;
        document.querySelector(`.quiz-option[data-value="${currentScenario.correctBias}"]`)?.classList.add('bg-green-100', '!border-green-500');
    } else {
        wrongAnswerDiv.classList.remove('hidden');
        actualBiasName.textContent = correctBiasDetails?.name || 'the correct bias';
        wrongExplanation.textContent = currentScenario.explanation;
        document.querySelector(`.quiz-option[data-value="${currentQuizState.userSelection}"]`)?.classList.add('bg-red-100', '!border-red-500');
        // Ensure correct answer is still highlighted green
        const correctOptionElement = document.querySelector(`.quiz-option[data-value="${currentScenario.correctBias}"]`);
        if (correctOptionElement) {
            correctOptionElement.classList.remove('bg-red-100', '!border-red-500'); // Remove wrong styling if it was somehow applied
            correctOptionElement.classList.add('bg-green-100', '!border-green-500');
        }
    }
    const isLast = currentQuizState.currentScenarioIndex >= currentQuizState.scenarios.length - 1;
    nextQuizBtn.classList.toggle('hidden', isLast); endQuizBtn.classList.toggle('hidden', !isLast);
}

function nextQuizQuestion() {
    if (!currentQuizState || currentQuizState.currentScenarioIndex >= currentQuizState.scenarios.length - 1) {
        completeQuiz(); // Go to completion screen if it was the last question
        return;
    }
    currentQuizState.currentScenarioIndex++;
    document.querySelectorAll('.quiz-option').forEach(el => el.style.pointerEvents = 'auto');
    displayQuizQuestion();
}

function completeQuiz() {
    if (!currentQuizState) return; // Prevent errors if called inappropriately
    // Ensure quiz content is hidden and complete screen is shown
    quizContent.classList.add('hidden');
    quizComplete.classList.remove('hidden');

    correctCount.textContent = currentQuizState.correctAnswers;
    totalCount.textContent = currentQuizState.scenarios.length > 0 ? currentQuizState.scenarios.length : '?'; // Handle case where scenarios might be empty


    // Award points only if there were scenarios
    let points = 0;
    let xp = 0;
    if (currentQuizState.scenarios.length > 0) {
        points = currentQuizState.correctAnswers * 15 + 50; // Base points + per correct
        xp = currentQuizState.correctAnswers * 5 + 10; // Base XP + per correct
        pointsEarned.textContent = points.toLocaleString();
        xpEarned.textContent = xp.toLocaleString();

        addPoints(points);
        addXP(xp);
        showPointsAnimation(points, quizModal.querySelector('.modal-content'));

        gameState.quizzesCompleted++;
    } else {
        // No points/XP if quiz had no questions
        pointsEarned.textContent = "0";
        xpEarned.textContent = "0";
        // Optionally adjust the completion message
        quizComplete.querySelector('p').innerHTML = "Quiz finished. No questions were available for your level.";
    }


    currentQuizState = null; // Clear state AFTER calculations

    checkForNewAchievements();
    saveGameState();
    updateUI();
}

function getBiasDetails(biasId) {
    const foundBias = biases.find(b => b.id === biasId);
    // No warning needed here, quiz logic handles potential missing options
    return foundBias;
}

// --- Journal Logic ---
function populateJournalBiasOptions() {
    journalBiasSelect.innerHTML = '<option value="">-- Select a bias (optional) --</option>';
    const unlockedBiases = biases.filter(b => b.requiredLevel <= gameState.level); // Filter unlocked

    unlockedBiases // Use the filtered list
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(bias => {
            journalBiasSelect.add(new Option(bias.name, bias.name));
        });
}
function openJournalModal() {
    populateJournalBiasOptions(); // Refresh options when opening
    journalTitleInput.value = '';
    journalBiasSelect.value = '';
    journalContentInput.value = '';
    openModal(journalModal);
}
function addJournalEntry() {
    const title = journalTitleInput.value.trim();
    const content = journalContentInput.value.trim();
    if (!title || !content) {
        alert("Please provide a title and description.");
        return;
    }

    const newEntry = {
        id: Date.now().toString(), title, biasName: journalBiasSelect.value, content, date: new Date().toISOString()
    };
    gameState.journalEntries.unshift(newEntry);

    closeModal(journalModal);
    renderJournalEntries();

    addPoints(15);
    addXP(5);
    showPointsAnimation(15, journalBtn);

    checkForNewAchievements();
    saveGameState();
    updateUI();
}
function renderJournalEntries() {
    if (gameState.journalEntries.length === 0) {
        journalEntriesContainer.innerHTML = `<div class="text-center py-16 text-gray-500"><i class="fas fa-book-open text-4xl mb-4"></i><p>No journal entries yet. Add your first reflection!</p></div>`; return;
    }
    journalEntriesContainer.innerHTML = ''; const fragment = document.createDocumentFragment();
    gameState.journalEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'journal-entry bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn';
        const date = new Date(entry.date); const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const bias = biases.find(b => b.name === entry.biasName);
        // Determine category, default to unknown, handle if bias definition changed/removed
        const category = bias ? bias.category : 'unknown';
        const biasTag = entry.biasName ? `<span class="badge-${category} text-xs font-bold px-2 py-0.5 rounded-full uppercase inline-block mr-2 mb-2">${entry.biasName}</span>` : '';
        entryElement.innerHTML = `
            <div class="flex justify-between items-start mb-1.5"><h4 class="text-base font-semibold text-gray-800 mr-2">${entry.title}</h4><span class="text-xs text-gray-500 flex-shrink-0">${formattedDate}</span></div>
            ${biasTag ? `<div class="mb-2">${biasTag}</div>` : ''}
            <p class="text-sm text-gray-600 whitespace-pre-wrap">${entry.content}</p>
            <div class="text-right mt-2"><button class="delete-journal-btn text-red-500 hover:text-red-700 text-xs font-medium" data-id="${entry.id}"><i class="fas fa-trash mr-1"></i> Delete</button></div>`;
        entryElement.querySelector('.delete-journal-btn').addEventListener('click', (e) => deleteJournalEntry(e.target.closest('button').dataset.id));
        fragment.appendChild(entryElement);
    });
    journalEntriesContainer.appendChild(fragment);
}
function deleteJournalEntry(id) {
    if (confirm('Delete this journal entry?')) {
        gameState.journalEntries = gameState.journalEntries.filter(entry => entry.id !== id);
        renderJournalEntries();
        checkForNewAchievements(); // Check if deleting impacts achievement
        saveGameState();
        updateUI();
    }
}

// --- Scenario Logic ---
function startScenario() {
    scenarioComplete.classList.add('hidden'); scenarioContainer.classList.remove('hidden');
    scenarioContainer.querySelectorAll('.scenario-reflection').forEach(ta => ta.value = '');
    openModal(scenarioModal);
}
function completeScenario() {
    scenarioContainer.classList.add('hidden'); scenarioComplete.classList.remove('hidden');
    addPoints(50);
    addXP(15);
    showPointsAnimation(50, scenarioModal.querySelector('.modal-content'));
    checkForNewAchievements();
    saveGameState();
    updateUI();
}

// --- Bias Detail Modal Logic ---
function openBiasDetailModal(biasId) {
    const bias = getBiasDetails(biasId); // Uses the simpler getBiasDetails
    if (!bias) {
        console.error("Could not find bias details for ID:", biasId);
        return;
    }
    // Check if bias is unlocked before opening modal
    if (bias.requiredLevel > gameState.level) {
        console.log(`Bias "${bias.name}" (ID: ${biasId}) requires Level ${bias.requiredLevel}. Cannot open details.`);
        // Optionally show a small message near the clicked button
        alert(`Requires Level ${bias.requiredLevel} to view details.`);
        return;
    }


    currentBiasInModal = bias; // Store the current bias object

    // Populate Modal Content
    biasDetailTitle.textContent = bias.name;
    biasDetailBadge.textContent = bias.category;
    biasDetailBadge.className = `badge-${bias.category} text-xs font-bold px-2 py-0.5 rounded-full uppercase`; // Update class for color
    biasDetailShortDesc.textContent = bias.description;
    biasDetailLongDesc.textContent = bias.longDescription || "More details coming soon.";
    biasDetailExample.textContent = bias.example;

    // Update explore button/text visibility in modal
    const isExplored = gameState.biasesExplored.includes(bias.name);
    exploreFromModalBtn.classList.toggle('hidden', isExplored);
    exploredInModalText.classList.toggle('hidden', !isExplored);
    // Set the data attribute for the explore button
    exploreFromModalBtn.dataset.biasName = bias.name;

    openModal(biasDetailModal);
}

// --- Tab Navigation ---
function switchTab(targetTabId) {
    tabContents.forEach(content => content.classList.add('hidden'));
    tabButtons.forEach(button => button.classList.remove('active'));
    document.getElementById(targetTabId + 'Content')?.classList.remove('hidden');
    document.getElementById(targetTabId + 'Btn')?.classList.add('active');
}

// --- Animations & Effects ---
function showPointsAnimation(points, sourceElement = userPointsElement) {
    const pointsAnim = document.createElement('div');
    pointsAnim.textContent = `+${points.toLocaleString()}`;
    pointsAnim.className = 'points-animation text-lg';
    // Ensure sourceElement is valid, fallback to userPointsElement if not
    const validSource = sourceElement instanceof Element ? sourceElement : userPointsElement;
    const rect = validSource.getBoundingClientRect();
    pointsAnim.style.left = `${rect.left + rect.width / 2 - 15}px`;
    pointsAnim.style.top = `${rect.top - 10}px`;
    document.body.appendChild(pointsAnim);
    setTimeout(() => pointsAnim.remove(), 1500);
}

function showConfetti() {
    const colors = ["#FF6B6B", "#4ECDC4", "#FFD166", "#6A0572", "#5D8233", "#457B9D", "#4F46E5"];
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.width = `${Math.random() * 6 + 4}px`; piece.style.height = `${Math.random() * 8 + 5}px`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.top = `${Math.random() * -20 - 5}%`; piece.style.left = `${Math.random() * 100}%`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(piece);
        setTimeout(() => {
            piece.style.top = `${Math.random() * 50 + 100}%`;
            piece.style.opacity = '0';
            piece.style.transform = `rotate(${Math.random() * 720 + 360}deg)`;
        }, 10);
        setTimeout(() => piece.remove(), 2100);
    }
}


// --- Event Listeners Setup ---
// --- Event Listeners Setup ---
function setupEventListeners() {
    // Filters - This should now correctly include the new button
    const allFilterButtons = document.querySelectorAll('.filter-buttons .filter-button'); // Ensure selection is broad enough
    allFilterButtons.forEach(button => button.addEventListener('click', () => {
        gameState.currentFilter = button.dataset.category; // Assign the button's category
        // Clear search when changing filter for less confusion? (Optional)
        // searchInput.value = '';
        // gameState.currentSearch = '';
        featuredBiasSection.classList.add('hidden'); // Hide featured view when changing filters
        biasesGrid.classList.remove('hidden');
        renderBiases(); // Re-render with the new filter active
    }));

    searchInput.addEventListener('input', () => {
        gameState.currentSearch = searchInput.value.trim();
        featuredBiasSection.classList.add('hidden'); // Hide featured view during search
        biasesGrid.classList.remove('hidden');
        renderBiases();
    });
    randomBiasBtn.addEventListener('click', showRandomBias);
    // REMOVE the specific showAllBtn listener if covered by the generic filter button listener above
    // showAllBtn.addEventListener('click', () => { ... }); // Remove or comment out

    // Replace the filter buttons event listener with this:
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            gameState.currentFilter = e.target.value;
            if (e.target.value !== 'selectedBias') {
                hideSelectedBiasOption();
            }
            featuredBiasSection.classList.add('hidden');
            biasesGrid.classList.remove('hidden');
            renderBiases();
        });
    }

    // Daily
    checkInBtn?.addEventListener('click', handleCheckIn); // Added optional chaining
    dailyPickBtn?.addEventListener('click', startDailyPick); // Added optional chaining

    // Tabs (Main desktop tabs)
    tabButtons.forEach(button => button?.addEventListener('click', () => switchTab(button.id.replace('Btn', '')))); // Added optional chaining

    // Actions
    startQuizBtn?.addEventListener('click', startQuiz); // Added optional chaining
    scenarioBtn?.addEventListener('click', startScenario); // Added optional chaining
    addJournalEntryBtn?.addEventListener('click', openJournalModal); // Added optional chaining
    resetProgressBtn?.addEventListener('click', resetGameState); // Added optional chaining

    // Modals - Close buttons
    closeQuizBtn?.addEventListener('click', () => closeModal(quizModal)); // Added optional chaining
    closeJournalBtn?.addEventListener('click', () => closeModal(journalModal)); // Added optional chaining
    closeScenarioBtn?.addEventListener('click', () => closeModal(scenarioModal)); // Added optional chaining
    closeLevelUpBtn?.addEventListener('click', () => closeModal(levelUpModal)); // Added optional chaining
    closeAchievementBtn?.addEventListener('click', () => closeModal(achievementModal)); // Added optional chaining
    closeQuizCompleteBtn?.addEventListener('click', () => closeModal(quizModal)); // Added optional chaining
    closeScenarioCompleteBtn?.addEventListener('click', () => closeModal(scenarioModal)); // Added optional chaining
    closeBiasDetailBtn?.addEventListener('click', () => closeModal(biasDetailModal)); // Added optional chaining

    // --- Burger Menu Logic ---
    const openMenu = () => {
        mobileNav?.classList.add('menu-open');
        menuOverlay?.classList.remove('hidden');
        menuOverlay?.classList.add('menu-open');
        burgerBtn?.classList.add('hidden'); // Hide burger icon
    };
    const closeMenu = () => {
        mobileNav?.classList.remove('menu-open');
        menuOverlay?.classList.remove('menu-open');
        // Add a slight delay before hiding overlay and showing button to allow transition
        setTimeout(() => {
            menuOverlay?.classList.add('hidden');
            burgerBtn?.classList.remove('hidden'); // Show burger icon after menu is closed
        }, 300);
    };

    burgerBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering document click listener
        openMenu();
    });
    closeNavBtn?.addEventListener('click', closeMenu);
    menuOverlay?.addEventListener('click', closeMenu);

    // Add document click handler
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('mobileNav');
        const burgerButton = document.getElementById('burgerBtn');

        // Check if menu is open and click is outside menu and not on burger button
        if (menu?.classList.contains('menu-open') &&
            !menu.contains(e.target) &&
            e.target !== burgerButton) {
            closeMenu();
        }
    });

    // Update burger button click handler to stop propagation
    burgerBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from immediately closing the menu
        openMenu();
    });

    // Also stop propagation on menu clicks to prevent closing
    mobileNav?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent clicks inside menu from closing it
    });

    // Keep existing close button handler
    closeNavBtn?.addEventListener('click', closeMenu);

    // Mobile Nav Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
    
            const tabId = link.dataset.tab;
            const targetSelector = link.getAttribute('href');
    
            // First switch the tab if needed
            if (tabId) {
                switchTab(tabId);
            }
    
            // Close the menu
            closeMenu();
    
            // Add a small delay to allow DOM updates to complete
            setTimeout(() => {
                // Then scroll to the target section
                if (targetSelector && targetSelector.startsWith('#')) {
                    const targetElement = document.querySelector(targetSelector);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 100); // Small delay to ensure DOM updates are complete
        });
    });

    // Theme Toggle (Mobile)
    themeToggleMobile?.addEventListener('change', () => {
        const newTheme = themeToggleMobile.checked ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    });
    // --- End Burger Menu Logic ---


    // Modals - Actions
    submitQuizBtn?.addEventListener('click', submitQuizAnswer); // Added optional chaining
    nextQuizBtn?.addEventListener('click', nextQuizQuestion); // Added optional chaining
    endQuizBtn?.addEventListener('click', completeQuiz); // Added optional chaining
    newQuizBtn?.addEventListener('click', startQuiz); // Added optional chaining
    saveJournalBtn?.addEventListener('click', addJournalEntry); // Added optional chaining
    completeScenarioBtn?.addEventListener('click', completeScenario); // Added optional chaining
    newScenarioBtn?.addEventListener('click', startScenario); // Added optional chaining
    exploreFromModalBtn?.addEventListener('click', (e) => { // Added optional chaining
        const biasNameToExplore = e.currentTarget.dataset.biasName;
        if (biasNameToExplore) {
            exploreBias(biasNameToExplore, null, false);
        } else {
            console.error("Bias name not found on modal explore button");
        }
    });


    // Modals - Share Placeholders
    shareQuizResultBtn?.addEventListener('click', () => alert('Sharing not implemented.')); // Added optional chaining
    shareAchievementBtn?.addEventListener('click', () => alert('Sharing not implemented.')); // Added optional chaining
    shareLeaderboardBtn?.addEventListener('click', () => alert('Sharing not implemented.')); // Added optional chaining

    // Close modal on backdrop click
    [quizModal, journalModal, scenarioModal, levelUpModal, achievementModal, biasDetailModal].forEach(modal => {
        modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); }); // Added optional chaining
    });
}

// --- Initialization ---
function initializeGame() {
    console.log("Initializing Cognitive Bias Explorer...");
    loadAndApplyTheme(); // Apply theme early
    loadGameState(); // Load or set default gameState

    const today = getTodayDateString();
    // Set daily challenge only if needed AND biases exist
    if ((gameState.lastCheckIn !== today || !gameState.dailyChallengeBias) && typeof biases !== 'undefined' && biases.length > 0) { // Check if biases is defined
        setDailyChallengeBias();
        saveGameState(); // Save the potentially updated challenge bias
    }

    // Update total biases display based on actual data length
    if (typeof totalBiasesCount !== 'undefined') { // Check if totalBiasesCount is defined
        totalBiasesElement.textContent = totalBiasesCount;
    }

    populateJournalBiasOptions(); // Populate based on initial level
    renderBiases(); // Render initial view (shows locked/unlocked)
    renderJournalEntries();
    setupEventListeners();
    updateUI(); // Set initial UI based on loaded/default state
    switchTab('explore'); // Start on explore tab
    setupStickyHeader();

    console.log("Game Initialized. Current Level:", gameState.level);
}

// --- Start Game ---
// Ensure biases and quizScenarios are loaded before initializing
// This assumes biases.js and quizScenarios.js are loaded via <script> tags before this file
if (typeof biases !== 'undefined' && typeof quizScenarios !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    console.error("Error: Data files (biases.js, quizScenarios.js) not loaded before script.js");
    // Optionally display an error message to the user on the page
    document.addEventListener('DOMContentLoaded', () => {
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red; font-family: sans-serif;"><h1>Error</h1><p>Could not load game data. Please ensure biases.js and quizScenarios.js are included correctly before script.js.</p></div>';
    });
}


// --- END OF SCRIPT ---
