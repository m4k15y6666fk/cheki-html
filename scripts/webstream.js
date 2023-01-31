
const path = require('path');
const { open, mkdir /*, stat, readFile */ } = require('fs/promises');

const { Glob } = require('glob');
// const sass = require('sass');
// const nunjucks = require('nunjucks');
const { chromium, devices } = require('playwright');
const Vinyl = require('vinyl');

const { defaults, is_web } = require('./util.js');
const { /* is_readable, */ is_writable } = require('./rw.js');


function web2img_webstream({ url = 'http://localhost:8080/', device = defaults.device } = {}) {
    return new ReadableStream({
        async start(controller) {
            if (! is_web(url)) {
                controller.error('[webstream.js] invalid URL: ' + url);

                return;
            }

            const browser = await chromium.launch();
            const context = await browser.newContext({
                ...devices[device]
            });

            const page = await context.newPage();
            await page.goto(url);

            const parsedURL = new URL(url);
            const basename = parsedURL.hostname.replace(/\./g, '_') + '-' + Math.random().toString(36).slice(2) + '.png';
            const vinyl = new Vinyl({
                cwd: process.cwd(),
                // base,
                path: path.join(defaults.output, basename),
                contents: await page.locator('body').screenshot()
            });

            controller.enqueue(vinyl);

            await browser.close();
            controller.close();
        }
    });
}

function glob_webstream(str) {
    return new ReadableStream({
        start(controller) {
            const _glob = new Glob(str);

            _glob.on('match', _match => {
                let match = path.resolve(process.cwd(), _match);

                controller.enqueue(match);
            });

            _glob.on('end', _ => {
                controller.close();
            });
        }
    });
}

function image_webstream({ baseURL = 'http://localhost:8080/', device = defaults.device } = {}) {
    let browser;
    let context;

    return new TransformStream({
        async start(controller) {
            try {
                browser = await chromium.launch();
                context = await browser.newContext({
                    ...devices[device]
                });

            } catch(err) {
                controller.error(err.message);
            }
        },

        async transform(chunk, controller) {
            let page = await context.newPage();

            try {
                await page.goto(baseURL + path.basename(chunk), {
                    waitUntil: 'load'
                });

                let vinyl = new Vinyl({
                    cwd: process.cwd(),
                    // base: _match.base,
                    path: chunk,
                    // stat: await stat(chunk),
                    contents: await page.locator('body').screenshot()
                });
                vinyl.extname = '.png';

                controller.enqueue(vinyl);

            } catch(err) {
                controller.error(err.message);
            }
        },

        async flush() {
            await browser.close();
        }
    });
}

/*
function vinyl_webstream() {
    return new TransformStream({
        async transform(chunk, controller) {
            if (! await is_readable(chunk)) {
                controller.error('not readable: ' + chunk);

                return;
            }

            const vinyl = new Vinyl({
                cwd: process.cwd(),
                // base: _match.base,
                path: chunk,
                stat: await stat(chunk),
                contents: await readFile(chunk)
            });
            controller.enqueue(vinyl);
        }
    });
}

function nunjucks_webstream(env = null) {
    return new TransformStream({
        transform(vinyl, controller) {
            if (!Vinyl.isVinyl(vinyl)) {
                controller.error('invalid streaming format: not Vinyl Object');

                return;
            }
            if (!vinyl.isBuffer()) {
                controller.error('invalid streaming format: not supported for stream/null contents');

                return;
            }

            vinyl.extname = '.html';
            if (!env) {
                vinyl.contents = Buffer.from(
                    nunjucks.renderString(vinyl.contents.toString())
                );
            } else {
                vinyl.contents = Buffer.from(
                    env.renderString(vinyl.contents.toString())
                );
            }

            controller.enqueue(vinyl);
        }
    });
}

function screenshot_webstream({ url = 'http://localhost:8080/', device = 'iPhone XR' } = {}) {
    let browser;
    let context;
    let page;

    return new TransformStream({
        async start(controller) {
            try {
                browser = await chromium.launch();
                context = await browser.newContext({
                    ...devices[device]
                });
                page = await context.newPage();

                await page.goto(url);

            } catch(err) {
                controller.error(err.message);
            }
        },

        async transform(vinyl, controller) {
            if (!Vinyl.isVinyl(vinyl)) {
                controller.error('invalid streaming format: not Vinyl Object');

                return;
            }
            if (!vinyl.isBuffer()) {
                controller.error('invalid streaming format: not supported for stream/null contents');

                return;
            }

            await page.setContent(vinyl.contents.toString(), {
                waitUntil: 'load'
            });

            vinyl.extname = '.png';
            vinyl.contents = await page.locator('body').screenshot();

            controller.enqueue(vinyl);
        },

        async flush() {
            await browser.close();
        }
    });
}
*/

function output_webstream(outputDir, { force = false } = {}) {
    return new WritableStream({
        async start(controller) {
            if (! await is_writable(outputDir)) {
                try {
                    await mkdir(outputDir, { recursive: true });
                    console.log('[webstream.js] Created: ' + outputDir);

                } catch(err) {
                    controller.error(err.message);
                }
            }
        },

        async write(vinyl, controller) {
            if (!Vinyl.isVinyl(vinyl)) {
                controller.error('invalid streaming format: not Vinyl Object');

                return;
            }
            if (!vinyl.isBuffer()) {
                controller.error('invalid streaming format: not supported for stream/null contents');

                return;
            }

            let outputFile = path.join(outputDir, vinyl.basename);
            try {
                let fd;
                if (force) {
                    fd = await open(outputFile, 'w');
                } else {
                    fd = await open(outputFile, 'wx');
                }

                await fd.writeFile(vinyl.contents);
                await fd.close();
                console.log('[index.js] screenshot: ' + outputFile);

            } catch(err) {
                console.error('[index.js] Error: ' + err.message);
                console.error('[index.js] try --force');
            }

        },

        close() {
            // console.log('quit');
        }
    });
}


module.exports = {
    web2img_webstream,

    glob_webstream,
    image_webstream,
    // vinyl_webstream,
    // nunjucks_webstream,
    // screenshot_webstream,

    output_webstream
};
