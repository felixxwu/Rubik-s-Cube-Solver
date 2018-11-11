console.log("started...");

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

// history of states from both ends
var scrambledHistory = {};
var solvedHistory = {};

var startState = {
    front:  [r,o,r,y,g,b,g,g,g], //g
    right:  [b,g,g,o,o,g,o,o,o], //o
    up:     [b,y,b,r,b,r,g,g,y], 
    left:   [y,b,b,y,r,o,r,r,r], 
    back:   [o,b,o,b,y,r,y,y,y], 
    down:   [w,w,w,w,w,w,w,w,w]
};


var solvedState = {
    front:  [g,g,g,g,g,g,g,g,g], //g
    right:  [o,o,o,o,o,o,o,o,o], //o
    up:     [b,b,b,b,b,b,b,b,b], 
    left:   [r,r,r,r,r,r,r,r,r], 
    back:   [y,y,y,y,y,y,y,y,y], 
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
// startState = left(startState);
// startState = backRev(startState);
// startState = right(startState);
// startState = left(startState);
// startState = up(startState);
// startState = right(startState);

// console.log(evaluateScore(startState));
// console.log(startState);

// let encoded = encodeState(startState);
// console.log(encoded);
// let decodedState = decodeState(encoded);
// console.log(decodedState);

main();

function main() {
    console.log(solve(
        {
            scrambledEnd: {[encodeState(startState)]: ""},
            solvedEnd: {[encodeState(solvedState)]: ""}
        },
        0));
    // document.getElementById("solution").innerHTML = solution;
}

function solve(branches2, depth) {
    console.log("depth: " + depth + " (x2) scrambled: " + Object.keys(scrambledHistory).length + " solved: " + Object.keys(solvedHistory).length + " - " + Date());
    if (depth > 7) {
        return "depth reached";
    }
    if (solved) {
        return solution;
    } else {
        solve(expandBranches(branches2), depth + 1);
    }
}

function expandBranches(branches2) {
    return {
        scrambledEnd: expandBranchesOneSide(branches2.scrambledEnd, true),
        solvedEnd: expandBranchesOneSide(branches2.solvedEnd, false)
    };
}

function expandBranchesOneSide(branches, scrambledEnd) {
    let newBranches = {};
    for (const branch in branches) {
        if (branches.hasOwnProperty(branch)) {
            const path = branches[branch];
            if (scrambledEnd) {
                scrambledHistory[branch] = path;
            } else {
                solvedHistory[branch] = path;
            }

            let branchState = decodeState(branch);
            
            expandBranch(newBranches, branchState, front, path + "F" + " - ", scrambledEnd);
            expandBranch(newBranches, branchState, frontRev, path + "F'" + "- ", scrambledEnd);
            expandBranch(newBranches, branchState, right, path + "R" + " - ", scrambledEnd);
            expandBranch(newBranches, branchState, rightRev, path + "R'" + "- ", scrambledEnd);
            expandBranch(newBranches, branchState, up, path + "U" + " - ", scrambledEnd);
            expandBranch(newBranches, branchState, upRev, path + "U'" + "- ", scrambledEnd);
            expandBranch(newBranches, branchState, left, path + "L" + " - ", scrambledEnd);
            expandBranch(newBranches, branchState, leftRev, path + "L'" + "- ", scrambledEnd);
            expandBranch(newBranches, branchState, back, path + "B" + " - ", scrambledEnd);
            expandBranch(newBranches, branchState, backRev, path + "B'" + "- ", scrambledEnd);
            expandBranch(newBranches, branchState, down, path + "D" + " - ", scrambledEnd);
            expandBranch(newBranches, branchState, downRev, path + "D'" + "- ", scrambledEnd);

        }
    }

    return newBranches;
}

function expandBranch(newBranches, branchState, action, path, scrambledEnd) {
    let expanded = action(branchState);
    let encoded = encodeState(expanded);
    newBranches[encoded] = path;
    if (isSolved(encoded, scrambledEnd)) {
        solved = true; 
        console.log("other side: " + path);
    }
}

function decodeState(code) {
    let decoded = "";
    for (let i = 0; i < 9; i++) {
        let base10 = code.charCodeAt(i);
        let base6by6 = base10.toString(6);
        while (base6by6.length < 6) {
            base6by6 = "0" + base6by6;
        }
        decoded += base6by6;
    }
    let state = {
        front:  decodeFace(decoded.substr(0 * 9, 9)),
        right:  decodeFace(decoded.substr(1 * 9, 9)),
        up:     decodeFace(decoded.substr(2 * 9, 9)),
        left:   decodeFace(decoded.substr(3 * 9, 9)),
        back:   decodeFace(decoded.substr(4 * 9, 9)),
        down:   decodeFace(decoded.substr(5 * 9, 9))
    };
    return state;
}

function decodeFace(code) {
    let face = [];
    for (let i = 0; i < code.length; i++) {
        const colour = code.charAt(i);
        switch (colour) {
            case "0": face.push(g); break;
            case "1": face.push(b); break;
            case "2": face.push(r); break;
            case "3": face.push(o); break;
            case "4": face.push(w); break;
            case "5": face.push(y); break;
        
            default: console.log("invalid colour number: " + colour);
        }
    }
    return face;
}

function encodeState(state) {
    let base6 = "";
    base6 += encodeFace(state.front);
    base6 += encodeFace(state.right);
    base6 += encodeFace(state.up);
    base6 += encodeFace(state.left);
    base6 += encodeFace(state.back);
    base6 += encodeFace(state.down);

    let code = "";
    
    // there are 6 * 9 = 54 squares total
    // string encoding goes up to 2^16 = 65536
    // an entire state can be represented as a base6 number, 54 digits long
    // 6 digits max can fit into one string character 6^6 = 46656
    // so there will be 9 string characters to make up the 54 digits
    for (let i = 0; i < 9; i++) {
        let base6by6 = base6.substr(i * 6, 6);
        let base10 = parseInt(base6by6, 6);
        let char = String.fromCharCode(base10);
        code += char;
    }
    return code;
}

function encodeFace(face) {
    let code = "";
    for (let i = 0; i < face.length; i++) {
        const colour = face[i];
        switch (colour) {
            case g: code += "0"; break;
            case b: code += "1"; break;
            case r: code += "2"; break;
            case o: code += "3"; break;
            case w: code += "4"; break;
            case y: code += "5"; break;
        
            default: console.log("cube colour does not exist. colour: " + colour);
            ;
        }
    }
    return code;
}
// var g = "G";
// var b = "B";
// var r = "R";
// var o = "O";
// var w = "W";
// var y = "Y";




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

function isSolved(encodedState, scrambledEnd) {
    if (scrambledEnd) {
        if (solvedHistory[encodedState] != undefined) {
            console.log("from the solved side: " + solvedHistory[encodedState]);
            return true;
        }
    } else {
        if (scrambledHistory[encodedState] != undefined) {
            console.log("from the scrambled side: " + scrambledHistory[encodedState]);
            return true;
        }
    }
    // return (
    //     isUniform(state.front) &&
    //     isUniform(state.right) &&
    //     isUniform(state.up) &&
    //     isUniform(state.left) &&
    //     isUniform(state.back) &&
    //     isUniform(state.down)
    // );
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
