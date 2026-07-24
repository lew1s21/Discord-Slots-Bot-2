const { EmbedBuilder } = require("discord.js");
const { COLORS, FOOTER } = require("../config");

function createEmbed(slotCount, slots) {
    let text = "";

    for (let i = 1; i <= slotCount; i++) {
        if (slots[i]) {
            text += `${i}. <@${slots[i]}>\n`;
        } else {
            text += `${i}.\n`;
        }
    }

    return new EmbedBuilder()
        .setTitle("🎯 Choose your position!")
        .setDescription(
    text.trim().length > 0
        ? text
        : "No slots available."
)
        .setColor(COLORS.primary)
        .setFooter({
            text: FOOTER
        });
}

module.exports = createEmbed;