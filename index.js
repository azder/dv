#!/usr/bin/env node


import fs from 'fs';
import path from 'path';


const ONE = 1n;
const PLS = '+';
const MIN = '-';
const DOT = '.';

const SPACE_VER = 4;
const SPACE_PKG = 2;

const DIR = process.cwd();
const VER = path.join(DIR, 'ver.json');
const PKG = path.join(DIR, 'package.json');


const bint = $ => BigInt($);
const canon = $ => $.map($ => Array.isArray($) ? $.join(MIN) : $).join(DOT);

const read = what => JSON.parse(fs.readFileSync(what).toString());
const write = (where, space, what) => fs.writeFileSync(where, JSON.stringify(what, null, space));

const quit = () => process.exit(0);
const bail = () => process.exit(1);

const print = (...$$) => console.log('bump:', ...$$); // eslint-disable-line no-console
const alert = (...$$) => console.error('bump:', ...$$); // eslint-disable-line no-console

// eslint-disable-next-line no-console
const help = () => console.log(`
$ npx dv                # to display current status
$ npx dv status         # to display current status
$ npx dv --help         # to display this help message
$ npx dv bump --dry-run # to see what changes will be done
$ npx dv bump           # to actually do the changes
$ npx dv bump --quiet   # to do the changes without console output

ver.json must be present next to package.json
containing array with first element being integer
`);


const ARG = process.argv.slice(2);

const CMD = 'bump' === ARG[0] ? 'bump' : 'status';
const FLG = Object.freeze({
    dry:   ARG.includes('--dry-run'),
    quiet: ARG.includes('--quiet'),
    help:  ARG.includes('--help'),
});


try {

    if (FLG.help) {
        help();
        quit();
    }

    const oldVer = read(VER);

    const pkg = JSON.parse(fs.readFileSync(PKG).toString());
    const oldPkg = pkg?.version ?? '0.0.0+0';

    if ('status' === CMD) {
        print('ver:', canon(oldVer));
        print('pkg:', oldPkg);
        quit();
    }

    const [head, ...tail] = oldVer ?? [];
    const newVer = [
        (bint(head) + ONE).toString(),
        ...(tail ?? void ONE),
    ];

    const newPkg = `${oldPkg.split(PLS)[0]}${PLS}${newVer[0]}`;

    if (!FLG.quiet) {
        print('ver:', canon(oldVer), '->', canon(newVer));
        print('pkg:', oldPkg, '->', newPkg);
    }

    if (!FLG.dry) {
        write(VER, SPACE_VER, newVer);
        write(PKG, SPACE_PKG, {...pkg, version: newPkg});
    }

} catch (e) {
    alert(e?.message ?? e);
    bail();
}
