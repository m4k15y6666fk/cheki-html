
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFile, appendFile } from 'node:fs/promises';

import sass from 'sass';
import express from 'express';
import nunjucks from 'nunjucks';

import { is_directory, is_file } from './scripts/rw.js';
import { defaults, pathToAbsolute } from './scripts/util.js';
import { glob_webstream } from './scripts/webstream.js';
import { import_nunjucks_environment } from './scripts/import-user-config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __basename = path.basename(__filename);


const app = express();

const _config = {
    inputPath: await defaults.input,
    assetsDir: await defaults.assets
};
let config = _config;
try {
    config = {
        ..._config,
        ...JSON.parse(process.env.HTML_SCREENSHOT_CONFIG)
    };
    console.log(`[${__basename}] custom configuration: ${JSON.stringify(config)}`);

} catch(err) {
    console.log(`[${__basename}] default configuration: ${JSON.stringify(config)}`);
}

if (await is_directory(config.inputPath)) {
    config.inputDir = config.inputPath;

} else if (await is_file(config.inputPath)) {
    config.inputDir = path.dirname(config.inputPath);

} else {
    throw new Error(`not directory/file: ${config.inputPath}`);
}


app.use('/', (req, res, next) => {
    console.log(`[${__basename}] Access: ${req.originalUrl}`);

    next();
});

app.use('/assets/*', (req, res, next) => {
    res.locals.pathname = req.params[0];
    res.locals.extname = path.extname(req.params[0]);

    if (res.locals.extname == '.scss' || res.locals.extname == '.sass') {
        let cssObject = sass.compile(path.join(config.assetsDir, res.locals.pathname));

        res.type('.css');
        res.send(cssObject.css);

    } else {
        next();
    }
});
app.use('/assets', express.static(config.assetsDir));

app.get('/init', async (req, res) => {
    let htmlBuffer = await readFile(defaults.init);

    res.type('.html');
    res.send(htmlBuffer.toString());
});


let environment = await import_nunjucks_environment(path.join(config.inputDir, 'nunjucks.config.mjs'));
if (await is_directory(config.inputPath)) {
    app.get('/preview', async (req, res) => {
        let htmlBuffer = await readFile(defaults.list);

        res.type('.html');
        res.send(htmlBuffer.toString());
    });
    app.get('/dir', async (req, res) => {
        res.type('.txt');
        res.send(config.inputDir);
    });
    app.get('/ls', async (req, res) => {
        const glob = path.join(config.inputDir, '*.{njk,html}');

        for await (let file of glob_webstream(glob)) {
            res.write(`${path.basename(file)},/preview/${path.basename(file)}` + '\n');
        }
        res.end();
    });

    app.get('/preview/*', async (req, res) => {
        // console.log(environment);
        let htmlContent = environment.render(path.join(config.inputDir, req.params[0]));

        res.type('.html');
        res.send(htmlContent);
    });

} else if (await is_file(config.inputPath)) {
    app.get('/preview', async (req, res) => {
        res.redirect('/preview/' + path.basename(config.inputPath));
    });
    app.get('/preview/*', async (req, res) => {
        // console.log(environment);
        let htmlContent = environment.render(path.join(config.inputDir, req.params[0]));

        res.type('.html');
        res.send(htmlContent);
    });
}

const port = process.env.PORT || 8080;
const server = app.listen(port, async _ => {
    console.log(`[${__basename}] Listening port: ${port}`);
    await appendFile(
        await defaults.change_log,
        '# ' + new Date().toLocaleString() + '\n'
    );

    try {
        process.send('server started');
        console.log(`[${__basename}] Server is a subprocess`);

    } catch(err) {
        console.error(`[${__basename}] Error: ${err.message}`);
        console.log(`[${__basename}] Server is a mainprocess`);
    }
});

server.on('close', async _ => {
    console.log('\r' + `[${__basename}] Server is already closed`);
    await appendFile(
        await defaults.change_log,
        `# ${new Date().toLocaleString()} (exit)` + '\n'
    );

    /*
    try {
        process.send('server closed');

    } catch(err) {
        console.error(`[${__basename}] Error: ${err.message}`);
    }
    */
});

process.on('message', msg => {
    if (msg == 'build exit') {
        server.close();
    }
});
