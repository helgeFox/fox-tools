#!/usr/bin/env node
'use strict';

const meow = require('meow');
const chalk = require('chalk');
const exec = require('child_process').exec;

const greenInverse = chalk.bold.inverse.green;
const cyanInverse = chalk.bold.inverse.cyan;
const magentaInverse = chalk.bold.inverse.magenta;
const yellowInverse = chalk.bold.inverse.yellow;
const grayInverse = chalk.bold.inverse.gray;

const {findInstance, findTemplate, config} = require('.');

// const meowHelper = require('./meow-helper');
// const help = meowHelper();
// const cli = meow(help.text, help.flags);

const cli = meow(chalk`
    ${greenInverse('Usage')}
      {gray $} {green fox} {cyan <command>} {magenta <parameter>} {yellow [options]}

    ${cyanInverse('Commands')}
      {cyan instance} ${chalk.dim('Locates an *instance* from GUID')}
      {cyan template} ${chalk.dim('Locates a *template* from Template partial path')}
      {cyan config} ${chalk.dim('Set base path for <environment>')}

    ${magentaInverse('Parameter')}
      ${chalk.dim('The GUID or Template to find (or base path if command is config)')}
 
    ${yellowInverse('Options')}
      {yellow --environment, -e} ${chalk.dim('Which environment to use (e.g. STAGE or PROD). Default is STAGE')}
      {yellow --verbose, -v} ${chalk.dim('More output')}
 
    ${grayInverse('Examples')}
      $ fox instance 6607e477-326b-4713-b520-596701d25e20
      $ fox instance 6607e477-326b-4713-b520-596701d25e20 --environment=PROD --verbose
      $ fox template 61/VITEC_DEMO/Generell_salgsoppgavemal
      $ fox template 61/VITEC_DEMO/Generell_salgsoppgavemal --environment=PROD
      $ fox config \\\\10.10.141.30\\Publish\\IDS\\
`, {
    flags: {
        environment: {
            type: 'string',
            default: 'STAGE',
            alias: 'e'
        },
        verbose: {
          type: 'boolean',
          default: false,
          alias: 'v'
        }
    }
});

function setConfig(value, options) {
    if (!value) {
        console.log('Current config: ', config.get('environments'));
        return;
    }
    if (!config.get('environments'))
        config.set('environments', {prod: null, stage: null});
    if (!options.env || options.env.toLowerCase() === 'stage') {
        if (verbose) console.log('Setting new base path for STAGE: ' + value);
        config.set('environments.stage', value);
    }
    else if (options.env.toLowerCase() === 'prod') {
        if (verbose) console.log('Setting new base path for PROD: ' + value);
        config.set('environments.prod', value);
    }
}

const actions = {
    'instance': findInstance,
    'template': findTemplate,
    'config': setConfig
};
const command = cli.input[0];
const parameter = cli.input[1];
const env = cli.flags.environment;
const verbose = cli.flags.verbose;
const hasConfig = config && config.get('environments') && config.get(`environments.${env.toLowerCase()}`);
const operation = actions[command];

if (verbose) 
    console.info('\ninputs: ', {command, parameter, env, verbose});

if (!command || !actions[command])
    console.error(chalk.red('Command does not exist (' + command + ')'));
else if (!hasConfig) {
    if (command === 'config')
        operation(paramter, {env});
    else {
        console.error('\nNo configuration found! You must call \'fox config\' and pass in a base path for the environment you are trying to access.');
        if (verbose)
            console.info('Current environment config: ', config.get('environments'));
    }
}
else {
    operation(parameter, {env})
        .then(result => {
            if (verbose)
                console.info(chalk.green('\nFound folder: ' + result));
            const explorer = exec(`explorer.exe /select,${result}`);
            explorer.stderr.on('data', (data) => {
              console.error(chalk.red('\nSomething went wrong opening the folder'), data.toString());
              process.exit(1);
            });
            explorer.on('exit', code => {
              console.log(chalk.green('\nSuccess!'));
              process.exit();
            });
        })
        .catch(err => {
            console.error(chalk.red('\nError'), err.message ? err.message : err);
            process.exit(1);
        });
}