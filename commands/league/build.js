const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');
const sp = '%20'
const runeData = require("./runesReforged.json");
let mysql = require('mysql');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('build')
		.setDescription('Get the most popular runes and items in NA challenger/grandmaster for a champion!')
        .addStringOption(option => option.setName('championname').setDescription('Name of the Champion!').setRequired(true)),
	async execute(interaction) {
        let con = mysql.createConnection({
            host: "db-buf-03",
            user: "u103566_bBElQggw8v",
            password: "ZDcGqiH9bjFI@LoRToG6@2bc",
            database: "s103566_Champion_Runes"
        });
        await interaction.deferReply();
        const { options } = interaction;
        const link1 = 'https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/data/en_US/champion.json';
        const response1 = await fetch(link1);
        const champData = await response1.json();

        const link2 = 'https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/data/en_US/item.json';
        const response2 = await fetch(link2);
        const itemData = await response2.json();

        let id = await getChamp(options.getString('championname'),champData);
        if (id === null) {
            interaction.editReply('Invalid Champion Name!');
            return;
        }

        con.query("SELECT *,COUNT(*) OVER (PARTITION BY Main1,Main2,Main3,Main4,Sub1,Sub2) AS Cnt,COUNT(*) OVER (PARTITION BY ChampID) as Total FROM RuneData WHERE ChampID = " + id[0] + " ORDER BY Cnt DESC LIMIT 1", async function (error, results1, fields) {
            if (error) throw error;

            let con2 = mysql.createConnection({
                host: "db-buf-03",
                user: "u103566_bBElQggw8v",
                password: "ZDcGqiH9bjFI@LoRToG6@2bc",
                database: "s103566_Champion_Runes"
            });

            if (results1.length === 0) {
                interaction.editReply('Insufficient Data!');
                return;
            }
            
            con2.query("SELECT *,COUNT(*) AS Cnt FROM ItemData WHERE ChampID = " + id[0] + " GROUP BY Item ORDER BY Cnt DESC LIMIT 6", async function (error, results2, fields) {
                if (error) throw error;
                itemString = "";
                for (i = 0; i < results2.length; i++) {
                    itemString += await getItem(results2[i].Item,itemData) + "\n";
                }
                const myEmbed = new EmbedBuilder()
                .setColor(0xFCCA00)
                .setTitle(id[1])
                .setDescription(results1[0].Total + ' games\n​')
                .setThumbnail('https://ddragon.leagueoflegends.com/cdn/' + process.env.CURRENTLOLPATCH + '/img/champion/' + id[1] + '.png')
                .addFields(
                    { name: 'Most Popular Rune Path:', value: '' + await getRune(results1[0].Main1,runeData) + '\n' + await getRune(results1[0].Main2,runeData) + '\n' + await getRune(results1[0].Main3,runeData) + '\n' + await getRune(results1[0].Main4,runeData) + '\n' + await getRune(results1[0].Sub1,runeData) + '\n' + await getRune(results1[0].Sub2,runeData), inline: true },
                    { name: 'Popular Items:', value: itemString, inline: true },
                );
                
                interaction.editReply({ embeds: [myEmbed]});
            })
            
            con2.end();
            
        })

        con.end();
	},
};

async function getChamp(name,champData) {
    for (var champion in champData.data) {
        if (champion.toUpperCase() === name.toUpperCase()) {
            return [champData.data[champion]['key'],champion]
        }
    }
    return null;
}

async function getRune(key,runeData) {
    for (i = 0; i < runeData.length; i++) {
        for (j = 0; j < runeData[i].slots.length; j++) {
            for (k = 0; k < runeData[i].slots[j].runes.length; k++) {
                if (runeData[i].slots[j].runes[k].id === key) {
                    return runeData[i].slots[j].runes[k].key;
                }  
            }
        }
    }
    return null;
}

async function getItem(key,itemData) {
    for (var id in itemData.data) {
        if (key == id) {
            return itemData.data[id].name;
        }
    }
    return null;
}