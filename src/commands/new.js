import CliSpinner from 'cli-spinner';
import execa from 'execa';
import path from 'path';
import program from 'commander';

import ProjectBlueprint from '../project-blueprint';

program
  .command('new <projectName>')
  .description('creates new project')
  .action((dir) => {
    const projectPath = path.join(
      process.cwd(),
      dir
    );
    const blueprint = new ProjectBlueprint(dir);
    const spinner = new CliSpinner.Spinner('processing.. %s');
    spinner.setSpinnerString('|/-\\');

    blueprint.create().then((result) => {
      return execa('npm', ['init', '-y'], {
        cwd: projectPath,
      });
    }).then((result) => {
      console.log(result.stdout);
      return execa('git', ['init'], {
        cwd: projectPath,
      });
    }).then((result) => {
      return execa('git', ['add', '.'], {
        cwd: projectPath,
      });
    }).then((result) => {
      return execa('git', ['commit', '-a', '-m', 'initial commit'], {
        cwd: projectPath,
      });
    }).then(() => {
      spinner.start();
      return execa('npm', ['install', 'raureif', '--save-dev'], {

        cwd: projectPath,
      });
    }).then((result) => {
      spinner.stop(true);
    }).catch(console.error);
  });
