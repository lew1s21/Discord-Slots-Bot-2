const startTelegram = require("./telegramListener");
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");
// Load local environment variables from a .env file when present
try {
    require("dotenv").config();
} catch (e) {}

const fs = require("fs");

const ALERT_ROLES = [
    process.env.ALERT_ROLE_1,
    process.env.ALERT_ROLE_2,
    process.env.ALERT_ROLE_3
];
// dotenv is optional in production; ignore if not installed

const TOKEN = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN;

if (!TOKEN) {
    console.error("Missing DISCORD_TOKEN or BOT_TOKEN environment variable. Set it and restart.");
    process.exit(1);
}
// Runtime error handlers to capture unexpected exits
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
process.on('exit', (code) => {
    console.log('Process exiting with code', code);
});
const CLIENT_ID = "1528526031130984548";
const GUILD_ID = "1444281245801381930";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const panels = new Map();

const commands = [

    new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Create a slot panel")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("5-50 slots")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("event")
        .setDescription("Send an event announcement")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addStringOption(option =>
            option
                .setName("event")
                .setDescription("Event name")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("start")
                .setDescription("Start time")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("format")
                .setDescription("Example: 20v20")
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("role1")
                .setDescription("First role")
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("role2")
                .setDescription("Second role")
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName("role3")
                .setDescription("Third role")
                .setRequired(false)
        )

].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("Slash command registered.");
    } catch (err) {
    console.error("REGISTER ERROR:");
console.error(err);
    }
})();

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        await startTelegram(client);
        console.log("✅ Telegram listener started.");
    } catch (err) {
        console.error("Telegram error:", err);
    }
});

function createEmbed(slotCount, slots) {
    let text = "";

    for (let i = 1; i <= slotCount; i++) {
        const userId = slots[i];

        if (userId) {
            text += `${i}. <@${userId}>\n`;
        } else {
            text += `${i}.\n`;
        }
    }

    return new EmbedBuilder()
        .setTitle("🎯 Choose your position!")
        .setDescription(text)
        .setColor(0x5865F2)
        .setFooter({
            text: "Click a slot button to reserve it."
        });
}

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

client.on("interactionCreate", async interaction => {

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === "slots") {

            const amount = interaction.options.getInteger("amount");

            if (amount < 5 || amount > 50) {
                return interaction.reply({
                    content: "❌ Slots must be between 5 and 50.",
                    flags: 64
                });
            }

            const slots = {};

            const embed = createEmbed(amount, slots);
            const rows = createButtons(amount);

            const message = await interaction.reply({
                embeds: [embed],
                components: rows,
                fetchReply: true
            });

            panels.set(message.id, {
    slotCount: amount,
    slots
});
}

if (interaction.commandName === "event") {

    const event = interaction.options.getString("event");
    const start = interaction.options.getString("start");
    const format = interaction.options.getString("format");

    const role1 = interaction.options.getRole("role1");
    const role2 = interaction.options.getRole("role2");
    const role3 = interaction.options.getRole("role3");

    const roles = [role1, role2, role3]
        .filter(role => role)
        .map(role => role.toString())
        .join(" ");

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("📢 EVENT")
        .setDescription(
`🎯 **Event:** ${event}

⚔️ **Format:** ${format}

🕒 **Start:** ${start}`
        )
        .setFooter({
            text: "━━━━━━━━━━━━━━━━━━━━━━\nVZP Manager • GTA RP"
        });

    // Send event in the channel
    await interaction.reply({
        content: roles,
        embeds: [embed]
    });

    // DM everyone with the selected roles
    const guild = interaction.guild;

    await guild.members.fetch();

    const targetRoles = [role1, role2, role3].filter(Boolean);

    let sent = 0;
    let failed = 0;

    for (const member of guild.members.cache.values()) {

        if (member.user.bot) continue;

        const hasRole = targetRoles.some(role =>
            member.roles.cache.has(role.id)
        );

        if (!hasRole) continue;

        try {
            await member.send({
                content: "📢 You have been invited to an event!",
                embeds: [embed]
            });

            sent++;

        } catch {
            failed++;
        }
    }

    await interaction.followUp({
    content: `✅ Sent ${sent} DMs.\n❌ Failed to send ${failed} DMs.`,
    flags: 64
});
}

return;
}

if (interaction.isButton()) {

        const panel = panels.get(interaction.message.id);

        if (!panel) {
            return interaction.reply({
                content: "❌ Panel not found.",
                flags: 64
            });
        }

        const slotNumber = Number(
            interaction.customId.replace("slot_", "")
        );

        const userId = interaction.user.id;

        if (
            panel.slots[slotNumber] &&
            panel.slots[slotNumber] !== userId
        ) {
            return interaction.reply({
                content: "❌ This slot is already taken.",
                flags: 64
            });
        }

        let currentSlot = null;

        for (const [slot, owner] of Object.entries(panel.slots)) {
            if (owner === userId) {
                currentSlot = Number(slot);
                break;
            }
        }

        if (currentSlot === slotNumber) {
            delete panel.slots[currentSlot];
        } else {

            if (currentSlot) {
                delete panel.slots[currentSlot];
            }

            panel.slots[slotNumber] = userId;
        }

        await interaction.update({
            embeds: [
                createEmbed(
                    panel.slotCount,
                    panel.slots
                )
            ],  
            components: createButtons(panel.slotCount)
        });
    }
});

client.login(TOKEN);