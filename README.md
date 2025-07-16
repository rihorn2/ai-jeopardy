# AI Jeopardy Game

A web-based Jeopardy game interface that uses the classic Jeopardy dataset with interactive gameplay features.

## Features

- **Authentic Jeopardy Experience**: Displays categories, clue values, and questions in the classic Jeopardy format
- **Visual Design**: Blue background with cream/yellow text matching the iconic Jeopardy look
- **Text-to-Speech**: Clues are read aloud using the browser's Speech Synthesis API
- **Interactive Buzzing**: Press spacebar to buzz in after the white border appears
- **Anti-Cheat Protection**: Early buzzing results in a red flash and 0.25-second penalty
- **Large Dataset**: Over 500,000 questions from 40 seasons of Jeopardy
- **Responsive Design**: Works on desktop and mobile devices

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
- `script.js` - JavaScript game logic and interactivity
- `combined_season1-40.tsv` - Jeopardy questions dataset
- `test-results.md` - Test documentation

## Technical Details

- **Dataset Format**: Tab-separated values with columns for round, clue_value, category, answer (clue), question (answer), and more
- **Browser APIs Used**: Speech Synthesis API, Fetch API, DOM Events
- **Responsive**: CSS Grid and Flexbox for responsive layout
- **Accessibility**: Keyboard navigation and screen reader friendly

## Data Source

The game uses the classic Jeopardy dataset containing questions from seasons 1-40, with over 500,000 individual clues across various categories and difficulty levels.