const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');
const sp = '%20'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('matchhistory')
		.setDescription("See the past five matches in a player's history!")
        .addStringOption(option => option.setName('name').setDescription('Summoner to search for!').setRequired(true))
        .addStringOption(option => option.setName('tagline').setDescription('Tagline of the Summoner to search for!').setRequired(true))
        .addStringOption(option => option.setName('queue').setDescription('Queue type of the matches!').setRequired(true).addChoices(
            {name: 'Ranked Solo', value: '420'},
            {name: 'Ranked Flex', value: '440'},
            {name: 'ARAM', value: '450'},
        )),
	async execute(interaction) {
        await interaction.deferReply();
        const { options } = interaction;
        let name = options.getString('name');
        let tag = options.getString('tagline');
        let queue = options.getString('queue');
        while (name.includes(' ')) {
            let space = name.indexOf(' ');
            name = name.substring(0, space) + sp + name.substring(space + 1);
        }
        const link1 = 'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/' + name + '/' + tag + '?' + process.env.RIOTKEY;
        const response1 = await fetch(link1);
        let puuidData = await response1.json();

        if (puuidData.status != undefined) {
            interaction.editReply('A summoner with that name and tagline could not be found!');
            return; 
        }

        const link2 = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuidData.puuid + '/ids?queue=' + queue + '&start=0&count=5&' + process.env.RIOTKEY;
        const response2 = await fetch(link2);
        let matchIDs = await response2.json();

        if (matchIDs.length == 0) {
            interaction.editReply('This summoner has no recent games of this queue type!');
            return;
        }

        if (queue == "420") {
            queue = "Ranked Solo 5v5"
        }
        else if (queue == "440") {
            queue = "Ranked Flex 5v5";
        }
        else {
            queue = "ARAM 5v5";
        }

        let embedsList = [];
        for (let i = 0; i < matchIDs.length; i++) {
            embedsList.push(await matchEmbed(matchIDs[i],queue,puuidData));
        }
        await interaction.editReply({ embeds: embedsList });
	},
};

async function matchEmbed(id,queue,puuidData) {
    let link = 'https://americas.api.riotgames.com/lol/match/v5/matches/' + id + '?' + process.env.RIOTKEY;
    let response = await fetch(link);
    let data = await response.json();

    const puuidList = data.metadata.participants;
    const participantList = data.info.participants;

    let playerIndex;
    for (let i = 0; i < puuidList.length; i++) {
        if (puuidList[i] == puuidData.puuid) {
            playerIndex = i;
        }
    }
    let myEmbed = new EmbedBuilder();
    myEmbed.setThumbnail('https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/img/champion/' + participantList[playerIndex].championName + '.png');

    if (data.info.endOfGameResult != "GameComplete") {
        myEmbed.setTitle("REMAKE");
        myEmbed.setColor(0xFCCA00);
        myEmbed.setDescription("hello");
        return myEmbed;
    }

    if (participantList[playerIndex].win) {
        myEmbed.setTitle("VICTORY");
        myEmbed.setColor(0x00affa);
    }
    else {
        myEmbed.setTitle("DEFEAT");
        myEmbed.setColor(0xfa0000);
    }

    myEmbed.setDescription(queue + '\n' + Math.trunc(data.info.gameDuration / 60) + ' minutes ' + (data.info.gameDuration % 60) + ' seconds\n​');

    let blue = ' ';
    let red = ' ';
    for (let i = 0; i < puuidList.length; i++) {
        if (participantList[i].teamId == 100) {
            if (playerIndex == i) {
                blue += '__***' + participantList[i].riotIdGameName + "***__\n`" + participantList[i].championName + ": " 
                + participantList[i].kills + '/' + participantList[i].deaths + '/' + participantList[i].assists + "`\n";
            }
            else {
                blue += participantList[i].riotIdGameName + "\n`" + participantList[i].championName + ": " 
                + participantList[i].kills + '/' + participantList[i].deaths + '/' + participantList[i].assists + "`\n";
            }
        }
        else if (participantList[i].teamId == 200) {
            if (playerIndex == i) {
                red += '__***' + participantList[i].riotIdGameName + "***__\n`" + participantList[i].championName + ": " 
                + participantList[i].kills + '/' + participantList[i].deaths + '/' + participantList[i].assists + "`\n";
            }
            else {
                red += participantList[i].riotIdGameName + "\n`" + participantList[i].championName + ": " 
                + participantList[i].kills + '/' + participantList[i].deaths + '/' + participantList[i].assists + "`\n";
            }
        }
    }
    
    if (participantList[playerIndex].teamId == 100) {
        myEmbed.addFields( { name: '__BLUE TEAM:__', value: blue, inline: true} );
        myEmbed.addFields( { name: 'RED TEAM:', value: red, inline: true} );
    }
    else {
        myEmbed.addFields( { name: 'BLUE TEAM:', value: blue, inline: true} );
        myEmbed.addFields( { name: '__RED TEAM:__', value: red, inline: true} );
    }

    return myEmbed;
}