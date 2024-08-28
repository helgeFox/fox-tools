const path = require('path');
const fs = require('fs-extra');
const Conf = require('conf');

const config = new Conf();

exports = module.exports = {
    findInstance: function (guid, options) {
        return buildOptions(options, 'INSTANCES', config.get('environments'))
            .then(options => checkVpn(options.basePath))
            .then(findInstanceImpl.bind(null, guid, options));
    },
    findTemplate: function (template, options) {
        return buildOptions(options, 'TEMPLATES', config.get('environments'))
            .then(options => checkVpn(options.basePath))
            .then(findTemplateImpl.bind(null, template, options));
    },
};

function buildOptions(options, templateType, environments) {
    return new Promise((res, rej) => {
        options = options || {};
        const env = options.env || 'STAGE';
        const base = environments[env.toLowerCase()];
        if (!base)
            throw new Error('Base path config not set for environment "' + env + '"');
        options.templateType = templateType;
        options.basePath = path.join(base, templateType);
        res(options);
    });
}

function checkVpn(path) {
    return fs.pathExists(path)
        .then((exists) => {
            if (exists) {
                return true;
            }
            else {
                throw new Error(`Base path ${path} was not found`);
            }
    });
}

function findInstanceImpl(guid, options) {
    if (!guid)
        throw new Error('Missing <guid> parameter');
    const p = path.join(options.basePath, getIdmlSubFolder(guid), guid);
    return fs.pathExists(p)
        .then((exists) => {
            if (exists) {
                return path.join(p, guid + '.idml');
            }
            else throw new Error(`Path "${p}" does not exist`);
        });
}

function getIdmlSubFolder(instanceGuid) {
    const subFolder = instanceGuid.substr(0, 2);
    const c = instanceGuid[2];
    if ("01234567".indexOf(c) >= 0)
        return subFolder + "0";
    else
        return subFolder + "1";
}

function findTemplateImpl(template, options) {
    if (!template)
        throw new Error('Missing <template> parameter');
    const folder = template.split('/').slice(0, -1).join('/');
    const idml = template.split('/').slice(-1).join('');
    const p = path.join(options.basePath, folder);
    return fs.pathExists(p)
        .then((exists) => {
            if (exists) {
                return path.join(p, idml + '.idml');
            }
            else throw new Error(`Path "${p}" does not exist`);
        });
}