import program from 'commander';
import path from 'path';
import Testem from 'testem';
import { Watcher } from 'broccoli';

import { createBuilder } from '../build-tree';
import Console from '../console';
import onBuild from '../hooks';
import { project } from './common';

program
  .command('test')
  .description('run tests with live reloading server')
  .option('--ci', 'Continuous Integration mode')
  .action((args) => {
    const { builder, hasBrowserTests } = createBuilder(project);
    const watcher = new Watcher(builder);
    const testem = new Testem();
    const modes = {
      dev: 'startDev',
      ci: 'startCI',
    };
    const testemMode = args.ci ? modes.ci : modes.dev;
    const launchers = ['Node'];
    if (hasBrowserTests()) {
      if (args.ci) {
        launchers.push('PhantomJS');
      } else {
        launchers.push('firefox');
      }
    }
    const testemConfig = {
      framework: 'mocha',
      src_files: [
        'dist/polyfill.js',
        'dist/tests.browser.js',
      ],
      launchers: {
        Node: {
          exe: 'node',
          args: [
            path.join(
              process.cwd(),
              'node_modules',
              'raureif',
              'dist',
              'runtest',
            ),
          ],
          protocol: 'tap',
        },
      },
      launch: launchers.join(','),
    };
    const test = testem[testemMode].bind(testem);
    const onError = (error) => {
      Console.error('raureif error:', error.name);
      Console.error();
      Console.error(error.message);
      Console.error();
      Console.error('raureif error stack strace:');
      Console.error(error.stack);
    };
    let running = false;


    watcher.on('buildFailure', onError);

    watcher.on('buildSuccess', () => {
      try {
        onBuild(builder, project);

        if (!running) {
          test(testemConfig);
          running = true;
        } else {
          testem.restart();
        }
      } catch (e) {
        onError(e);
      }
    });
    watcher.start();
  });
