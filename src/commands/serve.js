import { server as BroccoliServer, Watcher } from 'broccoli';
import program from 'commander';

import { createBuilder } from '../build-tree';
import { project } from './common';
import onBuild from '../hooks';
import Console from '../console';

program
  .command('serve')
  .description('starts building server that watches src file changes')
  .option('-p, --port <port>', 'http serve port', 3000)
  .action(({ port }) => {
    const { builder } = createBuilder(project);
    const watcher = new Watcher(builder);

    watcher.on('buildSuccess', () => onBuild(builder, project));

    watcher.on('buildFailure', e => Console.error(e));

    BroccoliServer.serve(watcher, 'localhost', Number(port));
  });
