let currentBoard = [], solvedBoard = [], initialBoard = [], selectedCell = null, pencilMode = false, notes = {};
let currentDiff = 'medium';

function initGrid() {
    const b = document.getElementById('sudoku-board');
    b.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let div = document.createElement('div');
            div.id = `cell-${r}-${c}`;
            div.className = 'cell';
            div.onclick = () => { 
                selectedCell = {r, c}; 
                render(); 
                if(navigator.vibrate) navigator.vibrate(10); 
            };
            b.appendChild(div);
        }
    }
}

window.startGame = function(s) {
    currentDiff = s;
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    generate(s); 
    render();
};

window.showWelcome = function() {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
};

window.newGame = function() { generate(currentDiff); render(); };

window.togglePencil = function() {
    pencilMode = !pencilMode;
    document.getElementById('btn-pencil').classList.toggle('active', pencilMode);
};

window.inputNumber = function(n) {
    if(!selectedCell) return;
    const {r, c} = selectedCell;
    if(initialBoard[r][c] !== 0) return;
    if(n === 'X') { 
        currentBoard[r][c] = 0; 
        delete notes[`${r}-${c}`]; 
    } else if(pencilMode) {
        let k = `${r}-${c}`; if(!notes[k]) notes[k] = [];
        notes[k] = notes[k].includes(n) ? notes[k].filter(x => x!==n) : [...notes[k], n];
    } else { 
        currentBoard[r][c] = n; 
        delete notes[`${r}-${c}`]; 
    }
    render(); 
    checkWin();
};

window.getHint = function() {
    if(selectedCell) {
        currentBoard[selectedCell.r][selectedCell.c] = solvedBoard[selectedCell.r][selectedCell.c];
        render();
    }
};

window.solveGame = function() { 
    currentBoard = JSON.parse(JSON.stringify(solvedBoard)); 
    render(); 
};

function render() {
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            let el = document.getElementById(`cell-${r}-${c}`);
            let val = currentBoard[r][c];
            el.className = `cell ${initialBoard[r][c]!==0?'initial':''} ${selectedCell?.r===r && selectedCell?.c===c?'selected':''}`;
            el.innerHTML = '';
            if(val !== 0) el.textContent = val;
            else if(notes[`${r}-${c}`]) {
                let g = document.createElement('div'); g.className = 'note-grid';
                for(let i=1; i<=9; i++) {
                    let s = document.createElement('span'); s.className = 'note-num';
                    s.textContent = notes[`${r}-${c}`].includes(i) ? i : '';
                    g.appendChild(s);
                }
                el.appendChild(g);
            }
        }
    }
}

function generate(s) {
    let g = Array(9).fill().map(() => Array(9).fill(0));
    const solve = (b) => {
        for(let r=0; r<9; r++) {
            for(let c=0; c<9; c++) {
                if(b[r][c]===0) {
                    let nums = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
                    for(let n of nums) {
                        if(isSafe(b,r,c,n)) { b[r][c]=n; if(solve(b)) return true; b[r][c]=0; }
                    } return false;
                }
            }
        } return true;
    };
    solve(g); 
    solvedBoard = JSON.parse(JSON.stringify(g));
    let h = s==='easy'?30:s==='medium'?45:55;
    while(h>0) { 
        let r=Math.floor(Math.random()*9), c=Math.floor(Math.random()*9); 
        if(g[r][c]!==0){g[r][c]=0; h--;} 
    }
    initialBoard = JSON.parse(JSON.stringify(g)); 
    currentBoard = JSON.parse(JSON.stringify(g));
    notes = {};
}

function isSafe(b,r,c,n) {
    for(let i=0; i<9; i++) if(b[r][i]===n || b[i][c]===n) return false;
    let rs=r-r%3, cs=c-c%3;
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(b[rs+i][cs+j]===n) return false;
    return true;
}

function checkWin() {
    if(currentBoard.flat().join('') === solvedBoard.flat().join('')) {
        setTimeout(()=>alert("Hervorragend gelöst!"), 300);
    }
}

document.addEventListener('DOMContentLoaded', initGrid);