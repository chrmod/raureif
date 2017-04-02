#!/usr/bin/env node

const program = require('commander');
const broccoli = require('broccoli');
const MergeTrees = require('broccoli-merge-trees');
const broccoliSource = require('broccoli-source');
const babel = require('broccoli-babel-transpiler');
const babelPreset2015 = require('babel-preset-es2015');
const watchify = require('broccoli-watchify');
const printSlowNodes = require('broccoli-slow-trees');
const copyDereference = require('copy-dereference');
const path = require('path');
const rimraf = require('rimraf');
const Mocha = require('mocha');
const walk = require('walk');
const Testem = require('testem');

const copyDereferenceSync = copyDereference.sync;
const Watcher = broccoli.Watcher;
const Builder = broccoli.Builder;
const WatchedDir = broccoliSource.WatchedDir;

const OUTPUT_PATH = 'dist';

const createBuildTree = () => {
  const basePath = process.cwd();
  const sourceTree = new WatchedDir(path.join(basePath, 'src'));
  const testsTree = new WatchedDir(path.join(basePath, 'tests'));
  const tree = new MergeTrees([
    sourceTree,
    testsTree,
  ]);
  const transpiledTree = babel(tree, {
    presets: [
      babelPreset2015,
    ]
  });
  const options = {
    browserify: {
      entries: ['./index.js'],
      paths: [basePath + '/node_modules'],
      debug: false
    },
    outputFile: '/index.browser.js',
    cache: true,
  };
  return new MergeTrees([
    transpiledTree,
    watchify(transpiledTree, options),
  ]);
};

const createWatcher = (builder) => {
  const watcher = new Watcher(builder);

  return {
    start() {
      return watcher.start();
    },
    on(eventName, cb) {
      watcher.on(eventName, cb);
    },
  }
};

const createBuilder = () => {
  const tree = createBuildTree();
  const builder = new Builder(tree);

  return {
    builder,
    copy() {
      copyDereferenceSync(builder.outputPath, OUTPUT_PATH)
    },
    cleanup() {
      builder.cleanup()
    },
  };
};

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
    const mocha = new Mocha({
      ui: 'bdd',
      reporter: 'tap',
    });

    const walker = walk.walk('dist');
    walker.on('file', (root, state, next) => {
      const testPath = `${root}/${state.name}`;
      if (state.name.endsWith('-test.js')) {
        mocha.addFile(testPath);
      }
      next();
    });
    walker.on('end', function () { mocha.run(); });
  });

program.parse(process.argv);
