const chalk = require("chalk");
const getTime = () => require('dateformat')(new Date(), 'yyyy-mm-dd hh:MM:ss');
global.Log = (...message) => { console.log(...message); };
global.log = {
    e: (...message) => { console.log(chalk.red("E"), chalk.gray(getTime()), ...message); },
    i: (...message) => { console.log(chalk.blue("I"), chalk.gray(getTime()), ...message); },
    w: (...message) => { console.log(chalk.yellow("W"), chalk.gray(getTime()), ...message); },
    s: (...message) => { console.log(chalk.green("S"), chalk.gray(getTime()), ...message); },
};