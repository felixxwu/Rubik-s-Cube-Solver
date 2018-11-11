var solved = false;
var solution = "not solved";

var minScore = 100;
var scoreAverage = 0;
var totalBranchScores = 0;
var numberOfBranches = 0;
var pruned = 0;

var g = "G";
var b = "B";
var r = "R";
var o = "O";
var w = "W";
var y = "Y";

var topRow = [0,1,2];
var leftCol = [0,3,6];
var rightCol = [2,5,8];
var bottomRow = [6,7,8];
var topRowRev = [2,1,0];
var leftColRev = [6,3,0];
var rightColRev = [8,5,2];
var bottomRowRev = [8,7,6];

var startState = {
    front:  [r,o,r,y,g,b,g,g,g], //g
    right:  [b,g,g,o,o,g,o,o,o], //o
    up:     [b,y,b,r,b,r,g,g,y], 
    left:   [y,b,b,y,r,o,r,r,r], 
    back:   [o,b,o,b,y,r,y,y,y], 
    down:   [w,w,w,w,w,w,w,w,w]
};

// var startState = {
//     front:  [g,g,g,g,g,g,g,g,g], //g
//     right:  [o,o,o,o,o,o,o,o,o], //o
//     up:     [b,b,b,b,b,b,b,b,b], 
//     left:   [r,r,r,r,r,r,r,r,r], 
//     back:   [y,y,y,y,y,y,y,y,y], 
//     down:   [w,w,w,w,w,w,w,w,w]
// };

// startState = front(startState);
// startState = backRev(startState);
// startState = left(startState);
// startState = right(startState);
// startState = left(startState);

// console.log(evaluateScore(startState));

main();
// LDS(1);

function main() {
    console.log("started...");
    let depth = 1;
    while (!solved) {
        console.log("starting limited depth search... depth: " + depth + " time: " + Date());
        pruned = 0;
        LDS(depth);
        console.log("pruned: " + pruned);
        
        depth++;
    }
    console.log(solution);
    
}

function LDS(depth) {
    solve([{
        path: "",
        history: [],
        state: startState,
        score: 0
    }], 0, depth);
}

function solve(branches, depth, maxDepth) {
    if (depth > maxDepth) {
        return;
    }
    for (let i = 0; i < branches.length; i++) {
        const branch = branches[i];

        if (hasDuplicate(branch)) {
            pruned++;
            return;
        }
        solve(
            [
                expandBranch(branch, front,    "F"),
                expandBranch(branch, frontRev, "F'"),
                expandBranch(branch, right,    "R"),
                expandBranch(branch, rightRev, "R'"),
                expandBranch(branch, up,       "U"),
                expandBranch(branch, upRev,    "U'"),
                expandBranch(branch, left,     "L"),
                expandBranch(branch, leftRev,  "L'"),
                expandBranch(branch, back,     "B"),
                expandBranch(branch, backRev,  "B'"),
                expandBranch(branch, down,     "D"),
                expandBranch(branch, downRev,  "D'")
            ],
            depth + 1,
            maxDepth
        )
    }
}

function expandBranch(branch, action, actionName) {
    let newHistory = JSON.parse(JSON.stringify(branch.history));
    newHistory.push(branch.state);
    let newBranch = {
        path: branch.path + actionName + " - ",
        history: newHistory,
        state: action(branch.state),
        score: 0
    };
    if (isSolved(newBranch.state)) {
        solved = true;
        solution = newBranch.path;
        console.log(newBranch.path);
    }
    // newBranch.score = evaluateScore(newBranch.state);
    // totalBranchScores += newBranch.score;
    
    // console.log(newBranch);
    return newBranch;
}

function hasDuplicate(branch) {
    for (let i = 0; i < branch.history.length; i++) {
        if (JSON.stringify(branch.history[i]) == JSON.stringify(branch.state)) {
            return true;
        }
    }
}

function evaluateScore(state) {
    return (
        solvedCubeFaces(state.front) +
        solvedCubeFaces(state.right) +
        solvedCubeFaces(state.up) +
        solvedCubeFaces(state.left) +
        solvedCubeFaces(state.back) +
        solvedCubeFaces(state.down)
    );
}

function solvedCubeFaces(face) {
    let solved = -1;
    for (let i = 0; i < face.length; i++) {
        if (face[4] == face[i]) {
            solved++;
        }
    }
    return solved;
}

function isUniform(face) {
    for (let i = 1; i < face.length; i++) {
        if (face[i] !== face[0]) {
            return false;
        }
    }
    return true;
}

function isSolved(state) {
    return (
        isUniform(state.front) &&
        isUniform(state.right) &&
        isUniform(state.up) &&
        isUniform(state.left) &&
        isUniform(state.back) &&
        isUniform(state.down)
    );
}

function rotateFace(face) {
    newFace = [
        face[6], face[3], face[0],
        face[7], face[4], face[1],
        face[8], face[5], face[2]
    ];
    return newFace;
}

function rotateFaceRev(face) {
    newFace = [
        face[2], face[5], face[8],
        face[1], face[4], face[7],
        face[0], face[3], face[6]
    ];
    return newFace;
}

