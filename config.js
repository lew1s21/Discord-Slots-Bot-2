require("dotenv").config();

module.exports = {
    TOKEN: process.env.DISCORD_TOKEN || process.env.BOT_TOKEN,

    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,

    TELEGRAM: {
        API_ID: Number(process.env.API_ID),
        API_HASH: process.env.API_HASH,
        SESSION: process.env.TELEGRAM_SESSION,
    },

    ALERT_ROLES: [
        process.env.ALERT_ROLE_1,
        process.env.ALERT_ROLE_2,
        process.env.ALERT_ROLE_3,
    ].filter(Boolean),
};