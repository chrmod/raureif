import program from 'commander';
import printSlowNodes from 'broccoli-slow-trees';
import rimraf from 'rimraf';
import Testem from 'testem';
import path from 'path';
import execa from 'execa';
import { server as BroccoliServer, Watcher } from 'broccoli';
import CliSpinner from 'cli-spinner';

import ProjectBlueprint from './project-blueprint';
import { createBuilder } from './build-tree';

const Spinner = CliSpinner.Spinner;
const OUTPUT_PATH = 'dist';

program
  .command('new <projectName>')
  .description('creates new project')
  .action((dir) => {
    const projectPath = path.join(
      process.cwd(),
      dir
    );
    const blueprint = new ProjectBlueprint(dir);
    const spinner = new Spinner('processing.. %s');
    spinner.setSpinnerString('|/-\\');

    blueprint.create().then((result) => {
      return execa('npm', ['init', '-y'], {
        cwd: projectPath,
      });
    }).then((result) => {
      console.log(result.stdout);
      spinner.start();
      return execa('npm', ['install', 'raureif', '--save-dev'], {
        cwd: projectPath,
      });
    }).then((result) => {
      spinner.stop(true);
    }).catch(console.error);
  });

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
    const watcher = new Watcher(builder);

    watcher.on('buildSuccess', function () {
      rimraf.sync(OUTPUT_PATH);
      copy();
    });

    const server = BroccoliServer.serve(watcher, 'localhost', 3000);
  });

program
  .command('test')
  .description('run tests with live reloading server')
  .option('--ci', 'Continuous Integration mode')
  .action((args) => {
    const { builder, copy, hasBrowserTests } = createBuilder();
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

export default function (args) {
  program.parse(args);
}
