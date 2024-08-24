const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gif')
		.setDescription('Send a GIF from Tenor!')
        .addStringOption(option => option.setName('searchterm').setDescription('Search for a relevant GIF!').setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();

        const { options } = interaction;
        if (!interaction.inGuild()) {
            interaction.editReply('This command cannot be used in direct messages!');
            return;
        }

        const link = 'https://tenor.googleapis.com/v2/search?q=' + options.getString('searchterm') + '&key=' + process.env.TENORKEY + '&limit=10';
        const response = await fetch(link);
        let data = await response.json();

        let r = Math.floor(10 * Math.random());

        await interaction.editReply(data.results[r].url);
	},
};