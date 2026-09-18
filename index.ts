import Conf from 'conf';
import { exec } from 'child_process';

import { findInstance, findTemplate, findLocal } from './lib';

const config = new Conf({projectName: 'fox-tools'});

const openExplorer = function (result: string) {
    return new Promise((res, rej) => {
        const explorer = exec(`explorer.exe /select,${result}`);
        if (!explorer.stderr) throw new Error('Call to "explorer.exe" failed!?');
        explorer.stderr.on('data', () => {
            throw new Error('An error occurred while trying to access ' + result);
        });
        explorer.on('exit', () => {
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

export type * from './lib'
