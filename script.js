import words from './words.js';

const rows = [
    Array.from(document.querySelectorAll('.game-cell')).slice(0, 3),
    Array.from(document.querySelectorAll('.game-cell')).slice(3, 6),
    Array.from(document.querySelectorAll('.game-cell')).slice(6, 9)
];
const submitButton = document.getElementById('submit-button');
const resultDisplay = document.getElementById('result');

let currentRowIndex = 0; // Start with the first row

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

const dailyWord = getDailyWord().toUpperCase();

function enableCurrentRow() {
    rows[currentRowIndex].forEach(cell => {
        cell.disabled = false;
        cell.addEventListener('input', handleInput);
        cell.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitGuess();
            }
        });
    });
}

function handleInput(e) {
    e.target.value = e.target.value.toUpperCase();

    const nextCell = e.target.nextElementSibling;
    if (nextCell && rows[currentRowIndex].includes(nextCell)) {
        nextCell.focus(); // Move to next cell in the current row
    }
}

function checkGuess() {
    const currentRow = rows[currentRowIndex];
    const guess = currentRow.map(cell => cell.value.toUpperCase()).join('');

    if (!words.includes(guess.toLowerCase())) {
        resultDisplay.textContent = 'Word not in list. Try again.';
        resetCurrentRow();
        return;
    }

    if (guess === dailyWord) {
        // If the guess is correct, make all cells green
        currentRow.forEach(cell => cell.style.backgroundColor = 'green');
        resultDisplay.textContent = 'Congratulations! You guessed right!';
        rows.forEach(row => row.forEach(cell => cell.disabled = true));
    } else {
        // Check each letter in the guess
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
        }
    }
}

function resetCurrentRow() {
    rows[currentRowIndex].forEach(cell => {
        cell.value = '';
        cell.style.backgroundColor = ''; // Reset background color
        cell.disabled = false;
    });
}

enableCurrentRow();

submitButton.addEventListener('click', () => {
    const currentRow = rows[currentRowIndex];
    if (currentRow.some(cell => cell.value === '')) {
        resultDisplay.textContent = 'Please fill all cells in the current row.';
        return;
    }

    currentRow.forEach(cell => cell.disabled = true);
    checkGuess();
});
