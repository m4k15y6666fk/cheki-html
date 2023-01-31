
const path = require('path');
const fs = require('fs/promises');

const { Glob } = require('glob');


function is_exist(str, opts = {}) {
    return new Promise(resolve => {
        const _glob = new Glob(str, opts);

        let exit = false;
        _glob.once('match', _match => {
            exit = true;
            resolve(true);
        });
        _glob.once('end', _match => {
            if (!exit) {
                exit = true;
                resolve(false);
            }
        });
    });
}

function is_readable(...str) {
    return fs.access(
        path.join(...str),
        fs.constants.R_OK
    )
    .then(_ => true)
    .catch(_ => false);
}

function is_writable(...str) {
    return fs.access(
        path.join(...str),
        fs.constants.W_OK
    )
    .then(_ => true)
    .catch(_ => false);
}

function is_directory(...str) {
    return fs.stat(
        path.join(...str)
    )
    .then(_stat => _stat.isDirectory())
    .catch(_ => false);
}

function is_file(...str) {
    return fs.stat(
        path.join(...str)
    )
    .then(_stat => _stat.isFile())
    .catch(_ => false);
}

module.exports = {
    is_exist,

    is_readable,
    is_writable,

    is_directory,
    is_file
};
