var surfaceSizeUI = 0;
var surfaceSize = 0;
var surfaceDelay = 0;
var fullState = {rows:{}};
var generationCache = [];
var stateToCheck = {};
var drawControl = document.getElementById("draw");
var sizeControl = document.getElementById("surface-size");
var delayControl = document.getElementById("surface-delay");
var startControl = document.getElementById("start");
var generationControl = document.getElementById("generation");
var cleanControl = document.getElementById("clean");
var stopControl = document.getElementById("stop");
var isClickPushed = false;
var stopLife = false
var gameOver = false
var surface = document.querySelector('.life-surface');

//Задать размер, задержку, нарисовать поле
sizeControl.addEventListener('input', event => {
    surfaceSizeUI = +event.target.value;
    drawControl.disabled = (surfaceSizeUI >= 10 && surfaceSizeUI <= 2001) ? false : true;
})

delayControl.addEventListener('input', (event) => {
    surfaceDelay = +event.target.value;
})

drawControl.addEventListener('click', function() {
    surfaceSize = surfaceSizeUI;
    createfullState(surfaceSize);
    drawSurface(fullState, surfaceSize);
    changeButtonsState(true, false, false, true, false);
})

function changeButtonsState(draw, oneGen, start, stop, clean) {
    drawControl.disabled = draw
    generationControl.disabled = oneGen
    startControl.disabled = start
    stopControl.disabled = stop
    cleanControl.disabled = clean
}

function createfullState(size) {
    for (let i = 0; i < size; i++) {
        let currentRowKeys = [];
        for (let j = 0; j < size; j++) {
            let key = `${i}-${j}`;
            fullState[key] = {i,j, cellState:0};
            currentRowKeys.push(key);
        }
        fullState.rows[i] = currentRowKeys;
    }
}

function drawSurface(fullState, rowNum){
    clearOldSurface();
    let surfaceContainer = document.querySelector('.life-surface');
    for (let row = 0; row < rowNum; row++) {
        let surfaceRow = createCustomElem('div', 'surface-row');
        let rowCells = fullState.rows[row];
        for (let index = 0; index < rowCells.length; index++) {
            let cell = fullState[rowCells[index]];//{i,j, cellState};
            let surfaceCell = createCustomElem('div', 'cell', `${cell.i}-${cell.j}`);
            surfaceRow.appendChild(surfaceCell);
        }
        surfaceContainer.appendChild(surfaceRow);
    }
}

function clearOldSurface() {
    let row = document.querySelector(".surface-row");
    while (!!row) {
        row.remove();
        row = document.querySelector(".surface-row");
    }
}

function createCustomElem (elemType, className, id) {
    if(!!elemType){
        let elem = document.createElement(elemType);
        if(!!className) elem.classList.add(className);
        if(!!id) elem.id = id;
        return elem;
    }
}

//Водим и кликаем по полю
window.addEventListener('mousedown', () => {
    isClickPushed = true;
})
window.addEventListener('mouseup', () => {
    isClickPushed = false;
})

surface.addEventListener('click', event => {
    let elem = event.target;
    if(!!elem.id) {
        let idArr = elem.id.split("-");
        changeCellState(+idArr[0], +idArr[1], elem, elem.id, false);
    }
})
surface.addEventListener('mousemove', event => {
    let elem = event.target;
    if(!!elem.id) {
        if(isClickPushed == true) {
            let idArr = elem.id.split("-");
            changeCellState(+idArr[0], +idArr[1], elem, elem.id, true);
        }
    }
})

function changeCellState(i, j, cell, key, forceCheck) {
    let cellState = 1;
    if(!forceCheck){
        cellState = fullState[key].cellState == 0 ? 1 : 0;
    }
    fullState[key].cellState = cellState;
    let cellParam = {i, j, cellState};
    stateToCheck[key] = cellParam;
    stateToCheck = addCellAndNeighBors(stateToCheck, cellParam);
    cell.setAttribute('cell-state', cellState);
}

function addCellAndNeighBors(obj, params) {
    let neighborList = getNeighbors(params).neighbors;//[]
    for(let i = 0; i < neighborList.length; i++) {
        let key = `${neighborList[i].i}-${neighborList[i].j}`
        if(!obj.hasOwnProperty(key)) {
            obj[key] = neighborList[i];
        }
    }
    return obj;
}

