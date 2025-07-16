// Jeopardy Game Logic
class JeopardyGame {
    constructor() {
        this.questions = [];
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.gameState = 'ready'; // ready, showing-category, showing-clue, reading-clue, waiting-for-buzz, buzzed, showing-answer
        this.canBuzz = false;
        this.buzzBlocked = false;
        this.speechSynthesis = window.speechSynthesis;
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
    }
    
    initializeElements() {
        this.categoryElement = document.getElementById('category');
        this.clueValueElement = document.getElementById('clueValue');
        this.clueTextElement = document.getElementById('clueText');
        this.answerTextElement = document.getElementById('answerText');
        this.jeopardyBoard = document.getElementById('jeopardyBoard');
        this.categoryValueDiv = document.getElementById('categoryValue');
        this.clueDisplayDiv = document.getElementById('clueDisplay');
        this.answerDisplayDiv = document.getElementById('answerDisplay');
        this.startButton = document.getElementById('startButton');
        this.nextButton = document.getElementById('nextButton');
        this.currentStateElement = document.getElementById('currentState');
        this.questionCountElement = document.getElementById('questionCount');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        
        // Keyboard event for spacebar buzzing
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                this.handleBuzz();
            }
        });
    }
    
    async loadQuestions() {
        try {
            const response = await fetch('combined_season1-40.tsv');
            const text = await response.text();
            this.parseQuestions(text);
            this.updateGameState('ready');
            this.questionCountElement.textContent = this.questions.length;
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Error loading questions. Please make sure the TSV file is available.');
        }
    }
    
    parseQuestions(tsvText) {
        const lines = tsvText.split('\n');
        const headers = lines[0].split('\t');
        
        this.questions = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const columns = line.split('\t');
                if (columns.length >= 7) {
                    this.questions.push({
                        round: columns[0],
                        clueValue: columns[1],
                        dailyDoubleValue: columns[2],
                        category: columns[3],
                        comments: columns[4],
                        answer: columns[5], // This is actually the clue
                        question: columns[6], // This is actually the answer
                        airDate: columns[7],
                        notes: columns[8] || ''
                    });
                }
            }
        }
        
        // Shuffle questions for variety
        this.shuffleArray(this.questions);
        console.log(`Loaded ${this.questions.length} questions`);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    startGame() {
        if (this.questions.length === 0) {
            alert('Questions not loaded yet. Please wait...');
            return;
        }
        
        this.currentQuestionIndex = 0;
        this.startButton.disabled = true;
        this.nextButton.disabled = false;
        this.showCurrentQuestion();
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            alert('No more questions!');
            return;
        }
        
        this.showCurrentQuestion();
        this.currentQuestionIndex++;
    }
    
    showCurrentQuestion() {
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        this.resetBoard();
        this.showCategoryAndValue();
    }
    
    resetBoard() {
        this.jeopardyBoard.classList.remove('white-border', 'red-flash');
        this.categoryValueDiv.classList.remove('hidden');
        this.clueDisplayDiv.classList.remove('active');
        this.answerDisplayDiv.classList.remove('active');
        this.canBuzz = false;
        this.buzzBlocked = false;
    }
    
    showCategoryAndValue() {
        this.updateGameState('showing-category');
        
        // Display category and clue value
        this.categoryElement.textContent = this.currentQuestion.category;
        this.clueValueElement.textContent = `$${this.currentQuestion.clueValue}`;
        
        // Show for 3 seconds, then show the clue
        setTimeout(() => {
            this.showClue();
        }, 3000);
    }
    
    showClue() {
        this.updateGameState('showing-clue');
        
        // Hide category/value and show clue
        this.categoryValueDiv.classList.add('hidden');
        this.clueDisplayDiv.classList.add('active');
        this.clueTextElement.textContent = this.currentQuestion.answer; // This is the clue
        
        // Start text-to-speech
        this.readClueAloud();
    }
    
    readClueAloud() {
        this.updateGameState('reading-clue');
        
        // Stop any ongoing speech
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(this.currentQuestion.answer);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onend = () => {
            // Wait 0.2 seconds after speech ends, then enable buzzing
            setTimeout(() => {
                this.enableBuzzing();
            }, 200);
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            // Fallback: enable buzzing after 5 seconds if speech fails
            setTimeout(() => {
                this.enableBuzzing();
            }, 5000);
        };
        
        this.speechSynthesis.speak(utterance);
    }
    
    enableBuzzing() {
        this.updateGameState('waiting-for-buzz');
        this.canBuzz = true;
        this.jeopardyBoard.classList.add('white-border');
    }
    
    handleBuzz() {
        if (this.buzzBlocked) {
            return; // Still in cooldown period
        }
        
        if (!this.canBuzz) {
            // Too early! Flash red and block
            this.flashRed();
            return;
        }
        
        // Valid buzz
        this.buzz();
    }
    
    flashRed() {
        this.jeopardyBoard.classList.add('red-flash');
        this.buzzBlocked = true;
        
        // Remove red flash after animation
        setTimeout(() => {
            this.jeopardyBoard.classList.remove('red-flash');
        }, 300);
        
        // Unblock buzzing after 0.25 seconds
        setTimeout(() => {
            this.buzzBlocked = false;
        }, 250);
    }
    
    buzz() {
        this.updateGameState('buzzed');
        this.canBuzz = false;
        this.jeopardyBoard.classList.remove('white-border');
        
        // Wait 3 seconds, then show the answer
        setTimeout(() => {
            this.showAnswer();
        }, 3000);
    }
    
    showAnswer() {
        this.updateGameState('showing-answer');
        
        // Hide clue and show answer
        this.clueDisplayDiv.classList.remove('active');
        this.answerDisplayDiv.classList.add('active');
        this.answerTextElement.textContent = this.currentQuestion.question; // This is the actual answer
    }
    
    updateGameState(newState) {
        this.gameState = newState;
        this.currentStateElement.textContent = newState;
        console.log('Game state:', newState);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new JeopardyGame();
});