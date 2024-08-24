const { Client, IntentsBitField, Partials, Events, Collection, } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('node:fs');
const fetch = require('node-fetch');
const path = require('node:path');
let previousChannel = '';
let previousUser = '';
let sendUser = '363407297961000987';

let mysql = require('mysql');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageTyping,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildWebhooks,
    ],
    partials: [Partials.Channel,]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on('ready', (c) => {
    const { ActivityType } = require('discord.js');
    client.user.setActivity('/help', { type: ActivityType.Watching });
    console.log(`${c.user.username} is ready!`);
    try {
        readRiotData();
    }
    catch (err) {
        client.channels.cache.get('782336250933542983').send('Data read failure!');
        setTimeout(readRiotData,600000);
    }
})

client.on('guildMemberRemove', (member) => {
    client.channels.cache.get('765585874120867910').send('** **\n**__UPDATE__**: ' + member.user.username + ' ' + member.user.id + ' '
    + 'has left the server: ' + member.guild.name + ' ' + member.guild.id + '\n** **');
})

client.on('guildMemberAdd', (member) => {
    client.channels.cache.get('765585874120867910').send('** **\n**__UPDATE__**: ' + member.user.username + ' ' + member.user.id + ' '
    + 'has joined the server: ' + member.guild.name + ' ' + member.guild.id + '\n** **');
})

client.on('messageReactionAdd', (messageReaction, user) => {
    if (user.id == '363407297961000987') {
        messageReaction.message.react(messageReaction.emoji);
    }
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.inGuild()) {
        if (previousChannel == message.channel.id && previousUser == message.author.id) {
            ;
        }
        else if (previousChannel == message.channel.id) {
            client.channels.cache.get('765585874120867910').send('**__USER__**: ' + message.author.username + ' ' + message.author.id);
        }
        else {
            client.channels.cache.get('765585874120867910').send('** **\n**__SERVER__**: ' + message.guild.name + ' ' + message.guild.id 
            + '\n**__CHANNEL__**: ' + message.channel.name + ' ' + message.channel.id
            + '\n**__USER__**: ' + message.author.username + ' ' + message.author.id);
        }
        /*
        if (message.mentions.has(client.users.cache.get('762728247900241921'))) {
            message.reply('https://tenor.com/view/psyduck-gif-25376750');
        }
        */
        if (message.content != '') {
            client.channels.cache.get('765585874120867910').send(message.content);
            if (message.author.id == '363407297961000987' && message.content.includes('psy send')) {
                client.users.send(message.content.substring(8,27), message.content.substring(28));
            }
        }
        if (message.attachments.size > 0) {
            for(let i = 0; i < message.attachments.size; i++) {
                client.channels.cache.get('765585874120867910').send(message.attachments.at(i).url);
            }
        }
        previousChannel = message.channel.id;
        previousUser = message.author.id;
    }
    else {
        if (message.author.id == '363407297961000987') {
            if (message.content != '' && message.content.includes('psy set')) {
                sendUser = message.content.substring(8)
                let searchUser 
                try {
                    searchUser = await client.users.fetch(sendUser)
                } catch (err) {
                    client.users.send('363407297961000987', 'User not found!');
                    return;
                }
                client.users.send('363407297961000987', 'Current recipient has been set to: ' + searchUser.username);
            }
            else {
                if (message.content != '') {
                    client.users.send(sendUser, message.content);
                }
                if (message.attachments.size > 0) {
                    for (let i = 0; i < message.attachments.size; i++) {
                        client.users.send(sendUser, message.attachments.at(i).url);
                    }
                }
            }
        }
        else {
            client.users.send('363407297961000987', '** **\n**__USER__**: ' + message.author.username + ' ' + message.author.id);
            if (message.content != '') {
                client.users.send('363407297961000987', message.content);
            }
            if (message.attachments.size > 0) {
                for (let i = 0; i < message.attachments.size; i++) {
                    client.users.send('363407297961000987', message.attachments.at(i).url);
                }
            }
        }
        
        /*
        let link = 'https://tenor.googleapis.com/v2/search?q=psyduck&key=' + process.env.TENORKEY + '&limit=50';
        let response = await fetch(link);
        let data = await response.json();

        let r = Math.floor(50 * Math.random());
        message.channel.send(data.results[r].url);
        */
    }  
})

