const path = require('path');
const fs = require('fs-extra');
const Conf = require('conf');

const config = new Conf();

exports = module.exports = {
    findInstance: function (guid, options) {
        options = buildOptions(options, 'INSTANCES', config.get('environments'));
        return checkVpn(options.basePath).then(findInstanceImpl.bind(null, guid, options));
    },
    findTemplate: function (template, options) {
        options = buildOptions(options, 'TEMPLATES', config.get('environments'));
        return checkVpn(options.basePath).then(findTemplateImpl.bind(null, template, options));
    },
};

function buildOptions(options, templateType, environments) {
    options = options || {};
    const env = options.env || 'STAGE';
    options.basePath = environments[env.toLowerCase()] + `\\${templateType}\\`;
    return options;
}

function checkVpn(path) {
    return new Promise((resolve, reject) => {
        fs.pathExists(path)
            .then((exists) => {
                if (exists) {
                    resolve(true);
                }
                else {
                    reject(new Error(`Base path ${path} was not found. Wrong VPN maybe?`));
                }
            }).catch((err) => reject('err0rz:' + err));
    });
}

function findInstanceImpl(guid, options) {
    return new Promise((resolve, reject) => {
        const p = path.join(options.basePath, getIdmlSubFolder(guid), guid);
        return fs.pathExists(p)
            .then((exists) => {
                if (exists) {
                    const idmlUri = path.join(p, guid + '.idml');
                    resolve(idmlUri);
                }
                else reject(`Path "${p}" does not exist`);
            });
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
    return new Promise((resolve, reject) => {
        if (!template)
            return reject('Missing <template> parameter');
        const folder = template.split('/').slice(0, -1).join('/');
        const idml = template.split('/').slice(-1).join('');
        const p = path.join(options.basePath, folder);
        return fs.pathExists(p)
            .then((exists) => {
                if (exists) {
                    const idmlUri = path.join(p, idml + '.idml');
                    resolve(idmlUri);
                }
                else reject(`Path "${p}" does not exist`);
            });
    });
}