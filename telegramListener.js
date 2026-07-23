const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

module.exports = async function startTelegram(client) {

    const telegram = new TelegramClient(
        new StringSession(process.env.TELEGRAM_SESSION),
        Number(process.env.API_ID),
        process.env.API_HASH,
        {
            connectionRetries: 5
        }
    );

    await telegram.connect();

    console.log("✅ Telegram connected.");

    telegram.addEventHandler(async (event) => {

        const message = event.message.message;

        console.log("Telegram:", message);

    }, new NewMessage({}));

};