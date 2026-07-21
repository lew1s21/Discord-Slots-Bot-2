const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function createButtons(slotCount) {

    const rows = [];

    for (let i = 1; i <= slotCount; i += 5) {

        const row = new ActionRowBuilder();

        for (let j = i; j < i + 5 && j <= slotCount; j++) {

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`slot_${j}`)
                    .setLabel(`${j}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        rows.push(row);
    }

    return rows;
}

module.exports = createButtons;