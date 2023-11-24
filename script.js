import words from './words.js';

const rows = [
    Array.from(document.querySelectorAll('.game-cell')).slice(0, 3),
    Array.from(document.querySelectorAll('.game-cell')).slice(3, 6),
    Array.from(document.querySelectorAll('.game-cell')).slice(6, 9)
];
const submitButton = document.getElementById('submit-button');
const resultDisplay = document.getElementById('result');

let currentRowIndex = 0; // Start with the first row
const dailyWord = getDailyWord().toUpperCase();

function seededShuffle(array, seed) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    function seededRandom() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    while (0 !== currentIndex) {
        randomIndex = Math.floor(seededRandom() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function getDailyWord() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const shuffledWords = seededShuffle([...words], seed);
    return shuffledWords[0];
}

function enableCurrentRow() {
    rows[currentRowIndex].forEach(cell => {
        cell.disabled = false;
        cell.addEventListener('input', handleInput);
    });
}

function handleInput(e) {
    e.target.value = e.target.value.toUpperCase();

    const nextCell = e.target.nextElementSibling;
    if (nextCell && rows[currentRowIndex].includes(nextCell)) {
        nextCell.focus(); // Move to next cell in the current row
    }
}

function submitGuess() {
    const currentRow = rows[currentRowIndex];
    if (currentRow.some(cell => cell.value === '')) {
        resultDisplay.textContent = 'Please fill all cells in the current row.';
        return;
    }

    currentRow.forEach(cell => cell.disabled = true);
    checkGuess();
}

// Function to hide the submit button
function hideSubmitButton() {
    submitButton.style.display = 'none';
}

let gameResult = ''; // Declare this variable at the start of your script

function checkGuess() {
    const currentRow = rows[currentRowIndex];
    const guess = currentRow.map(cell => cell.value.toUpperCase()).join('');

    if (!words.includes(guess.toLowerCase())) {
        resultDisplay.textContent = 'Word not in list. Try again.';
        resetCurrentRow();
        return;
    }

    if (guess === dailyWord) {
        currentRow.forEach(cell => cell.style.backgroundColor = 'green');
        resultDisplay.textContent = 'Congratulations! You guessed right!';
        rows.forEach(row => row.forEach(cell => cell.disabled = true));
        gameResult = 'win'; // Set the game result to win
        changeButtonToShare();
    } else {
        for (let i = 0; i < guess.length; i++) {
            const cell = currentRow[i];
            if (guess[i] === dailyWord[i]) {
                cell.style.backgroundColor = '#4CAF50';
            } else if (dailyWord.includes(guess[i])) {
                cell.style.backgroundColor = '#FFEB3B';
            } else {
                cell.style.backgroundColor = 'grey';
            }
        }

        if (currentRowIndex < 2) {
            currentRowIndex++;
            enableCurrentRow();
        } else {
            resultDisplay.textContent = `Game Over. The word was ${dailyWord}.`;
            rows.forEach(row => row.forEach(cell => cell.disabled = true));
            gameResult = 'lose'; // Set the game result to lose
            changeButtonToShare();
        }
    }
}


function resetCurrentRow() {
    rows[currentRowIndex].forEach(cell => {
        cell.value = '';
        cell.style.backgroundColor = '';
        cell.disabled = false;
    });
}

function changeButtonToShare() {
    submitButton.textContent = 'Share';
    submitButton.removeEventListener('click', submitGuess);
    submitButton.addEventListener('click', shareResult);
}

function createShareMessage() {
    let attempts = currentRowIndex + 1;
    let message = gameResult === 'win'
        ? `I won! 😊 I got the word in ${attempts} attempts!\n\n`
        : "I lost 😞 I didn't get the word today.\n\n";

    rows.forEach((row, rowIndex) => {
        // Only include rows that were part of the attempts
        if (rowIndex <= currentRowIndex) {
            row.forEach(cell => {
                if (cell.style.backgroundColor === 'green' || cell.style.backgroundColor === '#4CAF50') { // Adjust to your game's green color
                    message += '🟩';
                } else if (cell.style.backgroundColor === 'yellow' || cell.style.backgroundColor === '#FFEB3B') { // Adjust to your game's yellow color
                    message += '🟨';
                } else {
                    message += '⬛'; // For grey or any other color
                }
            });
            message += '\n';
        }
    });

    return message;
}

function shareResult() {
    if (navigator.share) {
        navigator.share({
            title: 'Three in Three Game Result',
            text: createShareMessage()
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(console.error);
    } else {
        console.log('Web Share not supported on this browser.');
    }
}

enableCurrentRow();
submitButton.addEventListener('click', submitGuess);

const storedProgress = localStorage.getItem('threeInThreeProgress');
const storedResult = localStorage.getItem('threeInThreeResult');
const storedDate = localStorage.getItem('threeInThreeDate');
const today = new Date().toDateString();

if (storedDate === today && storedProgress) {
    // Logic to restore progress if the stored date is today
    const previousProgress = JSON.parse(storedProgress);
    previousProgress.forEach((guess, rowIndex) => {
        guess.forEach((letter, cellIndex) => {
            rows[rowIndex][cellIndex].value = letter;
            rows[rowIndex][cellIndex].disabled = true;
        });
        if (rowIndex < rows.length - 1) {
            currentRowIndex++;
            enableCurrentRow();
        }
    });

    if (storedResult === 'win') {
        resultDisplay.textContent = 'You found the word today, come back tomorrow!';
        rows.forEach(row => row.forEach(cell => cell.disabled = true));
        hideSubmitButton(); // Hide the submit button
    } else if (storedResult === 'lose') {
        resultDisplay.textContent = 'You didn\'t find the word today! Come back tomorrow to try again!';
        rows.forEach(row => row.forEach(cell => cell.disabled = true));
        hideSubmitButton(); // Hide the submit button
    }
}
