
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let loaderBaseList = [
    __dirname,
    process.cwd()
];
try {
    loaderBaseList.unshift(
        JSON.parse(process.env.HTML_SCREENSHOT_CONFIG).inputDir
    );
} catch(err) {
    console.error(err.message);
}

const environmentOptions = {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false
};

const modifyEnvironment = async (env) => {

    /*
        Add Filters/Extensions ...
        or do something with Nunjucks Environment
    */

    return env;
}


export { loaderBaseList, environmentOptions, modifyEnvironment };
