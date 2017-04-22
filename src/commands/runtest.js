const Mocha = require('mocha');
const walk = require('walk');

const getPaths = () => {
  return new Promise(resolve => {
    const paths = [];
    const walker = walk.walk('dist');
    walker.on('file', (root, state, next) => {
      const path = `${root}/${state.name}`;
      if (state.name.endsWith('-test.js')) {
        paths.push(path);
      }
      next();
    });
    walker.on('end', () => resolve(paths));
  });
};

module.exports = function () {
  getPaths().then(testPaths => {
    const mocha = new Mocha({
      ui: 'bdd',
      reporter: 'tap',
    });
    testPaths.forEach(mocha.addFile.bind(mocha));
    mocha.run()
  });
}
