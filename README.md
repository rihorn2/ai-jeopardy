# AI Jeopardy Game

A web-based Jeopardy game interface that uses the classic Jeopardy dataset with interactive gameplay features.

## Features

- **Authentic Jeopardy Experience**: Displays categories, clue values, and questions in the classic Jeopardy format
- **Visual Design**: Blue background with cream/yellow text matching the iconic Jeopardy look
- **Azure Speech Service Integration**: High-quality text-to-speech using Microsoft Azure Speech Service
- **Browser TTS Fallback**: Automatic fallback to browser's Speech Synthesis API if Azure is not configured
- **Interactive Buzzing**: Press spacebar to buzz in after the white border appears
- **Anti-Cheat Protection**: Early buzzing results in a red flash and 0.25-second penalty
- **Large Dataset**: Over 500,000 questions from 40 seasons of Jeopardy
- **Responsive Design**: Works on desktop and mobile devices

## Azure Speech Service Setup

### Prerequisites

1. Create an Azure Speech Service resource in the [Azure Portal](https://portal.azure.com)
2. Note your endpoint URL (e.g., `https://eastus.tts.speech.microsoft.com/`)
3. Copy your subscription key from the Azure Portal

### Configuration

1. **In the Game**: Click the "Azure Config" button to open the configuration modal
2. **Test Page**: Use `azure-speech-test.html` to test your Azure credentials before playing

**Configuration Fields:**
- **Endpoint URL**: Your Azure Speech Service endpoint (e.g., `https://eastus.tts.speech.microsoft.com/`)
- **Subscription Key**: Your Azure Speech Service subscription key
- **Region**: The Azure region where your service is deployed (e.g., `eastus`)
- **Voice**: Choose from available neural voices (Jenny, Guy, Aria, Davis)

The configuration is saved in your browser's local storage for future sessions.

## How to Play

1. **Start**: Click "Start Game" to begin
2. **Category Phase**: The category and clue value are displayed for 3 seconds
3. **Clue Phase**: The clue is shown and read aloud via text-to-speech
4. **Buzzing**: After the clue is read, a white border appears - press SPACEBAR to buzz in
5. **Answer Phase**: After buzzing, wait 3 seconds to see the correct answer
6. **Next Question**: Click "Next Question" to continue

## Running the Game

### Option 1: Simple HTTP Server
```bash
# Navigate to the project directory
cd ai-jeopardy

# Start a simple HTTP server (Python 3)
python3 -m http.server 8000

# Or with Python 2
python -m SimpleHTTPServer 8000

# Or with Node.js
npx http-server

# Open your browser to http://localhost:8000
```

### Option 2: Direct File Access
Simply open `index.html` in your web browser. Note that some browsers may block local file access for the TSV data, so the HTTP server method is recommended.

## File Structure

- `index.html` - Main HTML structure
- `style.css` - CSS styling for the Jeopardy theme
- `script.js` - JavaScript game logic and Azure Speech Service integration
- `azure-speech-test.html` - Standalone page to test Azure Speech Service configuration
- `combined_season1-40.tsv` - Jeopardy questions dataset
- `test-results.md` - Test documentation

## Technical Details

- **Text-to-Speech**: Primary support for Azure Speech Service with browser TTS fallback
- **Audio Format**: Azure returns MP3 audio streams for high-quality speech
- **Voice Options**: Multiple neural voices available (Jenny, Guy, Aria, Davis)
- **Dataset Format**: Tab-separated values with columns for round, clue_value, category, answer (clue), question (answer), and more
- **Browser APIs Used**: Fetch API, Audio API, DOM Events, Local Storage
- **Responsive**: CSS Grid and Flexbox for responsive layout
- **Accessibility**: Keyboard navigation and screen reader friendly

## Data Source

The game uses the classic Jeopardy dataset containing questions from seasons 1-40, with over 500,000 individual clues across various categories and difficulty levels.