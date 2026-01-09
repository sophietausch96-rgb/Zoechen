let currentBoard = [];
let solvedBoard = [];
let initialBoard = [];
let selectedCell = null;
let pencilMode = false;
let notes = {}; // Key: "row-col", Value: Array of numbers

// Initialisierung
function initGrid() {
    const boardEl = document.getElementById('sudoku-board');
    boardEl.innerHTML = '';
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let cell = document.createElement('div');
            cell.id = `cell-${r}-${c}`;
            cell.classList.add('cell');
            
            // Visuelle Trennung (3x3 Boxen)
            if ((c + 1) % 3 === 0 && c !== 8) cell.style.borderRight = "2px solid #475569";
            if ((r + 1) % 3 === 0 && r !== 8) cell.style.borderBottom = "2px solid #475569";

            cell.onclick = () => selectCell(r, c);
            boardEl.appendChild(cell);
        }
    }
}

function startGame(difficulty) {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    let diffName = difficulty === 'easy' ? 'Leicht' : difficulty === 'medium' ? 'Mittel' : 'Schwer';
    document.getElementById('difficulty-display').innerText = diffName;

    generateGame(difficulty);
    renderBoard();
}

function showWelcome() {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
}

function newGame() {
    let diffText = document.getElementById('difficulty-display').innerText;
    let diff = diffText === 'Leicht' ? 'easy' : diffText === 'Mittel' ? 'medium' : 'hard';
    startGame(diff);
}

function selectCell(r, c) {
    selectedCell = { r, c };
    renderBoard();
}

function togglePencil() {
    pencilMode = !pencilMode;
    const btn = document.getElementById('btn-pencil');
    if (pencilMode) btn.classList.add('active');
    else btn.classList.remove('active');
}

function inputNumber(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    // Feste Zahlen nicht ändern
    if (initialBoard[r][c] !== 0) return;

    if (num === 'X') {
        // Löschen
        currentBoard[r][c] = 0;
        delete notes[`${r}-${c}`];
    } else {
        if (pencilMode) {
            // Notiz Logik
            let key = `${r}-${c}`;
            if (!notes[key]) notes[key] = [];
            
            if (notes[key].includes(num)) {
                notes[key] = notes[key].filter(n => n !== num);
            } else {
                notes[key].push(num);
            }
            // Wenn man Notizen macht, eigentlichen Wert löschen
            currentBoard[r][c] = 0; 
        } else {
            // Zahl setzen
            currentBoard[r][c] = num;
            // Notizen löschen wenn Zahl gesetzt wird
            delete notes[`${r}-${c}`];
        }
    }
    renderBoard();
    checkWin();
}

function getHint() {
    // Suche erstes leeres Feld und fülle es korrekt
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (currentBoard[r][c] === 0) {
                currentBoard[r][c] = solvedBoard[r][c];
                renderBoard();
                return;
            }
        }
    }
    alert("Alles schon ausgefüllt!");
}

function solveGame() {
    // Kopiere Lösung ins Board
    for (let r = 0; r < 9; r++) {
        currentBoard[r] = [...solvedBoard[r]];
    }
    renderBoard();
}

function checkWin() {
    // Einfacher Check: Ist das Board voll und gleich der Lösung?
    let isFull = true;
    let isCorrect = true;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (currentBoard[r][c] === 0) isFull = false;
            if (currentBoard[r][c] !== solvedBoard[r][c]) isCorrect = false;
        }
    }

    if (isFull && isCorrect) {
        setTimeout(() => alert("Gewonnen! Super gemacht!"), 100);
    }
}

function renderBoard() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const val = currentBoard[r][c];
            const isInit = initialBoard[r][c] !== 0;
            
            // Reset Classes
            cell.className = 'cell';
            if (isInit) cell.classList.add('initial');
            if (selectedCell && selectedCell.r === r && selectedCell.c === c) cell.classList.add('selected');
            
            // Content löschen
            cell.innerHTML = '';

            if (val !== 0) {
                cell.textContent = val;
                // Highlight gleiche Zahlen
                if (selectedCell && currentBoard[selectedCell.r][selectedCell.c] === val) {
                    cell.classList.add('highlighted');
                }
            } else {
                // Notizen anzeigen
                const cellNotes = notes[`${r}-${c}`];
                if (cellNotes && cellNotes.length > 0) {
                    const noteContainer = document.createElement('div');
                    noteContainer.className = 'note-grid';
                    for (let i = 1; i <= 9; i++) {
                        let span = document.createElement('span');
                        span.className = 'note-num';
                        span.textContent = cellNotes.includes(i) ? i : '';
                        noteContainer.appendChild(span);
                    }
                    cell.appendChild(noteContainer);
                }
            }
        }
    }
}

// --- Sudoku Generator Logik ---
function generateGame(difficulty) {
    // 1. Leeres Board
    let grid = Array(9).fill().map(() => Array(9).fill(0));
    
    // 2. Diagonale füllen (Boxen sind unabhängig)
    fillBox(grid, 0, 0);
    fillBox(grid, 3, 3);
    fillBox(grid, 6, 6);
    
    // 3. Rest lösen
    solve(grid);
    solvedBoard = JSON.parse(JSON.stringify(grid)); // Lösung speichern

    // 4. Löcher machen
    let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 40 : 50;
    while (attempts > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (grid[r][c] !== 0) {
            grid[r][c] = 0;
            attempts--;
        }
    }
    
    initialBoard = JSON.parse(JSON.stringify(grid));
    currentBoard = JSON.parse(JSON.stringify(grid));
    notes = {};
    selectedCell = null;
}

function fillBox(grid, row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeBox(grid, row, col, num));
            grid[row + i][col + j] = num;
        }
    }
}

function isSafeBox(grid, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[rowStart + i][colStart + j] === num) return false;
        }
    }
    return true;
}

function isSafe(grid, row, col, num) {
    for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
    for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
    let startRow = row - (row % 3), startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[i + startRow][j + startCol] === num) return false;
    return true;
}

function solve(grid) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isSafe(grid, r, c, num)) {
                        grid[r][c] = num;
                        if (solve(grid)) return true;
                        grid[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Start Grid Struktur beim Laden
initGrid();
