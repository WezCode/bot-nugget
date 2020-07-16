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
		message.channel.send(displayStats(valorantObject));
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