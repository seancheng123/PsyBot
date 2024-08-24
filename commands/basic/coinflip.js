const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Flip a coin!'),
	async execute(interaction) {
        await interaction.reply('(╯°□°）╯︵ :coin:');
        const num = Math.random();
        let result;
        if (num < 0.5) {
            result = 'Heads!';
        }
        else {
            result = 'Tails!';
        }
        setTimeout( () => {
            interaction.editReply(result);
        }, 2000);
	},
};