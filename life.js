var surfaceSizeUI = 0;
var surfaceSize = 0;
var surfaceDelay = 0;
var stateArray = [];
var generationCache = [];
var drawControl = document.getElementById("draw");
var sizeControl = document.getElementById("surface-size");
var delayControl = document.getElementById("surface-delay");
var startControl = document.getElementById("start");
var cleanControl = document.getElementById("clean");

sizeControl.addEventListener('input', event => {
    surfaceSizeUI = +event.target.value;
    drawControl.disabled = (surfaceSizeUI >= 10 && surfaceSizeUI <= 100) ? false : true;
})

delayControl.addEventListener('input', (event) => {
    surfaceDelay = +event.target.value;
})

drawControl.addEventListener('click', function(){
    if(surfaceSizeUI >= 10 && surfaceSizeUI <= 100){
        surfaceSize = surfaceSizeUI;
        stateArray = createStateArray(surfaceSize);
        drawSurface(stateArray);
        startControl.disabled = false;
        cleanControl.disabled = false;
    }
    else{
        alert('введите Размер поля от 10 до 100');
    }
})

cleanControl.addEventListener('click', function(){
    stateArray = createStateArray(surfaceSize);
    let aliveCell = document.querySelector(".cell[cell-state = '1']");
    while (!!aliveCell) {
        aliveCell.setAttribute('cell-state', '0');
        aliveCell = document.querySelector(".cell[cell-state = '1']");
    }
})
startControl.addEventListener('click', function(){
    startControl.disabled = true;
    drawControl.disabled = true;
    cleanControl.disabled = true;
    startLife();
})

function createStateArray(size){
    let stateStartArray = [];
    for (let i = 0; i < size; i++){
        stateStartArray[i] = [];
        for (let j = 0; j < size; j++){
            stateStartArray[i][j] = 0;
        }
    }
    return stateStartArray;
}

function drawSurface(stateArray){
    clearOldSurface();
    let surfaceContainer = document.querySelector('.life-surface');
    stateArray.forEach((row, rowNumber) =>{
        let surfaceRow = createCustomElem('div', 'surface-row', `row-${rowNumber}`);
        row.forEach((cell, cellIndex) => {
            let surfaceCell = createCustomElem('div', 'cell', `cell-${rowNumber}-${cellIndex}`);
            surfaceRow.appendChild(surfaceCell);
            surfaceCell.addEventListener('click', function(){
                changeCellState(rowNumber, cellIndex, surfaceCell);
            })
        })
        surfaceContainer.appendChild(surfaceRow);
    })
    //console.log(JSON.stringify(stateArray));
}

function clearOldSurface(){
    let row = document.querySelector(".surface-row");
    while (!!row) {
        row.remove();
        row = document.querySelector(".surface-row");
    }
}

function changeCellState(i, j, cell){
    let cellState = stateArray[i][j] == 0 ? 1 : 0;
    stateArray[i][j] = cellState;
    cell.setAttribute('cell-state', cellState);
    //console.log(JSON.stringify(stateArray));
}
// function startToggle(){
//     console.log('start toggle')
//     timerId = setTimeout(function toggleTitle() {
//         let title = document.getElementsByClassName('title')[0];
//         title.classList.toggle('white');
//         timerId = setTimeout(toggleTitle, surfaceDelay);
//     }, surfaceDelay);
// }

function startLife (){
    if(!surfaceDelay){
        surfaceDelay = 300;
    }
    var timerId = setTimeout(function releaseNewGeneration() {
            let currentStateString = JSON.stringify(stateArray);
            if(generationCache.length > 0){
                if(generationCache.includes(currentStateString)){
                    clearTimeout(timerId);
                    generationCache = [];
                    stopControl.disabled = true;
                    startControl.disabled = false;
                    drawControl.disabled = false;
                    cleanControl.disabled = false;
                    alert('Игра окончена');
                    return;
                }
            }
            generationCache.push(currentStateString);
            stateArray = stateArray.map((row, index, array) => row.map((cell, pos) => getNewCellState(array, index, pos)));
            // stateArray = stateArray.map((row, index, array) =>{
            //         return row.map((cell, pos) =>{
            //           return  getNewCellState (array, index, pos);
            //         })
            //     });
            //console.log(JSON.stringify(stateArray));
            drawNewGeneration(stateArray);
            timerId = setTimeout(releaseNewGeneration, surfaceDelay);
        }
        , surfaceDelay);
    let stopControl = document.getElementById("stop");
    stopControl.disabled = false;
    stopControl.addEventListener('click', function(){
        clearTimeout(timerId);
        stopControl.disabled = true;
        startControl.disabled = false;
        drawControl.disabled = false;
        cleanControl.disabled = false;
    })
}

function getNewCellState(array, i, j){
    let cell = array[i][j];
    let counter = 0
    if(!!array[i-1]){
        if(array[i-1][j-1] == 1) counter++;
        if(array[i-1][j] == 1) counter++;
        if(array[i-1][j+1] == 1) counter++;
    }
    if(array[i][j-1] == 1) counter++;
    if(array[i][j+1] == 1) counter++;
    if(!!array[i+1]){
        if(array[i+1][j-1] == 1) counter++;
        if(array[i+1][j] == 1) counter++;
        if(array[i+1][j+1] == 1) counter++;
    }
    if(cell == 0){
        return counter == 3 ? 1 : 0;
    }
    if(cell == 1){
        return (counter == 2 || counter == 3) ? 1 : 0;
    }
}

function drawNewGeneration(state){
    let length = state.length;
    for (let i = 0; i < length; i++){
        for (let j = 0; j < length; j++){
            let cell = document.getElementById(`cell-${i}-${j}`);
            cell.setAttribute('cell-state', state[i][j]);
        }
    }
}

function createCustomElem (elemType, className, id){
    if(!!elemType){
        let elem = document.createElement(elemType);
        if(!!className){
            elem.classList.add(className);
        }
        if(!!id){
            elem.id = id;
        }
        return elem;
    }
}
