
const path = require('path');
const os = require('os');
const { mkdir } = require('fs/promises');

const { is_readable, is_writable, is_directory, is_file, is_exist } = require('./rw.js');


const xdg_data_home = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
const xdg_cache_home = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');

const fallback = {
    base: path.resolve(__dirname, '..'),
};
fallback.output = undefined;
fallback.input = path.join(fallback.base, 'input');
fallback.assets = path.join(fallback.input, 'assets');

const defaults = {
    base: fallback.base,

    server: path.join(fallback.base, 'server.mjs'),
    init: path.join(fallback.base, 'init', 'init.html'),

    list: path.join(fallback.base, 'init', 'list.html'),

    device: 'iPhone XR',

    output: path.join(process.cwd(), 'output')
};
/*
Object.defineProperty(defaults, 'output', {
    get: async _ => {
        let _result = path.join(process.cwd(), 'output');
        if (! await is_writable(_result) || ! await is_directory(_result)) {
            try {
                await mkdir(_result, { recursive: true });
                console.log('[defaults.js] Created: ' + _result);

            } catch(err) {
                throw err;
            }
        }

        return _result;
    }
});
*/
Object.defineProperty(defaults, 'input', {
    get: async _ => {
        let _result = process.cwd();
        if (! await is_exist(path.join(_result, '*.{njk,html}'))) {
            _result = path.join(fallback.base, 'input');
        }

        return _result;
    }
});
Object.defineProperty(defaults, 'assets', {
    get: async _ => {
        let _result = path.join(process.cwd(), 'assets');
        if (! await is_readable(_result) || ! await is_directory(_result)) {
            _result = path.join(fallback.input, 'assets');
        }

        return _result;
    }
});
Object.defineProperty(defaults, 'cache', {
    get: async _ => {
        let _result = path.join(xdg_cache_home, 'html-screenshot');
        if (! await is_writable(_result) || ! is_directory(_result)) {
            try {
                await mkdir(_result, { recursive: true });
                console.log('[defaults.js] Created: ' + _result);

            } catch(err) {
                throw err;
            }
        }

        return _result;
    }
});
Object.defineProperty(defaults, 'change_log', {
    get: async _ => {
        return path.join(await defaults.cache, 'change_log.txt');
    }
});


function is_web(str) {
    const re = /https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/;

    return re.test(str);
}

function pathToAbsolute(...str) {
    return path.resolve(process.cwd(), ...str);
}


module.exports = {
    xdg_data_home,
    xdg_cache_home,

    fallback,
    defaults,

    is_web,
    pathToAbsolute
}
