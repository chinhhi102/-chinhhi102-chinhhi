import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArgumentsIntoOptions(rawArgs){
    const args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '--name': String,
            '--logo': Boolean,
            '-g': '--git',
            '-y': '--yes',
            '-i': '--install',
            '-n': '--name'
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    return {
        logo: args['--logo'] || false,
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        nameProject: args['--name'],
        runInstall: args['--install'] || false,
    };
}

async function promptForMissingOptions(options){
    const defaultTemplate = 'C++';
    const defaultName = "untitle";
    if(options.skipPrompts){
        return {
            ... options,
            template: options.template || defaultTemplate,
            nameProject: options.nameProject || defaultName
        }
    }

    const questions = [];
    if(!options.template){
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please choose which project template to use',
            choices: ['JavaScript', 'TypeScript', 'C++'],
            default: defaultTemplate
        })
    }

    if(options.nameProject == undefined){
        questions.push({
            type: 'input',
            name: 'nameProject',
            message: 'Type name project: ',
            default: defaultName
        })
    }

    // if(!options.git){
    //     questions.push({
    //         type: 'confirm',
    //         name: 'git',
    //         message: 'Initiaize a git repository?',
    //         default: false
    //     })
    // }

    const answers = await inquirer.prompt(questions);

    return {
        ... options,
        template: options.template || answers.template,
        nameProject: options.nameProject || answers.nameProject,
        git: options.git || answers.git
    }
}

export async function cli(args){
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createProject(options);
}