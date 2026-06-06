import { sync as globSync } from 'glob';

import { CommandError } from '../../../utils/errors';
import type { ProjectInfo } from '../XcodeBuild.types';

const ignoredPaths = ['**/@(Carthage|Pods|vendor|node_modules)/**'];

function findXcodeProjectPaths(
  projectRoot: string,
  extension: 'xcworkspace' | 'xcodeproj',
  nativeDir: 'ios' | 'macos' = 'ios'
): string[] {
  return globSync(`${nativeDir}/*.${extension}`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths,
  });
}

/**
 * Return the path and type of Xcode project in the given folder. Apple platforms share the same
 * Xcode project format, so the native directory (`ios` or `macos`) is configurable.
 */
export function resolveXcodeProject(
  projectRoot: string,
  nativeDir: 'ios' | 'macos' = 'ios'
): ProjectInfo {
  let paths = findXcodeProjectPaths(projectRoot, 'xcworkspace', nativeDir);
  if (paths.length) {
    return {
      // Use full path instead of relative project root so that warnings and errors contain full paths as well, this helps with filtering.
      // Also helps keep things consistent in monorepos.
      name: paths[0]!,
      // name: path.relative(projectRoot, paths[0]),
      isWorkspace: true,
    };
  }
  paths = findXcodeProjectPaths(projectRoot, 'xcodeproj', nativeDir);
  if (paths.length) {
    return { name: paths[0]!, isWorkspace: false };
  }
  throw new CommandError(
    'IOS_MALFORMED',
    `Xcode project not found in project: ${projectRoot}. You can generate a project with \`npx expo prebuild -p ${nativeDir}\``
  );
}
