#!/usr/bin/env node

import { writeFile, readFile, mkdir, cp, open } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { fork } from 'node:child_process';

import _browserSync from 'browser-sync';
import nodemon from 'nodemon';
import { program, Option } from 'commander';
import sass from 'sass';
import nunjucks from 'nunjucks';
import { chromium, devices } from 'playwright';

import {
    web2img_webstream,

    glob_webstream,
    image_webstream,

    output_webstream
} from './scripts/webstream.js';
import find_empty_port from './scripts/empty-port.js';
import { is_readable, is_writable, is_directory, is_file } from './scripts/rw.js';
import ls from './scripts/ls.js';
import { defaults, is_web, pathToAbsolute } from './scripts/util.js';
import { import_nunjucks_environment } from './scripts/import-user-config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __basename = path.basename(__filename);

const browserSync = _browserSync.create();


const _version = JSON.parse(await readFile(path.join(__dirname, 'package.json'))).version;

program
.name('html-screenshot')
.version(_version, '-v, --version')
.description('CLI tool for converting Nunjucks + SCSS documents to PNG Images.')
.usage('[options] [command [options...]]')

program
.command('preview')
.alias('watch')
.description('preview Nunjucks + SCSS documents.')
.option('-i, --input <file>', 'input', await defaults.input)
.option('--assets <directory>', 'assets dir', await defaults.assets)
.option('-p, --port <number>', 'port', 8080)
.action(_preview);

program
.command('build')
.alias('convert')
.description('convert Nunjucks + SCSS documents to PNG Images.')
.option('-f, --force', 'force to overwrite')
.option('-o, --output <directory>', 'output', defaults.output)
.option('-i, --input <string>', 'file glob / URL for input', await defaults.input)
.option('--assets <directory>', 'assets dir', await defaults.assets)
.option('-p, --port <number>', 'port', 8080)
.addOption(new Option('-d, --device <device>', 'device').default('iPhone XR').choices(Object.keys(devices)))
.action(_build);

program
.command('init')
.alias('generate')
.description('generate template files for converting.')
.option('-f, --force', 'force to overwrite', false)
.option('-d, --dir <string>', 'generate template', process.cwd())
.action(_init);

/*
program
.command('test')
.addOption(new Option('-t, --test <amount>', 'test').default(20).argParser(parseFloat))
.action(function() {
    console.log(this.opts());
});
*/

program.parse();


async function _init() {
    const _options = this.opts();
    const options = {
        ..._options,
        dir: pathToAbsolute(_options.dir)
    };

    const templateDir = path.join(defaults.base, 'input');

    try {
        await cp(templateDir, options.dir, {
            errorOnExist: true,
            filter: async (src, dest) => {
                if (path.basename(src)[0] == '.') {
                    return false;
                }
                return true;
            },
            force: options.force,
            recursive: true
        });
        console.log(`[${__basename}] Generate template at: ${options.dir}`);

    } catch(err) {
        console.error(`[${__basename}] Error: ${err.message}`);
    }
}

async function _preview() {
    const _options = this.opts();
    const options = {
        ..._options,
        input: pathToAbsolute(_options.input),
        assets: pathToAbsolute(_options.assets),
    };

    const original_port = await find_empty_port(parseInt(options.port) - 10);
    //const original_port = parseInt(options.port) - 10;
    const nodemon_options = {
        script: defaults.server,

        restartable: "rs",
        colours: true,
        ignore: [
            ".git",
            "node_modules/**"
        ],
        watch: [
            options.input,
            options.assets
        ],
        ext: 'css,scss,sass,js,mjs,njk,html',
        stdin: true,
        stdout: true,
        verbose: true,
        env: {
            HTML_SCREENSHOT_CONFIG: JSON.stringify({
                inputPath: options.input,
                assetsDir: options.assets
            }),
            PORT: original_port
        }
    };

    console.log('[nodemon] options:');
    console.log(nodemon_options);

    await writeFile(
        await defaults.change_log,
        [
            '# Auto Generated, For checking file updates.',
            '',
            '# ' + new Date().toLocaleString() + ' (created)',
            ''
        ].join('\n')
    );
    nodemon(nodemon_options);
    browserSync.init({
        files: await defaults.change_log,

        proxy: 'http://localhost:' + original_port,
        port: await find_empty_port(parseInt(options.port)),
        //port: parseInt(options.port),

        open: false,
        notify: false,
        localOnly: true,
        // reloadDelay: 1000,
    });

    nodemon.once('start', _ => {
        console.log('[nodemon] start');
    });
    nodemon.on('quit', _ => {
        console.log('\r' + '[nodemon] quit');

        browserSync.exit();
        process.exit();
    }).on('restart', files => {
        console.log('[nodemon] restarted due to: ', files);
    });
}

async function _build() {
    const _options = this.opts();
    const options = {
        ..._options,
        output: pathToAbsolute(_options.output),
        assets: pathToAbsolute(_options.assets),
    }
    console.log(`[${__basename}] given command-line options:`);
    console.log(options);


    try {
        if (!devices[options.device]) {
            throw new Error('Invalid Option: -d, --device');
        }

    } catch(err) {
        console.error(`[${__basename}] Error: ${err.message}`);
        process.exit(1);
    }


    if (! await is_writable(options.output) || ! await is_directory(options.output)) {
        try {
            await mkdir(options.output, { recursive: true });
            console.log(`[${__basename}] Created: ${options.output}`);

        } catch(err) {
            console.error(`[${__basename}] Error: ${err.message}`);
            process.exit(1);
        }
    }


    if (is_web(options.input)) {
        await web2img_webstream({ url: options.input, device: options.device })
                .pipeTo(output_webstream(options.output, { force: options.force }));

    } else {
        options.input = pathToAbsolute(_options.input);
        if (! await is_readable(path.dirname(options.input))) {
            throw new Error(`[${__basename}] invalid -i, --input option: ${options.input}`);
        }

        const port = await find_empty_port(parseInt(options.port));

        let _server;
        try {
            const server = await new Promise(resolve => {
                _server = fork(path.join(__dirname, 'server.mjs'), {
                    env: {
                        HTML_SCREENSHOT_CONFIG: JSON.stringify({
                            inputPath: options.input,
                            assetsDir: options.assets
                        }),
                        PORT: port
                    }
                });

                console.log(`[${__basename}] Server process PID: ${_server.pid}`);

                _server.on('message', async msg => {
                    if (msg == 'server started') {
                        console.log(`[${__basename}] server is already started`);

                        let readable_stream;
                        if (await is_directory(options.input)) {
                            readable_stream = glob_webstream(path.join(options.input, '*.{njk,html}'));

                        } else if (await is_file(options.input)) {
                            readable_stream = glob_webstream(options.input);
                        }

                        await readable_stream.pipeThrough(image_webstream({
                                                 baseURL: 'http://localhost:' + port + '/preview/',
                                                 device: options.device
                                             }))
                                             .pipeTo(output_webstream(options.output, { force: options.force }));

                        resolve(_server);
                    }
                });
            });

            server.send('build exit');

        } catch(err) {
            console.error(`[${__basename}] Error: ${err.message}`);

            if (! _server.killed) {
                _server.kill();
                console.log(`[${__basename}] Server is already killed`);
            }
        }

        process.exit();
    }
}
