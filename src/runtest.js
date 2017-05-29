const Mocha = require('mocha');
const walk = require('walk');

const getPaths = () => {
  const paths = [];
  const options = {
    listeners: {
      file(root, state, next) {
        const path = `${root}/${state.name}`;
        if (state.name.endsWith('-test.js')) {
          paths.push(path);
        }
        next();
      }
    }
  };
  const walker = walk.walkSync('dist', options);
  return paths;
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
