# Vinted Discord Bot

![GitHub stars](https://img.shields.io/github/stars/chatlxrdd/vinted-discord-bot?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/chatlxrdd/vinted-discord-bot?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/chatlxrdd/vinted-discord-bot?style=flat-square)
![GitHub license](https://img.shields.io/github/license/chatlxrdd/vinted-discord-bot?style=flat-square)

**Vinted Discord Bot** is a Discord bot that retrieves the latest items added to specific categories on Vinted and delivers this information to your Discord server. You can configure it to monitor various categories by specifying their IDs.

## Prerequisites

Before running the bot, you need to have Node.js installed, and you should download the bot repository.

1. **Install Node.js**: Download and install Node.js from [https://nodejs.org/en](https://nodejs.org/en).

2. **Download the Bot**: Clone or download this bot repository from [https://github.com/chatlxrdd/vinted-discord-bot](https://github.com/chatlxrdd/vinted-discord-bot). You can download it as a ZIP file.

## Installation

1. After downloading the repository, open a terminal and navigate to the bot's folder.

2. Run the following command to install the required dependencies, including Puppeteer:

   ```bash
   npm install puppeteer
# Usage

To use the bot, follow these steps:

1. Start the bot by running the following command in the bot's folder:

   ```bash
   node main.js

The bot will start running and monitor the categories specified in the `main.js` file. You can configure the categories by editing the `catalogIds` field in the script, as explained in the comments.

The bot will fetch the latest item added to each category and send the information to your Discord server.

## Contributing

If you find this bot helpful, consider giving it a star on the [GitHub repository](https://github.com/chatlxrdd/vinted-discord-bot).

## Future Development

Future developments for this bot may include:

- Adding functionality to store data in a database.
- Enhancing the ability to create and monitor categories.

Feel free to contribute to the project or suggest new features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

