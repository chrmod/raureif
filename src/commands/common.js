import Project from '../models/project';

export default function () {
  return new Project({
    projectPath: process.cwd(),
    outputPath: 'dist',
  });
}
