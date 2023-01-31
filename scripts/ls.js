
const path = require('path');
const fs = require('fs/promises');

async function* main(...str) {
    const dir = await fs.opendir(path.join(...str));

    for await (let dirent of dir) {
        yield dirent;
    }
}

module.exports = main;
