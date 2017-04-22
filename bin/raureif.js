#!/usr/bin/env node

const program = require('commander');
const printSlowNodes = require('broccoli-slow-trees');
const rimraf = require('rimraf');
const Mocha = require('mocha');
const walk = require('walk');
const Testem = require('testem');

const { createWatcher, createBuilder } = require('../src/build-tree');

const OUTPUT_PATH = 'dist';

program
  .command('build')
  .action(() => {
    const { builder, copy } = createBuilder();

    rimraf.sync(OUTPUT_PATH);

    builder.build().then(() => {
      return copy();
    }).then(() => {
      console.log("Build successful");
    }).catch(error => {
      console.error("Something went wrong", error);
    });
  });

program
  .command('serve')
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
      console.log("Something went wrong", error);
    });
  });

program
  .command('test')
  .option('--ci', 'Continuous Integration mode')
  .action((args) => {
    const { builder, copy } = createBuilder();
    const watcher = createWatcher(builder);
    const testem = new Testem();
    const modes = {
      'dev': 'startDev',
      'ci': 'startCI',
    };
    const testemMode = args.ci ? modes.ci : modes.dev;
    let running = false;

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
          launchers: {
            'Node': {
              exe: 'raureif',
              args: ['runtest'],
              protocol: 'tap',
            },
          },
          launch: 'Node'
        });
        running = true;
      } else {
        testem.restart();
      }
    });
    watcher.start();
  });

program
  .command('runtest')
  .action(function (args, done) {
    return new Promise(resolve => {
      const paths = [];
      const walker = walk.walk('dist');
      walker.on('file', (root, state, next) => {
        const path = `${root}/${state.name}`;
        if (state.name.endsWith('-test.js')) {
          paths.push(path);
        }
        next();
      });
      walker.on('end', () => resolve(paths));
    }).then(testPaths => {
      const mocha = new Mocha({
        ui: 'bdd',
        reporter: 'tap',
      });
      testPaths.forEach(mocha.addFile.bind(mocha));
      mocha.run()
    });
  });

program.parse(process.argv);
