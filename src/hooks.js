import rimraf from 'rimraf';
import copyDereference from 'copy-dereference';
import notifier from 'node-notifier'

export function onBuild(builder, project) {
  rimraf.sync(project.outputPath);
  copyDereference.sync(builder.outputPath, project.outputPath)
  notifier.notify({
    title: 'raureif',
    message: 'Build complete',
    time: 1500
  });
}
