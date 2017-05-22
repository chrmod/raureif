#!/usr/bin/env node

const program = require('commander');
const printSlowNodes = require('broccoli-slow-trees');
const rimraf = require('rimraf');
const Testem = require('testem');
const path = require('path');

const { createWatcher, createBuilder } = require('../src/build-tree');
const runtest = require('../src/commands/runtest');

const OUTPUT_PATH = 'dist';

program
  .command('build')
  .description('builds the project into \'dist\' directory')
  .action(() => {
    const { builder, copy } = createBuilder();

    rimraf.sync(OUTPUT_PATH);

    builder.build().then(() => {
      return copy();
    }).then(() => {
      console.log('Build successful');
    }).catch(error => {
      console.error('Something went wrong', error);
    });
  });

program
  .command('serve')
  .description('starts building server that watches src file changes')
  .action(() => {
    const { builder, copy } = createBuilder();
    const watcher = createWatcher(builder);

    watcher.on('buildSuccess', function () {
      console.log('update', builder.outputNodeWrapper.buildState.totalTime)

      printSlowNodes(builder.outputNodeWrapper);
      rimraf.sync(OUTPUT_PATH);
      copy();
    });

    watcher.on('buildFailure', function () {
      console.error(arguments);
      // TODO
    });

    watcher.start().catch((error) => {
      console.log('Something went wrong', error);
    });
  });

program
  .command('test')
  .description('run tests with live reloading server')
  .option('--ci', 'Continuous Integration mode')
  .action((args) => {
    const { builder, copy, hasBrowserTests } = createBuilder();
    const watcher = createWatcher(builder);
    const testem = new Testem();
    const modes = {
      'dev': 'startDev',
      'ci': 'startCI',
    };
    const testemMode = args.ci ? modes.ci : modes.dev;
    const launchers = ['Node'];
    let running = false;

    if (hasBrowserTests()) {
      launchers.push('firefox');
    }

    watcher.on('buildFailure', function (error) {
      console.error('raureif error:', error.name)
      console.error()
      console.error(error.message)
      console.error()
      console.error('raureif error stack strace:')
      console.error(error.stack)
    });

    watcher.on('buildSuccess', function () {
      rimraf.sync(OUTPUT_PATH);
      copy();

      if (!running) {
        testem[testemMode]({
          framework: 'mocha',
          src_files: [
            'dist/browser/index.browser.js'
          ],
          launchers: {
            'Node': {
              exe: 'node',
              args: [
                path.join(
                  process.cwd(),
                  'node_modules',
                  'raureif',
                  'src',
                  'commands',
                  'runtest'
                )
              ],
              protocol: 'tap',
            },
          },
          launch: launchers.join(',')
        });
        running = true;
      } else {
        testem.restart();
      }
    });
    watcher.start();
  });

program.parse(process.argv);
