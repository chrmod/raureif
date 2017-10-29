import CliSpinner from 'cli-spinner';
import execa from 'execa';
import path from 'path';
import program from 'commander';
import Console from '../console';

import ProjectBlueprint from '../models/project-blueprint';

program
  .command('new <projectName>')
  .description('creates new project')
  .action((dir) => {
    const projectPath = path.join(
      process.cwd(),
      dir,
    );
    const blueprint = new ProjectBlueprint(dir);
    const spinner = new CliSpinner.Spinner('processing.. %s');
    spinner.setSpinnerString('|/-\\');

    blueprint.create()
      .then(() => {
        Console.log('Installing yarn');
        spinner.start();
        return execa('npm', ['install', '--save-dev', 'yarn'], {
          cwd: projectPath,
        });
      })
      .then(() => {
        spinner.stop(true);
        return execa('yarn', ['init', '-y'], {
          cwd: projectPath,
        });
      })
      .then(() => {
        Console.log('Installing dependencies');
        spinner.start();
        return execa('yarn', ['install'], {
          cwd: projectPath,
        });
      })
      .then((result) => {
        spinner.stop(true);
        Console.log(result.stdout);
        return execa('git', ['init'], {
          cwd: projectPath,
        });
      })
      .then(() => execa('git', ['add', '.'], { cwd: projectPath }))
      .then(() => execa('git', ['commit', '-a', '-m', 'initial commit'], { cwd: projectPath }))
      .catch(Console.error);
  });
