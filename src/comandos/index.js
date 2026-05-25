const fs = require('fs');
const path = require('path');

const commands = new Map();

const folders = fs.readdirSync(__dirname);

for (const folder of folders) {
  const folderPath = path.join(__dirname, folder);

  if (!fs.lstatSync(folderPath).isDirectory()) continue;

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const command = require(path.join(folderPath, file));

    const names = Array.isArray(command.name)
      ? command.name
      : [command.name];

    for (const name of names) {
      commands.set(name, command);
    }
  }
}

module.exports = commands;