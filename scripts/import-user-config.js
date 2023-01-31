
const path = require('path');

const { Environment, FileSystemLoader } = require('nunjucks');

const { defaults } = require('./util.js');


const __basename = path.basename(__filename);

async function import_nunjucks_environment(_nunjucks_config_file = null) {
    let nunjucks_config_file = _nunjucks_config_file;

    let _module;
    try {
        _module = await import(nunjucks_config_file);

    } catch(err) {
        console.error(`[${__basename}] Error: ` + err.message);

        nunjucks_config_file = path.join(defaults.base, 'input', 'nunjucks.config.mjs');
        _module = await import(nunjucks_config_file);
    }
    console.log(`[${__basename}] load: nunjucks config: ${nunjucks_config_file}`);


    let { loaderBaseList, environmentOptions, modifyEnvironment } = _module;

    // console.log(loaderBaseList);
    return await modifyEnvironment(
        new Environment(
            loaderBaseList.map(dir => new FileSystemLoader(dir)),
            environmentOptions
        )
    );
}


module.exports = { import_nunjucks_environment };
