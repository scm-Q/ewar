#!/usr/bin/env node
/*
 * @Date: 2019-09-06 11:25:00
 * @Author: mkyo <ejbscm@hotmail.com>
 * @Description: If you have some questions, please contact: ejbscm@hotmail.com.
 */
const { spawn } = require('child_process');
const program = require('commander');

program.version('v' + require('./package.json').version)
  .description('uglify and add version of war archive files')

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('./package.json');
updater({ pkg }).notify({ defer: true });

program.command('unzip <source>')
    .alias('u')
    .description('unzip the war to the specified directory')
    .option('--tmpDir <file path>','unzip to tmp target dir')
    .action(function(source, options) {
        process.env.source = source;
        options = {
            source: source,
            tmpDir: options.tmpDir || './tmp'
        };
        runCommand('unzip', options);
    });

program.command('clean <tmpDir>')
        .description('clean the tmpDir files dir')
        .action(function(tmpDir){
            runCommand('del:tmp',{
                tmpDir: tmpDir
            })
        });

program.command('minifycss <source>')
        .alias('mcss')
        .description('mimify the sourceDir css files')
        .action(function(sourceDir){
            runCommand('minifycss',{
                tmpDir: sourceDir
            })
}); 

program.command('uglifyjs <source>')
        .alias('ujs')
        .description('uglify the sourceDir js files')
        .option('--v <version>','add js request version,  avoid js cache')
        .action(function(sourceDir, options){
            runCommand('uglifyjs',{
                tmpDir: sourceDir,
                version: options.v
            })
});

program.command('addversion <source>')
        .alias('av')
        .description('add js,css,html resources version')
        .option('--v <version>','add static resouces request version,  avoid cache')
        .action(function(sourceDir, options){
            runCommand('add-version',{
                tmpDir: sourceDir,
                version: options.v
            })
});

program.command('checkjs <source>')
        .alias('cjs')
        .description('check the sourceDir js syntax')
        .action(function(sourceDir){
            runCommand('check-js',{
                tmpDir: sourceDir
            })
});

program.command('checkhtml <source>')
        .alias('chtml')
        .description('check the sourceDir html syntax')
        .action(function(sourceDir){
            runCommand('check-html',{
                tmpDir: sourceDir
            })
});

program.command('minifyhtml <source>')
        .alias('mhtml')
        .description('add js request version and uglify html files')
        .option('--v <version>','add js request version in html')
        .action(function(sourceDir, options){
            runCommand('minifyHtml',{
                tmpDir: sourceDir,
                version: options.v
            })
});

program.command('compile <source>')
    .description('compile files includes css, html, js')
    .action(function(source, options) {
        runCommand('compile', {
            tmpDir: source
        });
    });

program.command('zip <source>')
    .description('zip all files to *.zip')
    .option('--name <name>', 'zip package name')
    .option('--output <output>', 'output zip package dir, default: ./output')
    .action(function(source, options) {
        options = {
            tmpDir: source,
            output: options.output,
            zipName: options.name || 'package'
        };
        runCommand('zip', options);
    });   
    
program.command('*')
  .action(function (cmd) {
    console.log('ewar: \'%s\' is not an ewar command. See \'ewar --help\'.', cmd)
  })

program.parse(process.argv);

if (program.args.length === 0) {
  program.help()
}

function setEnv(options){
    let opts = options || {};
    if(!opts.tmpDir){
        opts.tmpDir = '.';
    }
    for(let [key, value] of Object.entries(opts)){
        if(value !== undefined)
            process.env[key] = value;
    }
}

function runCommand(command, args) {
    console.log('>> easy-war, command => %s, args =>', command, args);
    setEnv(args);
    const cp = spawn(
        'gulp',
        [command],
        {
        cwd: process.cwd(),
        },
    );
    cp.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    cp.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    cp.on('close', (code) => {
    console.log(`执行命令完成，code： ${code}.`);
    });
    cp.on('error', err => {
    console.log(err);
    });
}
