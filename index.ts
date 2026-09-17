// const Conf = require('conf');
// const exec = require('child_process').exec;
// const chalk = require('chalk');

import Conf from 'conf';
import { exec } from 'child_process';
import chalk from 'chalk';

import { findInstance, findTemplate, findLocal } from './lib/index.js';

const config = new Conf({projectName: 'fox-tools'});

const openExplorer = function (result) {
    return new Promise((res, rej) => {
        const explorer = exec(`explorer.exe /select,${result}`);
        if (!explorer.stderr) throw new Error('Call to "explorer.exe" failed!?');
        explorer.stderr.on('data', (data) => {
            throw new Error('An error occurred while trying to access ' + result);
        });
        explorer.on('exit', code => {
          res('Success!');
        });
    });
};

export {
    findInstance,
    findTemplate,
    findLocal,
    config,
    openExplorer
}
