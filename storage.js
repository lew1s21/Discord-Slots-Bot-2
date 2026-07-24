const fs = require("fs");
const { PANELS_FILE } = require("./config");

function loadPanels() {
    if (!fs.existsSync(PANELS_FILE)) {
        return {};
    }

    try {
        const data = fs.readFileSync(PANELS_FILE, "utf8");

        if (!data.trim()) {
            return {};
        }

        return JSON.parse(data);
    } catch (err) {
        console.error("Failed to load panels:", err);
        return {};
    }
}

function savePanels(panels) {
    try {
        fs.writeFileSync(
            PANELS_FILE,
            JSON.stringify(panels, null, 4)
        );
    } catch (err) {
        console.error("Failed to save panels:", err);
    }
}

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

module.exports = {
    loadPanels,
    savePanels,
    getActivePanel
};