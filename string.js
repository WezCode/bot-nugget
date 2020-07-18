
const fs = require("fs");
const { match } = require("assert");
let valorantObject = getJsonData("./valorant-stats.json");

// Display string format in a formatted way
// Takes in a string and returns a nicely formatted "table like" string
const jsonToStringDisplay = (jsonObject, columns) => {
    const arrayRep = [];
    let finalArray = [];
    let displayString = "";
    //This array will hold the columns (grouped by col num passed in)
    for (const gun in jsonObject) {
        const levelOne = [];
        if (jsonObject[gun].length != 0) {
            // levelOne.push(gun);
            for (const entry of jsonObject[gun]) {
                levelOne.push(`${entry.name}$${entry.time}`);
            }
            arrayRep.push(levelOne);
        }
    }

    arrayRep.sort((a, b) => { return b.length - a.length });
    finalArray = setUpArray(arrayRep, columns);
    // console.log(finalArray);

    for (const row of finalArray) {
        for (const column of row) {
            //Add Gun Name
            displayString += padString(`${column[0]}`, 15);
        }
        displayString += "\n";
        //Always loop the number of times in row[0].length
        for (let i = 1; i <= row[0].length; ++i) {
            for (const column of row) {
                if (column[i] != undefined) {
                    displayString += padString(`${column[i]}`, 15);
                }
            }
            displayString += "\n";

        }
        displayString += "\n";
    }

    console.log(displayString);

}

const padString = (string, padWidth) => {
    let content = string.split("$");
    // console.log(content);
    let paddedString = content[0];
    let time = content[1];
    // console.log(string.length, padWidth);

    if (time != undefined) {
        // console.log(paddedString, padWidth);
        while (paddedString.length < (padWidth - time.length)) {
            paddedString += " ";
        }
        paddedString += time;
        while (paddedString.length < padWidth) {
            paddedString += " ";
        }

    } else {

    }
    while (paddedString.length < padWidth + 7) {
        paddedString += " ";
    }
    return paddedString;
}

const setUpArray = (sortedArray, columns) => {
    const array = [];
    const rows = Math.ceil(sortedArray.length / columns);
    for (let i = 0; i < rows; ++i) {
        array.push([]);
    }

    for (let i = 0; i < sortedArray.length; ++i) {
        const index = Math.floor(i / columns);
        array[index].push(sortedArray[i]);
    }
    return array;
}




function getJsonData(path) {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
}


jsonToStringDisplay(valorantObject, 4);

module.exports = jsonToStringDisplay;