async function readRiotData() {

    let con = mysql.createConnection({
        host: "db-buf-03",
        user: "u103566_bBElQggw8v",
        password: "ZDcGqiH9bjFI@LoRToG6@2bc",
        database: "s103566_Champion_Runes"
    });

    let link1 = 'https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?' + process.env.RIOTKEY;
    let response1 = await fetch(link1);
    let chalPlayers = await response1.json();
    link1 = 'https://na1.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5?' + process.env.RIOTKEY;
    response1 = await fetch(link1);
    let gmPlayers = await response1.json();
    let players = chalPlayers.entries.concat(gmPlayers.entries);
    const randNums = [];

    for (i = 0; i < 10; i++) {
        randNums.push(Math.floor(Math.random() * players.length));
    }

    for (i = 0; i < randNums.length; i++) {
        let link2 = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/' + players[randNums[i]].summonerId + '?' + process.env.RIOTKEY;
        let response2 = await fetch(link2);
        let puuidInfo = await response2.json();

        let link3 = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuidInfo.puuid + '/ids?queue=420&start=0&count=1&' + process.env.RIOTKEY;
        let response3 = await fetch(link3);
        let matchIds = await response3.json();

        for (j = 0; j < matchIds.length; j++) {
            con.query("INSERT INTO TempMatchIDs SELECT '" + matchIds[j] + "' FROM DUAL WHERE NOT EXISTS (SELECT * FROM MatchIDs WHERE ID = '" + matchIds[j] + "' UNION SELECT * FROM TempMatchIDs WHERE ID = '" + matchIds[j] + "')", function (error, results, fields) {
                if (error) throw err;
            })
        }
    }
        
    con.query("SELECT * FROM TempMatchIDs", async function (error, results, fields) {
        if (error) throw err;
        let con2 = mysql.createConnection({
            host: "db-buf-03",
            user: "u103566_bBElQggw8v",
            password: "ZDcGqiH9bjFI@LoRToG6@2bc",
            database: "s103566_Champion_Runes"
        });

        for (i = 0; i < results.length; i++) {
            let link4 = 'https://americas.api.riotgames.com/lol/match/v5/matches/' + results[i].ID + '?' + process.env.RIOTKEY;
            let response4 = await fetch(link4);
            let matchInfo = await response4.json();
            if (matchInfo.info == undefined) {
                continue;
            }
            let champs = matchInfo.info.participants;

            for (j = 0; j < champs.length; j++) {
                if (champs[j].perks.styles[1].selections[0].perk < champs[j].perks.styles[1].selections[1].perk) {
                    con2.query("INSERT INTO RuneData VALUES (" 
                    + champs[j].championId + "," 
                    + champs[j].perks.styles[0].selections[0].perk + ","
                    + champs[j].perks.styles[0].selections[1].perk + ","
                    + champs[j].perks.styles[0].selections[2].perk + ","
                    + champs[j].perks.styles[0].selections[3].perk + ","
                    + champs[j].perks.styles[1].selections[0].perk + ","
                    + champs[j].perks.styles[1].selections[1].perk + ")", function (error, results, fields) {
                        if (error) throw err;
                    })
                }
                else {
                    con2.query("INSERT INTO RuneData VALUES (" 
                    + champs[j].championId + "," 
                    + champs[j].perks.styles[0].selections[0].perk + ","
                    + champs[j].perks.styles[0].selections[1].perk + ","
                    + champs[j].perks.styles[0].selections[2].perk + ","
                    + champs[j].perks.styles[0].selections[3].perk + ","
                    + champs[j].perks.styles[1].selections[1].perk + ","
                    + champs[j].perks.styles[1].selections[0].perk + ")", function (error, results, fields) {
                        if (error) throw err;
                    })
                }

                for (k = 0; k < champs[j].challenges.legendaryItemUsed.length; k++) {
                    con2.query("INSERT INTO ItemData VALUES (" + champs[j].championId + " , " + champs[j].challenges.legendaryItemUsed[k] + ")", function (error, results, fields) {
                        if (error) throw err;
                    })
                }
            }
        }

        con2.end();
    })

    con.query("INSERT INTO MatchIDs SELECT * FROM TempMatchIDs", function (error, results, fields) {
        if (error) throw err;
    })

    con.query("DELETE FROM TempMatchIDs", function (error, results, fields) {
        if (error) throw err;
    })
    
    con.end()
    setTimeout(readRiotData,600000);
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
    try {
        await command.execute(interaction);
    }
    catch (err) {
        interaction.reply('Something went wrong...');
    }
});

client.login(process.env.TOKEN);