function getNeighbors(params) {
    let neighbors = [];
    let counter = 0;
    let i = params.i;
    let j = params.j;
    for(let m = i-1; m < i+2; m++) {
        for (let k = j - 1; k < j + 2; k++) {
            let cell = fullState[`${m}-${k}`]
            if (!!cell) {
                let cellState = cell.cellState;
                if (!(m == i && k == j)) {
                    counter = counter + cellState;
                    neighbors.push({i: m, j: k, cellState})
                }
            }
        }
    }
    return {neighbors, counter};
}

//Очищаем поле
cleanControl.addEventListener('click', function() {
    createfullState(surfaceSize);
    stateToCheck = {};
    generationCache = [];
    let aliveCell = document.querySelector(".cell[cell-state = '1']");
    while (!!aliveCell) {
        aliveCell.setAttribute('cell-state', '0');
        aliveCell = document.querySelector(".cell[cell-state = '1']");
    }
})

stopControl.addEventListener('click', function() {
    stopLife = true;
    changeButtonsState(false, false, false, true, false);
})

//Рисуем одно поколение
generationControl.addEventListener('click', function() {
    changeButtonsState(false, false, false, true, false);
    oneGeneration();
})

function oneGeneration() {
    let currentStateString = JSON.stringify(fullState);
    if(generationCache.length > 0) {
        if(generationCache.includes(currentStateString)) {
            generationCache = [];
            changeButtonsState(false, false, false, true, false);
            gameOver = true
        }
    }
    generationCache.push(currentStateString);
    stateToCheck = updateStateToCheck(stateToCheck);
    drawNewGeneration(stateToCheck);
}

function updateStateToCheck(obj) {
    let acc = {};
    let newfullState = {...fullState}
    for (let key in obj) {
        let cellParam = obj[key];
        let options = getNeighbors(cellParam);
        let neighborList = options.neighbors;
        let counter = options.counter;
        let cellState = cellParam.cellState;
        let newCellState = 0;
        let needPushNeighbors = false;
        if(cellState == 0) {
            newCellState = counter == 3 ? 1 : 0
            if(counter > 0) {
                needPushNeighbors = true;
                acc[key] = {i:cellParam.i, j:cellParam.j, cellState: newCellState};
                newfullState[key] = {i:cellParam.i, j:cellParam.j, cellState: newCellState};
            }
        }

        if(cellState == 1) {
            newCellState = (counter == 2 || counter == 3) ? 1 : 0;
            needPushNeighbors = true;
            acc[key] = {i:cellParam.i, j:cellParam.j, cellState: newCellState};
            newfullState[key] = {i:cellParam.i, j:cellParam.j, cellState: newCellState};
        }

        if(newCellState == 0 && counter == 0) {
            needPushNeighbors = false;
        }

        if(needPushNeighbors) {
            for(let i = 0; i < neighborList.length; i++) {
                let keykey = `${neighborList[i].i}-${neighborList[i].j}`;
                if(!acc.hasOwnProperty(keykey)) {
                    acc[keykey] = neighborList[i];
                }
            }
        }
    }
    fullState = {...newfullState}
    return acc;
}

function drawNewGeneration(state) {
    for (let key in state) {
        let params = state[key];
        let cell = document.getElementById(`${params.i}-${params.j}`);
        cell.setAttribute('cell-state', params.cellState);
    }
}

//Рисуем поколения в цикле
startControl.addEventListener('click', function() {
    changeButtonsState(true, true, true, false, true);
    startLife();
})

function startLife() {
    if(!surfaceDelay) surfaceDelay = 300;
    stopLife = false;
    gameOver = false;

    Promise.resolve()
    .then(function promiseResolver() {
        return callOneGen().then(promiseResolver);
    })
    .catch((error) => {
        if(error === true) {
            alert(`Игра окончена`);
        }
    });
}
//TODO запилить функцию одну на цикл и на один раз
function callOneGen() {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            oneGeneration();
            if(!stopLife && !gameOver) {
                resolve();
            }
            else {
                reject(gameOver);
            }
        }, surfaceDelay);
    });
}
