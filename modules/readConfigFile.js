const fs = require("fs");
function readConfigFile() {
    try {
        const configFileContent = fs.readFileSync(
            "./modules/configParms.json",
            "utf8"
        );
        const configParams = JSON.parse(configFileContent);
        return configParams;
    } catch (error) {
        console.error(
            "Błąd podczas odczytu pliku konfiguracyjnego:",
            error.message
        );
        return null;
    }
}

module.exports = { readConfigFile };
// Compare this snippet from modules/discordmsg.js:
