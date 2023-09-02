
// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { exec } = require('node:child_process');
const config = require('./src/config');
const { forStrictNullCheckEligibleFiles } = require('./src/getStrictNullCheckEligibleFiles');

const projectRoot = path.join(process.cwd(), process.argv[2]);

forStrictNullCheckEligibleFiles(projectRoot, () => { }).then(async (files) => {
    const tsconfigPath = path.join(projectRoot, config.targetTsconfig);

    for (const file of files) {
        const child = exec(`npx tsc -p ${tsconfigPath}`);
        await tryAutoAddStrictNulls(child, tsconfigPath, file);
    }
});

function tryAutoAddStrictNulls(child, tsconfigPath, file) {
    const relativeFilePath = path.relative(projectRoot, file).replace(/\\/g, '/');
    console.log(`Trying to auto add '${relativeFilePath}'`);

    const originalConifg = JSON.parse(fs.readFileSync(tsconfigPath).toString());
    originalConifg.files = Array.from(new Set((originalConifg.files || []).sort()));

    const newConfig = Object.assign({}, originalConifg);
    newConfig.files = Array.from(new Set(originalConifg.files.concat('./' + relativeFilePath).sort()));

    fs.writeFileSync(tsconfigPath, JSON.stringify(newConfig, null, '\t'));
    let hasErrors = false;

    return new Promise(resolve => {
        child.stdout.on('data', (data) => {
            const textOut = data.toString();
            const match = /error\sTS\d+/.exec(textOut);

            if (match) {
                hasErrors = true;
            }
        });
        child.stdout.on('end', () => {
            if (hasErrors) {
                console.log(`${relativeFilePath} has compilation errors. Not adding.`);
                fs.writeFileSync(tsconfigPath, JSON.stringify(originalConifg, null, '\t'));
            } else {
                console.log(`No compilation errors, adding ${relativeFilePath} to tsconfig.files`);
                fs.writeFileSync(tsconfigPath, JSON.stringify(newConfig, null, '\t'));
            }
            resolve(void 0);
        });
    });
}
