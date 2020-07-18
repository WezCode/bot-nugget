const Discord = require("discord.js"); //looks in node_modules folder for discord.js
const { prefix, token } = require("./auth.json");
const fs = require("fs");
const bot = new Discord.Client();

bot.login(token);

bot.on("ready", async () => {
	console.log(`${bot.user.username} is online!`);
});


// const checkIfCommandIsGunName = (valorantObject, gunArg) => {
// 	let retVal = false;
// 	Object.keys(valorantObject).forEach((gunKey) => {
// 		if (gunArg.toLowerCase() == gunKey.toLowerCase()) {
// 			console.log("comparing", gunArg, "to", gunKey);
// 			gunObject = valorantObject[gunKey];
// 			retVal = true;
// 		}
// 	})
// 	return retVal;
// };

bot.on("message", async message => {
	//Split message into an array (messageArray)
	let messageArray = message.content.split(" ");
	let firstArg = messageArray[0];
	//Take in messageArray and return a sub array from index 1 to the end
	let args = messageArray.slice(1);

	if (message.channel.name == "valorant-shooting-practice-eliminate-50-strafe") {

		valorantStatKeeper(message, messageArray);
	} else if (message.channel.name == "valorant-test") {
		valorantStatKeeper(message, messageArray);
	}

	switch (firstArg) {
		case `${prefix}botinfo`:
			let botembed = new Discord.RichEmbed()
				.setDescription("Bot Information")
				.setColor("#15f153")
				.addField("Bot Name", bot.user.username);
			message.channel.send(botembed);
			break;
		case `${prefix}change`:
			var text = fs.readFileSync("./nuggets.txt");
			let textString = text.toString();
			let textArray = textString.split("\n");
			let random = Math.floor(Math.random() * 358);
			message.member
				.setNickname(`${textArray[random]}` + " Nugget")
				.then(console.log)
				.catch(console.error);
			break;
	}
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
	let newUserChannel = newMember.voiceChannel;
	let oldUserChannel = oldMember.voiceChannel;

	var text = fs.readFileSync("./nuggets.txt");
	let textString = text.toString();
	let textArray = textString.split("\n");
	let random = Math.floor(Math.random() * 358);
	// message.channel.send(`${textArray[random]}`);

	if (oldUserChannel === undefined && newUserChannel !== undefined) {
		newMember
			.setNickname(`${textArray[random]}` + " Nugget")
			.then(console.log)
			.catch(console.error);
	} else if (newUserChannel === undefined) {
		// User leaves a voice channel
	}
});

function writeJson(path, jsonString) {
	fs.writeFileSync(
		path,
		JSON.stringify(jsonString, null, 2),
		function writeJSON(err) {
			if (err) throw err;
		}
	);
}


function getJsonData(path) {
	return JSON.parse(fs.readFileSync(path, "utf-8"));
}

const displayStats = (valorantObject) => {
	//DISPLAY STATS

	let displayString = "";
	for (var gun in valorantObject) {
		if (valorantObject[gun].length != 0) {
			displayString += `${gun}\n`;
			//Dont log anything if no entries for games
			for (let i = 0; i < valorantObject[gun].length; i++) {
				displayString += `${i + 1}. ${valorantObject[gun][i].name} ${valorantObject[gun][i].time}\n`;
			}
			displayString += "\n";
		}
	}
	console.log(displayString);
	return displayString;
};

const valorantStatKeeper = (message, messageArray) => {
	let valorantObject = getJsonData("./valorant-stats.json");
	let firstArg = messageArray[0];
	let newTime = messageArray[1];
	// Check argument in messArray to see if it is either "stats" or a gun name. These 
	// Are the only two commands right now.	

	if (firstArg.toLowerCase() == "stats") {
		const msg = jsonToStringDisplay(valorantObject, 4, message);
		// const vandalString = "fhjieo\nafh;ioawehfosafadwaeah";
		// const phantomString = "fhjieoafh;ioawehffasfs\nasaoeah";

		// let botembed = new Discord.RichEmbed()
		// 	.setDescription("msg")
		// 	.setColor("#15f153")
		// 	.addField("Vandal", vandalString, true)
		// 	.addField("Phantom", phantomString, true);

		message.channel.send(msg);
	} else if (checkIfCommandIsGunName(valorantObject, firstArg)) {
		if (!isNaN(newTime)) {
			let entryExists = false;
			let username = message.author.username;

			let firstArgCasedProperly = makeFirstCharacterUpperAndRestLower(firstArg);

			//Check if entry for message author already exists for that gun
			for (let entry of valorantObject[firstArgCasedProperly]) {
				//check entry for author already exists
				if (entry.name == username) {
					//if author's new time is less than existing time
					if (newTime < parseInt(entry.time, 10)) {
						message.channel.send(`You beat your old best time by ${entry.time - newTime} ${(entry.time - newTime == 1) ? "second" : "seconds"}!`);
						//Update entry time in valorant-stats.json
						entry.time = newTime;
						message.channel.send(`Your new best time for ${firstArgCasedProperly} is ${entry.time}!`);
					} else {
						message.channel.send(`You didn't beat your best time of ${entry.time} seconds`);
					}
					entryExists = true;
				}
			}
			//Create a entry for the current user for the particular gun
			if (!entryExists) {
				const newEntry = {
					name: username,
					time: newTime
				};
				valorantObject[firstArgCasedProperly].push(newEntry);
			}
			sortTimes(valorantObject[firstArgCasedProperly]);
			writeJson("./valorant-stats.json", valorantObject);
		}
	}
}

