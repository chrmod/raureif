import babel from 'broccoli-babel-transpiler';

export default function (tree, project) {
  return babel(tree, {
    babelrc: false,
    compact: false,
    plugins: [
      ...project.addons
        .map(a => a.babelOptions.plugins || [])
        .reduce((all, list) => ([...all, ...list]) , []),
    ],
    filterExtensions: [
      'js',
      ...project.addons
        .map(a => a.babelOptions.filterExtensions || [])
        .reduce((all, list) => ([...all, ...list]) , []),
    ],
    presets: [
      require.resolve('babel-preset-es2015'),
      ...project.addons
        .map(a => a.babelOptions.presets || [])
        .reduce((all, list) => ([...all, ...list]) , []),
    ],
    browserPolyfill: true,
  });
}
