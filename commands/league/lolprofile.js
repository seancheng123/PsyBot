const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');
const sp = '%20'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lolprofile')
		.setDescription('Display a League of Legends profile!')
        .addStringOption(option => option.setName('name').setDescription('Summoner to search for!').setRequired(true))
        .addStringOption(option => option.setName('tagline').setDescription('Tagline of the Summoner to search for!').setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        const { options } = interaction;
        let name = options.getString('name');
        let tag = options.getString('tagline')
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

        const link2 = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/' + puuidData.puuid + '?' + process.env.RIOTKEY;
        const response2 = await fetch(link2);
        let summonerData = await response2.json()

        const link3 = 'https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summonerData.id + '?' + process.env.RIOTKEY;
        const response3 = await fetch(link3);
        let rankedData = await response3.json();

        const link4 = 'https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/' + puuidData.puuid + '?' + process.env.RIOTKEY;
        const response4 = await fetch(link4);
        let masteryData = await response4.json();

        const link5 = 'https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/data/en_US/champion.json'
        const response5 = await fetch(link5);
        let championData = await response5.json();

        const myEmbed = new EmbedBuilder()
            .setColor(0xFCCA00)
            .setTitle(puuidData.gameName)
            .setDescription('Level ' + summonerData.summonerLevel + '\n​')
            .setThumbnail('https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/img/profileicon/' + summonerData.profileIconId + '.png')
            .setTimestamp();
        let rs = false;
        let soloInfo;
        let rf = false;
        let flexInfo;
        for (let i = 0; i < rankedData.length; i++) {
            if (rankedData[i].queueType == 'RANKED_SOLO_5x5') {
                rs = true;
                soloInfo = rankedData[i];
            }
            else if (rankedData[i].queueType == 'RANKED_FLEX_SR') {
                rf = true;
                flexInfo = rankedData[i];
            }
        }
        
        if (rs) {
            myEmbed.addFields({ name: 'Ranked Solo: ', value: '' + soloInfo.tier + ' ' + soloInfo.rank + ' '
            + soloInfo.leaguePoints + ' LP\n' + soloInfo.wins + 'W ' + soloInfo.losses + 'L\nWin Rate: ' 
            + Math.round(100 * (soloInfo.wins / (soloInfo.wins + soloInfo.losses))) + '%', inline: true })
        }
        else {
            myEmbed.addFields({ name: 'Ranked Solo:', value: 'unranked', inline: true })
        }

        myEmbed.addFields({ name: '​', value: '​', inline: true })

        if (rf) {
            myEmbed.addFields({ name: 'Ranked Flex:', value: '' + flexInfo.tier + ' ' + flexInfo.rank + ' '
            + flexInfo.leaguePoints + ' LP\n' + flexInfo.wins + 'W ' + flexInfo.losses + 'L\nWin Rate: ' 
            + Math.round(100 * (flexInfo.wins / (flexInfo.wins + flexInfo.losses))) + '%', inline: true })
        }
        else {
            myEmbed.addFields({ name: 'Ranked Flex:', value: 'unranked', inline: true })
        }

        myEmbed.addFields( { name: '​\nTop 5 champions by mastery: ', value: '1. ' 
        + await getChamp(masteryData[0].championId, championData) + ' - ' + masteryData[0].championPoints + ' points\n'
        + '2. ' + await getChamp(masteryData[1].championId, championData) + ' - ' + masteryData[1].championPoints + ' points\n'
        + '3. ' + await getChamp(masteryData[2].championId, championData) + ' - ' + masteryData[2].championPoints + ' points\n'
        + '4. ' + await getChamp(masteryData[3].championId, championData) + ' - ' + masteryData[3].championPoints + ' points\n'
        + '5. ' + await getChamp(masteryData[4].championId, championData) + ' - ' + masteryData[4].championPoints + ' points\n'} )
        myEmbed.setImage('http://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + await getChamp(masteryData[0].championId, championData) + '_0.jpg')
        await interaction.editReply({ embeds: [myEmbed] });
	},
};

async function getChamp(key, champData) {
    for (var champion in champData.data) {
        if (champData.data[champion]['key'] == key) {
            return champion;
        }
    }
    return 'error';
}