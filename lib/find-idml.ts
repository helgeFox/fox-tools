import path from 'path';
import fs from 'fs-extra';
import Conf from 'conf';

import type { InstanceParams, TemplateParams, CommonParams } from './types.ts'

const config = new Conf<Record<string, Record<string, string>>>({projectName: 'fox-tools'});

export function findInstance(guid: string, options: InstanceParams) {
    return buildOptions(options, 'INSTANCES', config.get('environments'))
        .then(options => checkVpn(options.basePath))
        .then(findInstanceImpl.bind(null, guid, options));
}

export function findTemplate(template: string, options: TemplateParams) {
    return buildOptions(options, 'TEMPLATES', config.get('environments'))
        .then(options => checkVpn(options.basePath))
        .then(findTemplateImpl.bind(null, template, options));
}

export async function findLocal(idml: string, options: TemplateParams) {
    if (/\/|\\/.test(options.path)) {
        options.path = options.path.substring(options.path.lastIndexOf('/'))
        options.path = options.path.substring(options.path.lastIndexOf('\\'))
    }
    if (options.path.endsWith('.idml'))
        options.path = options.path.slice(0, -5)
    let isURI = false
    isURI = await fs.exists(idml)
    if (isURI)
        return path.resolve(idml)
    isURI = await fs.exists(path.resolve(idml))
    if (isURI)
        return path.resolve(idml)
    throw new Error(`Path "${idml}" does not exist`);
}

function buildOptions<T extends CommonParams>(options: T, templateType: string, environments: Record<string, string>): Promise<T> {
    return new Promise((res, rej) => {
        const env = options.env || 'STAGE';
        const base = environments[env.toLowerCase()];
        if (!base)
            throw new Error('Base path config not set for environment "' + env + '"');
        options.templateType = templateType;
        options.basePath = path.join(base, templateType);
        res(options);
    });
}

async function checkVpn(path: string) {
    const exists = await fs.pathExists(path);
    if (exists) {
        return true;
    }
    else {
        throw new Error(`Base path ${path} was not found`);
    }
}

async function findInstanceImpl(guid: string, options: CommonParams) {
    if (!guid)
        throw new Error('Missing <guid> parameter');
    const p = path.join(options.basePath, getIdmlSubFolder(guid), guid);
    const exists = await fs.pathExists(p);
    if (exists) {
        return path.join(p, guid + '.idml');
    }
    else throw new Error(`Path "${p}" does not exist`);
}

function getIdmlSubFolder(instanceGuid: string) {
    const subFolder = instanceGuid.substring(0, 2);
    const c = instanceGuid[2];
    if (c && "01234567".indexOf(c) >= 0)
        return subFolder + "0";
    else
        return subFolder + "1";
}

async function findTemplateImpl(template: string, options: TemplateParams) {
    if (!template)
        throw new Error('Missing <template> parameter');
    const folder = template.split('/').slice(0, -1).join('/');
    const idml = template.split('/').slice(-1).join('');
    const p = path.join(options.basePath, folder);
    const exists = await fs.pathExists(p);
    if (exists) {
        return path.join(p, idml + '.idml');
    }
    else throw new Error(`Path "${p}" does not exist`);
}