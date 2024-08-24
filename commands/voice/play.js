const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const player = createAudioPlayer();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play youtube video in the voice channel you\'re currently in!')
        .addStringOption(option => option.setName('youtubelink').setDescription('Enter a youtube link!').setRequired(true)),
	async execute(interaction) {
        // Disabled
        interaction.reply('Command currently disabled!');
        return;

        if (!interaction.inGuild()) {
            interaction.reply('This command cannot be used in direct messages!');
            return;
        }
        
        const channel = interaction.channel;
        const { options } = interaction;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            interaction.reply('You need to be in a voice channel!');
            return;
        }

        if (!ytdl.validateURL(options.getString('youtubelink'))) {
            await interaction.reply('Error playing your music (Bad link?)');
            return;
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const stream = ytdl(options.getString('youtubelink'), { filter: 'audioonly' });
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true,
        });

        player.play(resource);
        connection.subscribe(player);

        await interaction.reply('Music is playing!');
	},
};

