const Discord = require("discord.js"); //looks in node_modules folder for discord.js
const { prefix, token } = require("./auth.json");
const fs = require("fs");
const bot = new Discord.Client();

bot.login(token);

bot.on("ready", async () => {
	console.log(`${bot.user.username} is online!`);
});

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

	if (oldUserChannel === undefined && newUserChannel !== undefined) {
		newMember
			.setNickname(`${textArray[random]}` + " Nugget")
			.then(console.log)
			.catch(console.error);
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

const valorantStatKeeper = (message, messageArray) => {
	let valorantObject = getJsonData("./valorant-stats.json");
	let firstArg = messageArray[0];
	let newTime = messageArray[1];
	// Check argument in messArray to see if it is either "stats" or a gun name. These 
	// Are the only two commands right now.	

	if (firstArg.toLowerCase() == "stats") {
		const msg = jsonToEmbed(valorantObject);
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

// Sorting function that will put the fastest times on top/start
const sortTimes = (entries) => {
	entries.sort((a, b) => { return parseInt(a.time, 10) - parseInt(b.time, 10) });
}

// Converts the valorant-stats.json into a nice embed display 
// (returns an discord embed object)
const jsonToEmbed = (jsonObject) => {

	let botembed = new Discord.RichEmbed()
		.setColor("#15f153");

	// An array representation of valorant stats data
	const arrayRep = [];

	for (const gun in jsonObject) {
		const gunEntry = [];
		//Only bother copying the array if it won't be empty
		if (jsonObject[gun].length != 0) {
			//Since we are in an for/in loop, this pushes the actual gun string
			gunEntry.push(gun);
			for (const entry of jsonObject[gun]) {
				gunEntry.push(entry);
			}
			arrayRep.push(gunEntry);
		}
	}

	// Sort Array Representation of stats by number of entries
	arrayRep.sort((a, b) => { return b.length - a.length });
	// NewArray stores the 
	const newArray = [];
	for (const gun of arrayRep) {
		let gunEntryListPair = { gun: "", entries: "" };
		gunEntryListPair.gun = gun[0];
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


		gunEntryListPair.entries = entriesStringList;

		console.log("gunEntryListPair", gunEntryListPair);
		newArray.push(gunEntryListPair);
	}

	console.log("newArray", newArray);

	for (const array of newArray) {
		// botembed.addField(gun[0], "```" + gun.slice(1) + "```", true);
		botembed.addField(array.gun, array.entries, true);
	}
	return botembed;

}

const padString = (string, padWidth) => {

	let paddedString = string;
	while (paddedString.length < padWidth) {
		paddedString += " ";
	}
	return paddedString;
}