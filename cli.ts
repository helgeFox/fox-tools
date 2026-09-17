#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import decompress from '@xhmikosr/decompress'
import path from 'node:path'

import { findInstance, findTemplate, findLocal, config, openExplorer } from './index.js';

type InstanceParams = {
    verbose: boolean
    guid: string
    unpack: boolean
}

type TemplateParams = {
    verbose: boolean
    path: string
    unpack: boolean
}

type ConfigParams = {
    verbose: boolean
    path: string
    unpack: boolean
    environment: string
    for?: string
}

function handleInstanceCommand(params: InstanceParams) {
    if (params.verbose)
        console.log('handling INSTANCE command', params.guid);
    return findInstance(params.guid, params)
        .then((result: string) => {
            if (params.verbose)
                console.info(chalk.green('\nFound IDML file: ' + result));
            return result;
        })
        .then((idmlPath: string) => {
            if (params.unpack && config.get('unpackPath')) {
                if (params.verbose)
                    console.log('Unpacking instance!');
                const unzipPath = path.resolve(path.join(config.get('unpackPath') as string, 'INSTANCES', params.guid)); // `C:\\TEMP\\INSTANCES\\${params.guid}\\`;
                return decompress(idmlPath, unzipPath)
                    .then(() => unzipPath);
            }
            else if (params.unpack) {
                console.warn('Did not unpack instance! Missing config value for <unpackPath>');
            }
            return idmlPath;
        })
        .then((pathToOpen:string) => {
            return openExplorer(pathToOpen)
                .then((msg) => console.log('\n' + chalk.green(msg)));
        })
        .catch(function (err:Error) {
            console.error(chalk.red('\nAn error occurred! (' + err.message + ')'));
            process.exit(1);
        });
}

function handleTemplateCommand(params: TemplateParams) {
    if (params.verbose)
        console.log('handling TEMPLATE command', params);
    return findTemplate(params.path, params)
        .then((result: string) => {
            if (params.verbose)
                console.info(chalk.green('\nFound TEMPLATE: ' + result));
            return result;
        })
        .then((idmlPath: string) => {
            if (params.unpack && config.get('unpackPath')) {
                if (params.verbose)
                    console.log('Unpacking template!');
                // const unzipPath = path.resolve(`${config.get('unpackPath')}\\TEMPLATES\\${params.path}\\`);
                const unzipPath = path.resolve(path.join(config.get('unpackPath') as string, 'TEMPLATES', params.path))
                return decompress(idmlPath, unzipPath)
                    .then(() => unzipPath);
            }
            else if (params.unpack) {
                console.warn('Did not unpack template! Missing config value for <unpackPath>');
            }
            return idmlPath;
        })
        .then((pathToOpen: string) => {
            if (params.verbose)
                console.log('Opening folder ' + pathToOpen);
            return openExplorer(pathToOpen)
                .then((msg) => console.log('\n' + chalk.green(msg)));
        })
        .catch(function (err: Error) {
            console.error(chalk.red('\nAn error occurred! (' + err.message + ')'));
            process.exit(1);
        });
}

function handleLocalCommand(params: TemplateParams) {
    if (params.verbose)
        console.log('handling LOCAL command', params);
    return findLocal(params.path, params)
        .then((result: string) => {
            if (params.verbose)
                console.info(chalk.green('\nFound LOCAL: ' + result));
            return result;
        })
        .then((idmlPath: string) => {
            if (params.unpack && config.get('unpackPath')) {
                if (params.verbose)
                    console.log('Unpacking idml!');
                // const unzipPath = path.resolve(`${config.get('unpackPath')}\\TEMPLATES\\${params.path}\\`);
                const unzipPath = path.resolve(path.join(config.get('unpackPath') as string, 'LOCAL', params.path))
                return decompress(idmlPath, unzipPath)
                    .then(() => unzipPath);
            }
            else if (params.unpack) {
                console.warn('Did not unpack the idml! Missing config value for <unpackPath>');
            }
            return idmlPath;
        })
        .then((pathToOpen: string) => {
            if (params.verbose)
                console.log('Opening folder ' + pathToOpen);
            return openExplorer(pathToOpen)
                .then((msg) => console.log('\n' + chalk.green(msg)));
        })
        .catch(function (err: Error) {
            console.error(chalk.red('\nAn error occurred! (' + err.message + ')'));
            process.exit(1);
        });
}

