const Conf = require('conf');
const exec = require('child_process').exec;
const chalk = require('chalk');

const {findInstance, findTemplate} = require('./lib');

const config = new Conf();

const openExplorer = function (result) {
    return new Promise((res, rej) => {
        const explorer = exec(`explorer.exe /select,${result}`);
        explorer.stderr.on('data', (data) => {
            throw new Error('An error occurred while trying to access ' + result);
        });
        explorer.on('exit', code => {
          res('Success!');
        });
    });
};

exports = module.exports = {
    findInstance,
    findTemplate,
    config,
    openExplorer
}