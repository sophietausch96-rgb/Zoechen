let currentBoard = [];
let solvedBoard = [];
let initialBoard = [];
let selectedCell = null;
let pencilMode = false;
let notes = {};
let currentDifficulty = 'medium';

function initGrid() {
    const boardEl = document.getElementById('sudoku-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let cell = document.createElement('div');
            cell.id = `cell-${r}-${c}`;
            cell.classList.add('cell');
            cell.onclick = () => selectCell(r, c);
            boardEl.appendChild(cell);
        }
    }
}

window.startGame = function(difficulty) {
    currentDifficulty = difficulty;
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    generateGame(difficulty);
    renderBoard();
};

window.showWelcome = function() {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
};

window.newGame = function() {
    window.startGame(currentDifficulty);
};

function selectCell(r, c) {
    selectedCell = { r, c };
    renderBoard();
}

window.togglePencil = function() {
    pencilMode = !pencilMode;
    document.getElementById('btn-pencil').classList.toggle('active', pencilMode);
};

window.inputNumber = function(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    if (num === 'X') {
        currentBoard[r][c] = 0;
        delete notes[`${r}-${c}`];
    } else {
        if (pencilMode) {
            let key = `${r}-${c}`;
            if (!notes[key]) notes[key] = [];
            notes[key] = notes[key].includes(num) ? notes[key].filter(n => n !== num) : [...notes[key], num];
            currentBoard[r][c] = 0; 
        } else {
            currentBoard[r][c] = num;
            delete notes[`${r}-${c}`];
        }
    }
    renderBoard();
    checkWin();
};

window.getHint = function() {
    if (selectedCell) {
        currentBoard[selectedCell.r][selectedCell.c] = solvedBoard[selectedCell.r][selectedCell.c];
    } else {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentBoard[r][c] === 0) {
                    currentBoard[r][c] = solvedBoard[r][c];
                    renderBoard(); return;
                }
            }
        }
    }
    renderBoard();
};

window.solveGame = function() {
    currentBoard = JSON.parse(JSON.stringify(solvedBoard));
    renderBoard();
};

function renderBoard() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const val = currentBoard[r][c];
            const isInit = initialBoard[r][c] !== 0;
            cell.className = 'cell' + (isInit ? ' initial' : '') + 
                (selectedCell?.r === r && selectedCell?.c === c ? ' selected' : '');
            cell.innerHTML = '';
            if (val !== 0) {
                cell.textContent = val;
                if (selectedCell && currentBoard[selectedCell.r][selectedCell.c] === val) cell.classList.add('highlighted');
            } else {
                const cn = notes[`${r}-${c}`];
                if (cn?.length) {
                    const g = document.createElement('div'); g.className = 'note-grid';
                    for (let i = 1; i <= 9; i++) {
                        const s = document.createElement('span'); s.className = 'note-num';
                        s.textContent = cn.includes(i) ? i : ''; g.appendChild(s);
                    }
                    cell.appendChild(g);
                }
            }
        }
    }
}

function generateGame(difficulty) {
    let grid = Array(9).fill().map(() => Array(9).fill(0));
    const solve = (g) => {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (g[r][c] === 0) {
                    let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (let n of nums) {
                        if (isSafe(g, r, c, n)) {
                            g[r][c] = n;
                            if (solve(g)) return true;
                            g[r][c] = 0;
                        }
                    } return false;
                }
            }
        } return true;
    };
    solve(grid);
    solvedBoard = JSON.parse(JSON.stringify(grid));
    let holes = difficulty === 'easy' ? 32 : difficulty === 'medium' ? 46 : 56;
    while(holes > 0) {
        let r = Math.floor(Math.random()*9), c = Math.floor(Math.random()*9);
        if(grid[r][c]!==0) { grid[r][c]=0; holes--; }
    }
    initialBoard = JSON.parse(JSON.stringify(grid));
    currentBoard = JSON.parse(JSON.stringify(grid));
    notes = {}; selectedCell = null;
}

function isSafe(g, r, c, n) {
    for(let i=0; i<9; i++) if(g[r][i]===n || g[i][c]===n) return false;
    let rs=r-r%3, cs=c-c%3;
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(g[rs+i][cs+j]===n) return false;
    return true;
}

function checkWin() {
    if (currentBoard.every((row, r) => row.every((v, c) => v === solvedBoard[r][c]))) {
        setTimeout(() => alert("Gewonnen!"), 200);
    }
}

document.addEventListener('DOMContentLoaded', initGrid);