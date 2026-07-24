require("dotenv").config();

const fs = require("fs");

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.TOKEN;

console.log("TOKEN EXISTS:", !!TOKEN);

const CLIENT_ID = "1528526031130984548";
const GUILD_ID = "735222808526717099";

const SLOT_CHANNEL_ID = "1352528395312955463";
const MANAGER_ROLE_ID = "1474809152579698730";

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const PANELS_FILE = "./panels.json";

let panels = new Map();function savePanels() {
    const data = {};

    for (const [messageId, panel] of panels) {
        data[messageId] = panel;
    }

    fs.writeFileSync(PANELS_FILE, JSON.stringify(data, null, 2));
}

function loadPanels() {
    if (!fs.existsSync(PANELS_FILE)) return;

    const data = JSON.parse(fs.readFileSync(PANELS_FILE));

    panels = new Map(Object.entries(data));
}

loadPanels();

function getActivePanel(panels) {
    for (const messageId in panels) {
        if (panels[messageId].active) {
            return {
                messageId,
                panel: panels[messageId]
            };
        }
    }

    return null;
}

 function createEmbed(slotCount, slots) {

    const description = [];

    for (let i = 1; i <= slotCount; i++) {

        if (slots[i]) {
            description.push(`**${i}.** <@${slots[i]}>`);
        } else {
            description.push(`**${i}.** —`);
        }

    }

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🎯 Event Slots")
        .setDescription(description.join("\n"))
        .setFooter({
            text: "VZP Manager"
        });

}

function createButtons(slotCount) {

    const rows = [];

    let row = new ActionRowBuilder();

    for (let i = 1; i <= slotCount; i++) {

        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`slot_${i}`)
                .setLabel(String(i))
                .setStyle(ButtonStyle.Primary)
        );

        if (row.components.length === 5 || i === slotCount) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
    }

    // Leave Slot button
    const leaveRow = new ActionRowBuilder();

    leaveRow.addComponents(
        new ButtonBuilder()
            .setCustomId("leave_slot")
            .setLabel("Leave Slot")
            .setEmoji("🚪")
            .setStyle(ButtonStyle.Danger)
    );

    rows.push(leaveRow);

    return rows;
}

const commands = [
    new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Create a slot panel")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Number of slots (5-50)")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("event")
        .setDescription("Send an event announcement")
        .addStringOption(option =>
            option.setName("event").setDescription("Event name").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("start").setDescription("Start time").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("format").setDescription("Format").setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role1").setDescription("First role").setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role2").setDescription("Second role").setRequired(false)
        )
        .addRoleOption(option =>
            option.setName("role3").setDescription("Third role").setRequired(false)
        )
].map(command => command.toJSON());
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("✅ Slash commands registered.");
    } catch (err) {
        console.error(err);
    }
})();
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
}); 

