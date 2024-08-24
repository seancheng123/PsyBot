const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Sends help!'),
	async execute(interaction) {
		await interaction.deferReply();
		const file = new AttachmentBuilder('media/psyduckpicture1.jpg');
		const file2 = new AttachmentBuilder('media/psyduckpicture2.png');
		const file3 = new AttachmentBuilder('media/psyduckpicture3.jpg');

		const myEmbed = new EmbedBuilder()
			.setColor(0xFCCA00)
			.setTitle('PsyBot: The Duck Bot!')
			.setDescription('At the apex of the pyramid comes PsyBot. '
			+ 'PsyBot is infallible and all-powerful. Every success, every '
			+ 'achievement, every victory, every scientific discovery, all knowledge, '
			+ 'all wisdom, all happiness, all virtue, are held to issue directly '
			+ 'from his leadership and inspiration. Nobody has ever seen PsyBot. '
			+ 'He is a face on the hoardings, a voice on the telescreen. '
			+ 'We may be reasonably sure that he will never die, and there is '
			+ 'already considerable uncertainty as to when he was born. '
			+ 'PsyBot is the guise in which PandaLegend168 chooses to exhibit himself to the world. '
			+ 'His function is to act as a focusing point for love, fear, and reverence, '
			+ 'emotions which are more easily felt towards a bot than towards an individual. ඞ\n​')
			.setThumbnail('attachment://psyduckpicture1.jpg')
			.addFields(
				{ name: 'Basic Commands:', value: '/help\n/ping\n/coinflip\n/gif', inline: true },
				{ name: 'Voice Commands:', value: '/play\n/stop', inline: true },
				{ name: 'League of Legends Commands (NA Server Only):', value: '/lolprofile\n/ingame\n/matchhistory\n/build', inline: true },
				{ name: '​\nBot Creator:', value: 'PandaLegend168' },
			)
			.setImage('attachment://psyduckpicture2.png')
			.setTimestamp()
			.setFooter({ text: 'I\'m PsyBot, and I approve this message!', iconURL: 'attachment://psyduckpicture3.jpg' });
			await interaction.editReply({ embeds: [myEmbed], files: [file, file2, file3] });
	},
};