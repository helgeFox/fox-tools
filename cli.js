#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const yargs = require('yargs/yargs');
const decompress = require('decompress');
const path = require('path');

const {findInstance, findTemplate, config, openExplorer} = require('.');

function handleInstanceCommand(params) {
    if (params.verbose)
        console.log('handling INSTANCE command', params.guid);
    return findInstance(params.guid, params)
        .then(result => {
            if (params.verbose)
                console.info(chalk.green('\nFound IDML file: ' + result));
            return result;
        })
        .then(idmlPath => {
            if (params.unpack) {
                if (params.verbose)
                    console.log('Unpacking instance!');
                const unzipPath = `C:\\TEMP\\INSTANCES\\${params.guid}\\`;
                return decompress(idmlPath, unzipPath)
                    .then(_ => unzipPath);
            }
            return idmlPath;
        })
        .then(pathToOpen => {
            return openExplorer(pathToOpen)
                .then(msg => console.log('\n' + chalk.green(msg)));
        })
        .catch(function (err) {
            console.error(chalk.red('\nAn error occurred! (' + err.message + ')'));
            process.exit(1);
        });
}

function handleTemplateCommand(params) {
    if (params.verbose)
        console.log('handling TEMPLATE command', params);
    return findTemplate(params.path, params)
        .then(result => {
            if (params.verbose)
                console.info(chalk.green('\nFound TEMPLATE: ' + result));
            return result;
        })
        .then(idmlPath => {
            if (params.unpack) {
                if (params.verbose)
                    console.log('Unpacking template!');
                const unzipPath = path.resolve(`C:\\TEMP\\TEMPLATES\\${params.path}\\`);
                return decompress(idmlPath, unzipPath)
                    .then(_ => unzipPath);
            }
            return idmlPath;
        })
        .then(pathToOpen => {
            if (params.verbose)
                console.log('Opening folder ' + pathToOpen);
            return openExplorer(pathToOpen)
                .then(msg => console.log('\n' + chalk.green(msg)));
        })
        .catch(function (err) {
            console.error(chalk.red('\nAn error occurred! (' + err.message + ')'));
            process.exit(1);
        });
}

function handleConfigCommand(params) {
    if (params.verbose)
        console.log('handling CONFIG command', params);
    if (!params.path) {
        console.log('Current config: ', config.get('environments'));
        return;
    }
    if (!config.get('environments'))
        config.set('environments', {prod: null, stage: null});
    if (params.environment.toLowerCase() === 'stage') {
        if (params.verbose) console.log('Setting new base path for STAGE: ' + params.path);
        config.set('environments.stage', params.path);
    }
    else if (params.environment.toLowerCase() === 'prod') {
        if (params.verbose) console.log('Setting new base path for PROD: ' + params.path);
        config.set('environments.prod', params.path);
    }
    else {
        console.log('Did not find a known environment: "' + params.environment + '". No value set.');
    }
}


var argv = yargs(process.argv.slice(2))
  .scriptName('fox')
  .option('e', {
    alias: ['env', 'environment'],
    default: 'STAGE',
    type: 'string',
    global: true
  })
  .boolean('u')
  .alias('u', 'unpack')
  .default('u', false)
  .global('u')
  .boolean('v')
  .alias('v', 'verbose')
  .default('v', false)
  .global('v')
  .command('instance <guid>', 'Locates an *instance* from GUID', function (yargs) {
    return yargs.positional('guid', {
      type: 'string'
    }).example([
        ['$0 instance 6607e477-326b-4713-b520-596701d25e20', 'Find the instance with GUID 6607e477-326b-4713-b520-596701d25e20'],
        ['$0 instance 1ae6a737-442a-4fea-a4c1-40f91db5038a -e PROD', 'Find the instance with GUID 1ae6a737-442a-4fea-a4c1-40f91db5038a in PROD environment']
    ])
  }, handleInstanceCommand)
  .command('template <path>', 'Locates a *template* from Template partial path', function (yargs) {
    return yargs.positional('path', {
        type: 'string'
    }).example([
        ['$0 template 61/VITEC_DEMO/Generell_salgsoppgavemal', 'Find the template with path 61/VITEC_DEMO/Generell_salgsoppgavemal for environment specified with -e']
    ])
  }, handleTemplateCommand)
  .command('config [path]', 'Set (or get) base path for environment', function (yargs) {
    return yargs.positional('path', {
        type: 'string'
    }).example([
        ['$0 config', 'Outputs the config values for every environment'],
        ['$0 config \\\\10.10.141.30\\Publish\\IDS\\', 'Sets base path for STAGE environment']
    ])
  }, handleConfigCommand)
  .help('help')
  .argv
