const Conf = require('conf');

const {findInstance, findTemplate} = require('./lib');

const config = new Conf();

exports = module.exports = {
    findInstance,
    findTemplate,
    config
}