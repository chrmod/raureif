import chai from 'chai';
import Mocha from 'mocha';
import glob from 'glob';

global.chai = chai;

const getPaths = () => glob.sync('dist/tests/node/**/*-test.js');

export default function run() {
  const testPaths = getPaths();
  const mocha = new Mocha({
    ui: 'bdd',
    reporter: 'tap',
  });
  testPaths.forEach(mocha.addFile.bind(mocha));
  mocha.run();
}

if (require.main === module) {
  run();
}
