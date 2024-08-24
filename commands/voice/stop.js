const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing music and disconnect!'),
	async execute(interaction) {
        //Disabled
        interaction.reply('Command currently disabled!');
        return;

        if (!interaction.inGuild()) {
            interaction.reply('This command cannot be used in direct messages!');
            return;
        }
        const voiceChannel = interaction.member.voice.channel;
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            interaction.reply('Nothing is being played right now!');
            return;
        }
        else if (!voiceChannel) {
            interaction.reply('You need to be in the voice channel!');
            return;
        }
        connection.destroy();
        await interaction.reply('Music has stopped!')
	},
};