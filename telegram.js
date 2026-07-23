const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 35051149;
const apiHash = "47c5e36fb759c1eb2fa3b182e102900b";

const stringSession = new StringSession("");

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Phone Number: "),
        password: async () => await input.text("2FA Password (if any): "),
        phoneCode: async () => await input.text("Code from Telegram: "),
        onError: (err) => console.log(err),
    });

    console.log("Logged in!");
    console.log("SESSION:");
    console.log(client.session.save());

    process.exit();
})();