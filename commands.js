const {
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const {
    TOKEN,
    CLIENT_ID,
    GUILD_ID
} = require("./config");

async function registerCommands() {

    const commands = [

        new SlashCommandBuilder()
            .setName("slots")
            .setDescription("Create a slot panel")
            .addIntegerOption(option =>
                option
                    .setName("amount")
                    .setDescription("Number of slots")
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName("close")
            .setDescription("Close the active slot panel"),

        new SlashCommandBuilder()
            .setName("reset")
            .setDescription("Reset every slot"),

        new SlashCommandBuilder()
            .setName("lock")
            .setDescription("Lock slot selection"),

        new SlashCommandBuilder()
            .setName("unlock")
            .setDescription("Unlock slot selection"),

        new SlashCommandBuilder()
            .setName("event")
            .setDescription("Send an event announcement")
            .addStringOption(option =>
                option
                    .setName("event")
                    .setDescription("Event name")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("format")
                    .setDescription("Format")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("start")
                    .setDescription("Start time")
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName("role1")
                    .setDescription("Role")
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName("role2")
                    .setDescription("Optional role")
            )
            .addRoleOption(option =>
                option
                    .setName("role3")
                    .setDescription("Optional role")
            )

    ].map(command => command.toJSON());

    const rest = new REST({
        version: "10"
    }).setToken(TOKEN);

    await rest.put(
        Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
        ),
        {
            body: commands
        }
    );

    console.log("✅ Slash commands registered.");

}

module.exports = registerCommands;