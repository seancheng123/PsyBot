const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping pong!'),
	async execute(interaction) {
        await interaction.reply('Pong!\n' + (Date.now() - interaction.createdTimestamp) + 'ms');
	},
}; 