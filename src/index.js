import program from 'commander';

import './commands/new';
import './commands/build';
import './commands/serve';
import './commands/test';
import './commands/info';

export default function (args) {
  program.parse(args);
}