client.on("interactionCreate", async (interaction) => {

    try {

        if (!interaction.isChatInputCommand() && !interaction.isButton()) {
            return;
        }

        if (interaction.member && !interaction.member.roles.cache.has(MANAGER_ROLE_ID) && interaction.isChatInputCommand()) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command.",
                ephemeral: true
            });
        }

        if (interaction.isChatInputCommand()) {

            switch (interaction.commandName) {

                case "slots": {

                    const amount = interaction.options.getInteger("amount");

                    if (amount < 5 || amount > 50) {
                        return interaction.reply({
                            content: "❌ Slot amount must be between 5 and 50.",
                            ephemeral: true
                        });
                    }

                    const old = getActivePanel(panels);

                    if (old) {
                        old.panel.active = false;
                    }

                    const panel = {
                        slotCount: amount,
                        slots: {},
                        active: true,
                        locked: false
                    };

                    const channel = await client.channels.fetch(SLOT_CHANNEL_ID);

                    const message = await channel.send({
    embeds: [createEmbed(panel.slotCount, panel.slots)],
    components: createButtons(panel.slotCount)
});

                    panels[message.id] = panel;

                    savePanels(panels);

                    return interaction.reply({
                        content: "✅ Slot panel created.",
                        ephemeral: true
                    });

                }
                                case "close": {

                    const active = getActivePanel(panels);

                    if (!active) {
                        return interaction.reply({
                            content: "❌ No active panel.",
                            ephemeral: true
                        });
                    }

                    active.panel.active = false;

                    const message = await interaction.channel.messages.fetch(active.messageId);

                    await message.edit({
    embeds: [createEmbed(
        active.panel.slotCount,
        active.panel.slots
    )],
    components: createButtons(
        active.panel.slotCount
    )
});

                    savePanels(panels);

                    return interaction.reply({
                        content: "✅ Panel closed.",
                        ephemeral: true
                    });

                }   

                case "reset": {

                    const active = getActivePanel(panels);

                    if (!active) {
                        return interaction.reply({
                            content: "❌ No active panel.",
                            ephemeral: true
                        });
                    }

                    active.panel.slots = {};

                    const message = await interaction.channel.messages.fetch(active.messageId);

await message.edit({
    embeds: [
        createEmbed(
            active.panel.slotCount,
            active.panel.slots
        )
    ],
    components: createButtons(
        active.panel.slotCount
    )
});

savePanels(panels);

                    return interaction.reply({
                        content: "✅ Slots reset.",
                        ephemeral: true
                    });

                }

                case "lock": {

                    const active = getActivePanel(panels);

                    if (!active) {
                        return interaction.reply({
                            content: "❌ No active panel.",
                            ephemeral: true
                        });
                    }

                    active.panel.locked = true;

                    const message = await interaction.channel.messages.fetch(active.messageId);

await message.edit({
    embeds: [
        createEmbed(
            active.panel.slotCount,
            active.panel.slots
        )
    ],
    components: createButtons(
        active.panel.slotCount
    )
});

savePanels(panels);

                    return interaction.reply({
                        content: "🔒 Panel locked.",
                        ephemeral: true
                    });

                }

                case "unlock": {

                    const active = getActivePanel(panels);

                    if (!active) {
                        return interaction.reply({
                            content: "❌ No active panel.",
                            ephemeral: true
                        });
                    }

                    active.panel.locked = false;

                    const message = await interaction.channel.messages.fetch(active.messageId);

await message.edit({
    embeds: [
        createEmbed(
            active.panel.slotCount,
            active.panel.slots
        )
    ],
    components: createButtons(
        active.panel.slotCount
    )
});

savePanels(panels);

                      }
            }
        }

        if (interaction.isButton()) {

    const customId = interaction.customId;

    const active = getActivePanel(panels);

    if (!active) {
        return interaction.reply({
            content: "❌ There is no active slot panel.",
            ephemeral: true
        });
    }

    const panel = active.panel;

    // =========================
    // LEAVE SLOT BUTTON
    // =========================

    if (customId === "leave_slot") {

        if (!panel.active) {
            return interaction.reply({
                content: "❌ This panel is closed.",
                ephemeral: true
            });
        }

        if (panel.locked) {
            return interaction.reply({
                content: "🔒 This panel is locked.",
                ephemeral: true
            });
        }

        let userSlot = null;

        for (const existingSlot in panel.slots) {

            if (panel.slots[existingSlot] === interaction.user.id) {
                userSlot = existingSlot;
                break;
            }

        }

        if (!userSlot) {
            return interaction.reply({
                content: "❌ You don't have a slot.",
                ephemeral: true
            });
        }

        delete panel.slots[userSlot];

        savePanels(panels);

        const message = await interaction.channel.messages.fetch(
            active.messageId
        );

        await message.edit({
            embeds: [
                createEmbed(
                    panel.slotCount,
                    panel.slots
                )
            ],
            components: createButtons(
                panel.slotCount
            )
        });

        return interaction.reply({
            content: `✅ You left slot **${userSlot}**.`,
            ephemeral: true
        });
    }

    // =========================
    // SLOT BUTTONS
    // =========================

    if (!customId.startsWith("slot_")) {
        return;
    }

    const slot = Number(customId.split("_")[1]);

    if (!panel.active) {
        return interaction.reply({
            content: "❌ This panel is closed.",
            ephemeral: true
        });
    }

    if (panel.locked) {
        return interaction.reply({
            content: "🔒 This panel is locked.",
            ephemeral: true
        });
    }

    if (panel.slots[slot]) {
        return interaction.reply({
            content: "❌ This slot is already taken.",
            ephemeral: true
        });
    }

    // If user already has another slot, remove it
    for (const existingSlot in panel.slots) {

        if (
            panel.slots[existingSlot] === interaction.user.id &&
            Number(existingSlot) !== slot
        ) {
            delete panel.slots[existingSlot];
            break;
        }

    }

    // Give user the new slot
    panel.slots[slot] = interaction.user.id;

    savePanels(panels);

    const message = await interaction.channel.messages.fetch(
        active.messageId
    );

    await message.edit({
        embeds: [
            createEmbed(
                panel.slotCount,
                panel.slots
            )
        ],
        components: createButtons(
            panel.slotCount
        )
    });

    return interaction.reply({
        content: `✅ You successfully picked slot **${slot}**.`,
        ephemeral: true
    });
}

    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);