function handleConfigCommand(params: ConfigParams) {
    if (params.verbose)
        console.log('handling CONFIG command', params);
    if (!params.path) {
        console.log('Current config: ', {environments: config.get('environments'), unpackPath: config.get('unpackPath')});
        return;
    }
    const knownEnvs = ['prod', 'stage', 'dev']
    const curEnv = params.environment.toLowerCase()
    if (!config.get('environments'))
        config.set('environments', {prod: null, stage: null, dev: null});
    if (params.for) {
        if (params.verbose) console.log(`Setting new ${params.for}Path: ${params.path}`);
        config.set(params.for + 'Path', params.path)
    }
    else if (knownEnvs.includes(curEnv)) {
        if (params.verbose) console.log(`Setting new base path for ${curEnv.toUpperCase()}: ` + params.path);
        config.set(`environments.${curEnv}`, params.path);
    }
    else {
        console.log('Did not find a known environment: "' + params.environment + '". No value set.');
    }
}


yargs(hideBin(process.argv))
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
  .command<InstanceParams>('instance <path>', 'Locates an *instance* from GUID', (yargs) => {
    return yargs.positional('guid', { type: 'string' })
        .example([
            ['$0 instance 6607e477-326b-4713-b520-596701d25e20', 'Find the instance with GUID 6607e477-326b-4713-b520-596701d25e20'],
            ['$0 instance 1ae6a737-442a-4fea-a4c1-40f91db5038a -e PROD', 'Find the instance with GUID 1ae6a737-442a-4fea-a4c1-40f91db5038a in PROD environment']
        ])
  }, handleInstanceCommand)
  .command<TemplateParams>('template <path>', 'Locates a *template* from Template partial path', (yargs) => {
    return yargs
        .positional('path', {
            type: 'string'
        }).example([
            ['$0 template 61/VITEC_DEMO/Generell_salgsoppgavemal', 'Find the template with path 61/VITEC_DEMO/Generell_salgsoppgavemal for environment specified with -e'],
            ['$0 template 1/Aktiv/Salgsoppgave_OneClick/Salgsoppgave -e dev -v -u', 'Find template in *DEV* environment (-e dev) and then unpack (-u) and open unpacked folder. Also with verbose (-v) logging.']
        ])
  }, handleTemplateCommand)
  .command<TemplateParams>('local <path>', 'Locates an *IDML* from a Local path', (yargs) => {
    return yargs
        .positional('path', {
            type: 'string'
        }).example([
            ['$0 local some-template', 'Find the template with path 61/VITEC_DEMO/Generell_salgsoppgavemal for environment specified with -e'],
            ['$0 local 1ae6a737-442a-4fea-a4c1-40f91db5038a -e dev -v -u', 'Find template in *DEV* environment (-e dev) and then unpack (-u) and open unpacked folder. Also with verbose (-v) logging.']
        ])
  }, handleLocalCommand)
  .command<ConfigParams>('config [path]', 'Set (or get) base path for environment', (yargs) => {
    return yargs
        .positional('path', {
            type: 'string'
        })
        .option('for', {
            type: 'string',
            choices: ['unpack', 'hmm']
        })
        .example([
            ['$0 config', 'Outputs the config values for every environment'],
            ['$0 config \\\\10.10.141.30\\Publish\\IDS\\', 'Sets base path for STAGE environment'],
            ['$0 config C:\\TEMP\\idml --for unpack']
        ])
  }, handleConfigCommand)
  .help('help')
  .argv