// writes the edge colours for a given writeFace and it's writeEdge
// abstractify the edges to be top left right and bottom
// function edge(writeFace, writeEdge, readFace, readEdge) {
//     let newFace = JSON.parse(JSON.stringify(writeFace));
//     newFace[writeEdge[0]] = readFace[readEdge[0]];
//     newFace[writeEdge[1]] = readFace[readEdge[1]];
//     newFace[writeEdge[2]] = readFace[readEdge[2]];
//     return newFace;
// }

function edge(writeFace, writeEdge, readFace, readEdge) {
    writeFace[writeEdge[0]] = readFace[readEdge[0]];
    writeFace[writeEdge[1]] = readFace[readEdge[1]];
    writeFace[writeEdge[2]] = readFace[readEdge[2]];
    return writeFace;
}

function front(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.front = rotateFace(state.front);

    newState.up = edge(newState.up, bottomRow, state.left, rightColRev);
    newState.right = edge(newState.right, leftCol, state.up, bottomRow);
    newState.down = edge(newState.down, topRow, state.right, leftColRev);
    newState.left = edge(newState.left, rightCol, state.down, topRow);

    return newState;
}

function frontRev(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.front = rotateFaceRev(state.front);

    newState.up = edge(newState.up, bottomRow, state.right, leftCol);
    newState.right = edge(newState.right, leftCol, state.down, topRowRev);
    newState.down = edge(newState.down, topRow, state.left, rightCol);
    newState.left = edge(newState.left, rightCol, state.up, bottomRowRev);

    return newState;
}

function right(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.right = rotateFace(state.right);

    newState.up = edge(newState.up, rightCol, state.front, rightCol);
    newState.back = edge(newState.back, leftCol, state.up, rightColRev);
    newState.down = edge(newState.down, rightCol, state.back, leftColRev);
    newState.front = edge(newState.front, rightCol, state.down, rightCol);

    return newState;
}

function rightRev(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.right = rotateFaceRev(state.right);

    newState.up = edge(newState.up, rightCol, state.back, rightColRev);
    newState.back = edge(newState.back, leftCol, state.down, rightColRev);
    newState.down = edge(newState.down, rightCol, state.front, rightCol);
    newState.front = edge(newState.front, rightCol, state.up, rightCol);

    return newState;
}

function up(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.up = rotateFace(state.up);

    newState.front = edge(newState.front, topRow, state.right, topRow);
    newState.right = edge(newState.right, topRow, state.back, topRow);
    newState.back = edge(newState.back, topRow, state.left, topRow);
    newState.left = edge(newState.left, topRow, state.front, topRow);

    return newState;
}

function upRev(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.up = rotateFaceRev(state.up);

    newState.front = edge(newState.front, topRow, state.left, topRow);
    newState.right = edge(newState.right, topRow, state.front, topRow);
    newState.back = edge(newState.back, topRow, state.right, topRow);
    newState.left = edge(newState.left, topRow, state.back, topRow);

    return newState;
}

function left(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.left = rotateFace(state.left);

    newState.front = edge(newState.front, leftCol, state.up, leftCol);
    newState.up = edge(newState.up, leftCol, state.back, rightColRev);
    newState.back = edge(newState.back, rightCol, state.down, leftColRev);
    newState.down = edge(newState.down, leftCol, state.front, leftCol);

    return newState;
}

function leftRev(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.left = rotateFaceRev(state.left);

    newState.front = edge(newState.front, leftCol, state.down, leftCol);
    newState.up = edge(newState.up, leftCol, state.front, leftCol);
    newState.back = edge(newState.back, rightCol, state.up, leftColRev);
    newState.down = edge(newState.down, leftCol, state.back, rightColRev);

    return newState;
}

function back(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.back = rotateFace(state.back);

    newState.up = edge(newState.up, topRow, state.right, rightCol);
    newState.right = edge(newState.right, rightCol, state.down, bottomRowRev);
    newState.down = edge(newState.down, bottomRow, state.left, leftCol);
    newState.left = edge(newState.left, leftCol, state.up, topRowRev);

    return newState;
}

function backRev(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.back = rotateFaceRev(state.back);

    newState.up = edge(newState.up, topRow, state.left, leftColRev);
    newState.right = edge(newState.right, rightCol, state.up, topRow);
    newState.down = edge(newState.down, bottomRow, state.right, rightColRev);
    newState.left = edge(newState.left, leftCol, state.down, bottomRow);

    return newState;
}

function down(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.down = rotateFace(state.down);

    newState.front = edge(newState.front, bottomRow, state.left, bottomRow);
    newState.right = edge(newState.right, bottomRow, state.front, bottomRow);
    newState.back = edge(newState.back, bottomRow, state.right, bottomRow);
    newState.left = edge(newState.left, bottomRow, state.back, bottomRow);

    return newState;
}

function downRev(state) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.down = rotateFaceRev(state.down);

    newState.front = edge(newState.front, bottomRow, state.right, bottomRow);
    newState.right = edge(newState.right, bottomRow, state.back, bottomRow);
    newState.back = edge(newState.back, bottomRow, state.left, bottomRow);
    newState.left = edge(newState.left, bottomRow, state.front, bottomRow);

    return newState;
}
