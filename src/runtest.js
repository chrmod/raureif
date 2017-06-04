const Mocha = require('mocha');
const glob = require('glob');

const getPaths = () => {
  return glob.sync('dist/node/**/*-test.js');
};

const run = () => {
  const testPaths = getPaths();
  const mocha = new Mocha({
    ui: 'bdd',
    reporter: 'tap',
  });
  testPaths.forEach(mocha.addFile.bind(mocha));
  mocha.run()
};

module.exports = run;

if (require.main === module) {
  run();
}
