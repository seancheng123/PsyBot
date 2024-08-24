const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');
const sp = '%20'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ingame')
		.setDescription('Check to see if a summoner is in game!')
        .addStringOption(option => option.setName('name').setDescription('Summoner to search for!').setRequired(true))
        .addStringOption(option => option.setName('tagline').setDescription('Tagline of the Summoner to search for!').setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        const { options } = interaction;
        let name = options.getString('name');
        let tag = options.getString('tagline');
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

        const link2 = 'https://na1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/' + puuidData.puuid + '?' + process.env.RIOTKEY;
        const response2 = await fetch(link2);
        let matchData = await response2.json();

        if (matchData.status != undefined) {
            interaction.editReply('The summoner is not currently in game!');
            return;
        }

        const link3 = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/' + puuidData.puuid + '?' + process.env.RIOTKEY;
        const response3 = await fetch(link3);
        let summonerData = await response3.json()

        const link4 = 'https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/data/en_US/champion.json'
        const response4 = await fetch(link4);
        let championData = await response4.json();

        let gamemode;
        if (matchData.gameMode === 'CLASSIC') {
            gamemode = 'Summoner\'s Rift';
        }
        else {
            gamemode = matchData.gameMode;
        }

        const myEmbed = new EmbedBuilder()
            .setColor(0xFCCA00)
            .setTitle(puuidData.gameName)
            .setDescription('Game Mode: ' + gamemode + '\nTime Elapsed: ' 
            + Math.trunc(matchData.gameLength / 60) + ' minutes ' + (matchData.gameLength % 60) + ' seconds\n​')
            .setThumbnail('https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/img/profileicon/' + summonerData.profileIconId + '.png')
            .setTimestamp();
        
        let blue = ' ';
        let red = ' ';
        let champion;
        let teamToggle;
        for (let i = 0; i < matchData.participants.length; i++) {
            if (matchData.participants[i].summonerId == summonerData.id) {
                champion = '' + matchData.participants[i].championId;
                if (matchData.participants[i].teamId == 100) {
                    teamToggle = true;
                }
                else {
                    teamToggle = false;
                }
            }

            if (matchData.participants[i].teamId == 100) {
                if (matchData.participants[i].summonerId == summonerData.id) {
                    blue += '__***' + await getName(matchData.participants[i].puuid) + '***__\n`' + await getChamp(matchData.participants[i].championId, championData) + '`\n\n';
                }
                else {
                    blue += await getName(matchData.participants[i].puuid) + '\n`' + await getChamp(matchData.participants[i].championId, championData) + '`\n\n';
                }
            }
            else if (matchData.participants[i].teamId == 200) {
                if (matchData.participants[i].summonerId == summonerData.id) {
                    red += '__***' + await getName(matchData.participants[i].puuid) + '***__\n`' + await getChamp(matchData.participants[i].championId, championData) + '`\n\n';
                }
                else {
                    red += await getName(matchData.participants[i].puuid) + '\n`' + await getChamp(matchData.participants[i].championId, championData) + '`\n\n';
                }            
            }
        }

        if (teamToggle) {
            myEmbed.addFields( { name: '__BLUE TEAM:__', value: blue, inline: true} );
            myEmbed.addFields( { name: 'RED TEAM:', value: red, inline: true} );
        }
        else {
            myEmbed.addFields( { name: 'BLUE TEAM:', value: blue, inline: true} );
            myEmbed.addFields( { name: '__RED TEAM:__', value: red, inline: true} );
        }

        myEmbed.setImage('http://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + await getChamp(champion, championData) + '_0.jpg')

        await interaction.editReply({ embeds: [myEmbed] });
	},
};

async function getName(id) {
    let link = 'https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/' + id + '?' + process.env.RIOTKEY;
    let response = await fetch(link);
    let data = await response.json();
    return data.gameName;
}

async function getChamp(key, champData) {
    for (var champion in champData.data) {
        if (champData.data[champion]['key'] == key) {
            return champion;
        }
    }
    return 'error';
}