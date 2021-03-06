import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const os = require('os');
const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options){
    return copy(options.templateDirectory, options.targetDirectory + '/' + options.nameProject, {
        clobber: false,
    });
}

async function initGit(options) {
    const result = await execa('git', ['init'], {
        cwd: options.targetDirectory + '/' + options.nameProject,
    })
    if(result.failed){
        return Promise.reject(new Error('Failed to initialize Git'));
    }
    return;
}

async function printLogo() {
    console.log(chalk.red.bold(`
-----------------------------------------------------------------
                 o         _        _            _
      _o        /\\_      _ \\\\o     (_)\\__/o     (_)
    _< \\_      _>(_)    (_)/<_       \\_| \\      _|/' \\/
    (_)>(_)    (_)           (_)      (_)       (_)'  _\\o_
-----------------------------------------------------------------`))
}

export async function createProject(options){
    options = {
        ... options,
        targetDirectory: options.targetDirectory || process.cwd(),
    }
    const currentFileUrl = (os.EOL=="\r\n") ? (new URL(import.meta.url).pathname).substring(1) : (new URL(import.meta.url).pathname);
    const templateDir = path.resolve(
        currentFileUrl,
        '../../templates',
        options.template.toLowerCase()
    );
    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR!'));
        process.exit(1);
    }

    const tasks = new Listr([
        {
            title: 'Create by Chinhhi',
            task: () => printLogo(),
            enabled: () => options.logo
        },
        {
            title: ('Create files ' + chalk.green.bold('success!')),
            task: () => copyTemplateFiles(options),
        },
        {
            title: 'Initialize git',
            task: () => initGit(options),
            enabled: () => options.git
        },
        {
            title: 'Install dependencies',
            task: () => projectInstall({
                cwd: options.targetDirectory  + '/' + options.nameProject,
            }),
            skip: () => !options.runInstall ? 'Pass --install to automatically install dependencies' : undefined,
        }
    ]);

    await tasks.run();

    console.log('%s Project ready', chalk.green.bold('Done'));
    return true;
}