const checkIfCommandIsGunName = (valorantObject, firstArg) => {
	let returnValue = false;
	for (let gunName in valorantObject) {
		//Check if firstArg is a gun name
		// console.log(firstArg.toLowerCase, "= ", gunName.toLowerCase);
		if (firstArg.toLowerCase() == gunName.toLowerCase()) {
			returnValue = true;
		}
	}
	return returnValue;
};

const makeFirstCharacterUpperAndRestLower = (string) => {
	const lower = string.toLowerCase();
	return lower.charAt(0).toUpperCase() + lower.substring(1);
}

//Sorting function that will put the fastest times on top/start
const sortTimes = (entries) => {
	entries.sort((a, b) => { return parseInt(a.time, 10) - parseInt(b.time, 10) });
}

const jsonToStringDisplay = (jsonObject, columns) => {

	console.log("called jsontostring");
	const arrayRep = [];
	let finalArray = [];
	let displayString = "";
	//This array will hold the columns (grouped by col num passed in)
	for (const gun in jsonObject) {
		const levelOne = [];
		if (jsonObject[gun].length != 0) {
			levelOne.push(`${gun}`);
			for (const entry of jsonObject[gun]) {
				levelOne.push(entry);
			}
			arrayRep.push(levelOne);
		}
	}

	arrayRep.sort((a, b) => { return b.length - a.length });
	// finalArray = setUpArray(arrayRep, columns);

	let botembed = new Discord.RichEmbed()
		.setColor("#15f153");

	//Convert array of entries into a string
	console.log("array rep", arrayRep);


	const newArray = [];
	for (const gun of arrayRep) {
		let gunEntryListPair = [];
		gunEntryListPair.push(gun[0]);
		const entries = gun.slice(1);
		let entriesStringList = "";
		for (const entry of entries) {
			entriesStringList += padString(entry.name, 12);
			entriesStringList += entry.time;
			//Don't do it for last one maybe
			entriesStringList += "\n";
		}
		entriesStringList = "```" + entriesStringList + "```";
		console.log("entriesStringList", entriesStringList);


		gunEntryListPair.push(entriesStringList);

		console.log("gunEntryListPair", gunEntryListPair);
		newArray.push(gunEntryListPair);
	}

	console.log("newArray", newArray);

	for (const array of newArray) {
		// botembed.addField(gun[0], "```" + gun.slice(1) + "```", true);
		botembed.addField(array[0], array[1], true);
	}


	//Manual padding and table display for console
	// for (const row of finalArray) {
	// 	for (const column of row) {
	// 		//Add Gun Name
	// 		displayString += padString(`${column[0]}`, 15);
	// 	}
	// 	displayString += "\n";
	// 	//Always loop the number of times in row[0].length
	// 	for (let i = 1; i <= row[0].length; ++i) {
	// 		for (const column of row) {
	// 			if (column[i] != undefined) {
	// 				displayString += padString(`${column[i]}`, 15);
	// 			}
	// 		}
	// 		displayString += "\n";

	// 	}
	// 	displayString += "\n";
	// }

	// console.log(displayString);
	return botembed;

}

const padString = (string, padWidth) => {
	// let content = string.split("$");
	// console.log(content);
	// let paddedString = content[0];
	let paddedString = string;
	// let time = content[1];
	// console.log(string.length, padWidth);

	// if (time != undefined) {
	// 	// console.log(paddedString, padWidth);
	// 	while (paddedString.length < (padWidth - time.length)) {
	// 		paddedString += " ";
	// 	}
	// 	paddedString += time;
	// 	while (paddedString.length < padWidth) {
	// 		paddedString += " ";
	// 	}

	// } 
	while (paddedString.length < padWidth) {
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