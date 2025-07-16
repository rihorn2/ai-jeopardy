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
        this.currentAudio = null; // For Azure Speech Service audio playback
        
        // Azure Speech Service configuration
        this.azureConfig = {
            endpoint: '', // Will be set from environment or user input
            subscriptionKey: '', // Will be set from environment or user input
            region: 'eastus', // Default region
            voice: 'en-US-JennyNeural' // Default voice
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
        this.initializeAzureConfig();
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
        this.ttsServiceElement = document.getElementById('ttsService');
        
        // Modal elements
        this.configButton = document.getElementById('configButton');
        this.configModal = document.getElementById('configModal');
        this.closeModal = document.getElementById('closeModal');
        this.azureEndpointInput = document.getElementById('azureEndpoint');
        this.azureKeyInput = document.getElementById('azureKey');
        this.azureRegionInput = document.getElementById('azureRegion');
        this.azureVoiceSelect = document.getElementById('azureVoice');
        this.saveConfigButton = document.getElementById('saveConfig');
        this.clearConfigButton = document.getElementById('clearConfig');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.configButton.addEventListener('click', () => this.showConfigModal());
        this.closeModal.addEventListener('click', () => this.hideConfigModal());
        this.saveConfigButton.addEventListener('click', () => this.saveAzureConfig());
        this.clearConfigButton.addEventListener('click', () => this.clearAzureConfig());
        
        // Close modal when clicking outside
        this.configModal.addEventListener('click', (event) => {
            if (event.target === this.configModal) {
                this.hideConfigModal();
            }
        });
        
        // Keyboard event for spacebar buzzing
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                this.handleBuzz();
            }
        });
    }
    
    initializeAzureConfig() {
        // Load Azure config from localStorage
        this.azureConfig.endpoint = localStorage.getItem('azure_endpoint') || '';
        this.azureConfig.subscriptionKey = localStorage.getItem('azure_key') || '';
        this.azureConfig.region = localStorage.getItem('azure_region') || 'eastus';
        this.azureConfig.voice = localStorage.getItem('azure_voice') || 'en-US-JennyNeural';
        
        this.updateTTSServiceStatus();
        
        console.log('Azure Speech Service configured:', {
            endpoint: this.azureConfig.endpoint ? 'Set' : 'Not set',
            subscriptionKey: this.azureConfig.subscriptionKey ? 'Set' : 'Not set',
            region: this.azureConfig.region,
            voice: this.azureConfig.voice
        });
    }
    
    updateTTSServiceStatus() {
        const isAzureConfigured = this.azureConfig.endpoint && this.azureConfig.subscriptionKey;
        this.ttsServiceElement.textContent = isAzureConfigured ? 'Azure Speech Service' : 'Browser TTS';
        this.ttsServiceElement.style.color = isAzureConfigured ? '#90EE90' : '#ffeb99';
    }
    
    showConfigModal() {
        // Populate form with current values
        this.azureEndpointInput.value = this.azureConfig.endpoint;
        this.azureKeyInput.value = this.azureConfig.subscriptionKey;
        this.azureRegionInput.value = this.azureConfig.region;
        this.azureVoiceSelect.value = this.azureConfig.voice;
        
        this.configModal.style.display = 'block';
    }
    
    hideConfigModal() {
        this.configModal.style.display = 'none';
    }
    
    saveAzureConfig() {
        this.azureConfig.endpoint = this.azureEndpointInput.value.trim();
        this.azureConfig.subscriptionKey = this.azureKeyInput.value.trim();
        this.azureConfig.region = this.azureRegionInput.value.trim();
        this.azureConfig.voice = this.azureVoiceSelect.value;
        
        // Save to localStorage
        localStorage.setItem('azure_endpoint', this.azureConfig.endpoint);
        localStorage.setItem('azure_key', this.azureConfig.subscriptionKey);
        localStorage.setItem('azure_region', this.azureConfig.region);
        localStorage.setItem('azure_voice', this.azureConfig.voice);
        
        this.updateTTSServiceStatus();
        this.hideConfigModal();
        
        alert('Azure Speech Service configuration saved!');
    }
    
    clearAzureConfig() {
        this.azureConfig.endpoint = '';
        this.azureConfig.subscriptionKey = '';
        this.azureConfig.region = 'eastus';
        this.azureConfig.voice = 'en-US-JennyNeural';
        
        // Clear localStorage
        localStorage.removeItem('azure_endpoint');
        localStorage.removeItem('azure_key');
        localStorage.removeItem('azure_region');
        localStorage.removeItem('azure_voice');
        
        this.updateTTSServiceStatus();
        this.hideConfigModal();
        
        alert('Azure Speech Service configuration cleared! Will fallback to browser TTS.');
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
        
        // Stop any ongoing speech or audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        this.speechSynthesis.cancel();
        
        // Try Azure Speech Service first, fallback to browser TTS
        if (this.azureConfig.endpoint && this.azureConfig.subscriptionKey) {
            this.readClueWithAzure();
        } else {
            console.warn('Azure Speech Service not configured, falling back to browser TTS');
            this.readClueWithBrowserTTS();
        }
    }
    
    async readClueWithAzure() {
        try {
            const ssml = this.generateSSML(this.currentQuestion.answer);
            const audioBlob = await this.callAzureSpeechService(ssml);
            
            // Create audio element and play
            this.currentAudio = new Audio();
            this.currentAudio.src = URL.createObjectURL(audioBlob);
            
            this.currentAudio.onended = () => {
                // Wait 0.2 seconds after speech ends, then enable buzzing
                setTimeout(() => {
                    this.enableBuzzing();
                }, 200);
                
                // Clean up
                URL.revokeObjectURL(this.currentAudio.src);
                this.currentAudio = null;
            };
            
            this.currentAudio.onerror = (event) => {
                console.error('Azure audio playback error:', event);
                // Fallback to browser TTS
                this.readClueWithBrowserTTS();
            };
            
            await this.currentAudio.play();
            
        } catch (error) {
            console.error('Azure Speech Service error:', error);
            // Fallback to browser TTS
            this.readClueWithBrowserTTS();
        }
    }
    
    readClueWithBrowserTTS() {
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
    
    generateSSML(text) {
        // Generate SSML for Azure Speech Service with appropriate voice and style
        return `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="${this.azureConfig.voice}">
                <prosody rate="0.9" pitch="medium">
                    ${this.escapeXml(text)}
                </prosody>
            </voice>
        </speak>`.trim();
    }
    
    escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
    
    async callAzureSpeechService(ssml) {
        const response = await fetch(`${this.azureConfig.endpoint}/cognitiveservices/v1`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.azureConfig.subscriptionKey,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
            },
            body: ssml
        });
        
        if (!response.ok) {
            throw new Error(`Azure Speech Service error: ${response.status} ${response.statusText}`);
        }
        
        return await response.blob();
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