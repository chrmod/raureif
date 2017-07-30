import program from 'commander';
import printSlowNodes from 'broccoli-slow-trees';
import rimraf from 'rimraf';
import path from 'path';
import { server as BroccoliServer, Watcher } from 'broccoli';
import Testem from 'testem';

import { createBuilder } from '../build-tree';

import { OUTPUT_PATH, project } from './common';

program
  .command('test')
  .description('run tests with live reloading server')
  .option('--ci', 'Continuous Integration mode')
  .action((args) => {
    const { builder, copy, hasBrowserTests } = createBuilder(project);
    const watcher = new Watcher(builder);
    const testem = new Testem();
    const modes = {
      'dev': 'startDev',
      'ci': 'startCI',
    };
    const testemMode = args.ci ? modes.ci : modes.dev;
    const launchers = ['Node'];
    let running = false;

    if (hasBrowserTests()) {
      if (args.ci) {
        launchers.push('PhantomJS');
      } else {
        launchers.push('firefox');
      }
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
            'dist/polyfill.js',
            'dist/tests.browser.js'
          ],
          launchers: {
            'Node': {
              exe: 'node',
              args: [
                path.join(
                  process.cwd(),
                  'node_modules',
                  'raureif',
                  'dist',
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
