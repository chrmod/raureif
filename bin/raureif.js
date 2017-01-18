#!/usr/bin/env node

const program = require('commander');
const broccoli = require('broccoli');
const MergeTrees = require('broccoli-merge-trees');
const broccoliSource = require('broccoli-source');
const babel = require('broccoli-babel-transpiler');
const printSlowNodes = require('broccoli-slow-trees');
const copyDereference = require('copy-dereference');
const path = require('path');
const rimraf = require('rimraf');
const Mocha = require('mocha');
const walk = require('walk');

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
  return babel(tree);
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
      // TODO
    });

    watcher.start().catch((error) => {
      console.log("Something went wrong", error);
    });
  });

program
  .command('test')
  .action((args, done) => {
    const { builder, copy } = createBuilder();
    const watcher = createWatcher(builder);

    const Testem = require('testem');
    const testem = new Testem();
    watcher.on('buildSuccess', function () {
      rimraf.sync(OUTPUT_PATH);
      copy();
      testem.restart();
    });
    watcher.start();
    testem.startDev({
      launchers: {
        'Slow trees': {
          exe: 'raureif',
          args: ['runtest']
        },
      },
      launch: 'Slow trees'
    });
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
