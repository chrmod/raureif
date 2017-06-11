import Mocha from 'mocha';
import glob from 'glob';

const getPaths = () => {
  return glob.sync('dist/node/**/*-test.js');
};

export default function run() {
  const testPaths = getPaths();
  const mocha = new Mocha({
    ui: 'bdd',
    reporter: 'tap',
  });
  testPaths.forEach(mocha.addFile.bind(mocha));
  mocha.run()
};

if (require.main === module) {
  run();
}
