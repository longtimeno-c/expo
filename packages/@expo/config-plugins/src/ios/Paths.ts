import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';
import * as path from 'path';

import * as Entitlements from './Entitlements';
import { UnexpectedError } from '../utils/errors';
import { withSortedGlobResult } from '../utils/glob';
import { addWarningIOS } from '../utils/warnings';

const ignoredPaths = ['**/@(Carthage|Pods|vendor|node_modules)/**'];

/**
 * The native project directory for an Apple platform, relative to the project root. Defaults to
 * `ios`. macOS prebuilds live in a sibling `macos` directory, so the path helpers accept this so the
 * same Apple tooling can resolve files for either platform.
 */
export type AppleNativeDir = 'ios' | 'macos' | (string & {});

interface ProjectFile<L extends string = string> {
  path: string;
  language: L;
  contents: string;
}

type AppleLanguage = 'objc' | 'objcpp' | 'swift' | 'rb';

export type PodfileProjectFile = ProjectFile<'rb'>;
export type AppDelegateProjectFile = ProjectFile<AppleLanguage>;

export function getAppDelegateHeaderFilePath(projectRoot: string): string {
  const [using, ...extra] = withSortedGlobResult(
    globSync('ios/*/AppDelegate.h', {
      absolute: true,
      cwd: projectRoot,
      ignore: ignoredPaths,
    })
  );

  if (!using) {
    throw new UnexpectedError(
      `Could not locate a valid AppDelegate header at root: "${projectRoot}"`
    );
  }

  if (extra.length) {
    warnMultipleFiles({
      tag: 'app-delegate-header',
      fileName: 'AppDelegate',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

export function getAppDelegateFilePath(
  projectRoot: string,
  nativeDir: AppleNativeDir = 'ios'
): string {
  const [using, ...extra] = withSortedGlobResult(
    globSync(`${nativeDir}/*/AppDelegate.@(m|mm|swift)`, {
      absolute: true,
      cwd: projectRoot,
      ignore: ignoredPaths,
    })
  );

  if (!using) {
    throw new UnexpectedError(`Could not locate a valid AppDelegate at root: "${projectRoot}"`);
  }

  if (extra.length) {
    warnMultipleFiles({
      tag: 'app-delegate',
      fileName: 'AppDelegate',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

export function getAppDelegateObjcHeaderFilePath(projectRoot: string): string {
  const [using, ...extra] = withSortedGlobResult(
    globSync('ios/*/AppDelegate.h', {
      absolute: true,
      cwd: projectRoot,
      ignore: ignoredPaths,
    })
  );

  if (!using) {
    throw new UnexpectedError(`Could not locate a valid AppDelegate.h at root: "${projectRoot}"`);
  }

  if (extra.length) {
    warnMultipleFiles({
      tag: 'app-delegate-objc-header',
      fileName: 'AppDelegate.h',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

export function getPodfilePath(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  const [using, ...extra] = withSortedGlobResult(
    globSync(`${nativeDir}/Podfile`, {
      absolute: true,
      cwd: projectRoot,
      ignore: ignoredPaths,
    })
  );

  if (!using) {
    throw new UnexpectedError(`Could not locate a valid Podfile at root: "${projectRoot}"`);
  }

  if (extra.length) {
    warnMultipleFiles({
      tag: 'podfile',
      fileName: 'Podfile',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

function getLanguage(filePath: string): AppleLanguage {
  const extension = path.extname(filePath);
  if (!extension && path.basename(filePath) === 'Podfile') {
    return 'rb';
  }
  switch (extension) {
    case '.mm':
      return 'objcpp';
    case '.m':
    case '.h':
      return 'objc';
    case '.swift':
      return 'swift';
    default:
      throw new UnexpectedError(`Unexpected iOS file extension: ${extension}`);
  }
}

export function getFileInfo(filePath: string) {
  return {
    path: path.normalize(filePath),
    contents: readFileSync(filePath, 'utf8'),
    language: getLanguage(filePath),
  };
}

export function getAppDelegate(
  projectRoot: string,
  nativeDir: AppleNativeDir = 'ios'
): AppDelegateProjectFile {
  const filePath = getAppDelegateFilePath(projectRoot, nativeDir);
  return getFileInfo(filePath);
}

export function getSourceRoot(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  const appDelegate = getAppDelegate(projectRoot, nativeDir);
  return path.dirname(appDelegate.path);
}

export function findSchemePaths(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string[] {
  return withSortedGlobResult(
    globSync(`${nativeDir}/*.xcodeproj/xcshareddata/xcschemes/*.xcscheme`, {
      absolute: true,
      cwd: projectRoot,
      ignore: ignoredPaths,
    })
  );
}

export function findSchemeNames(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string[] {
  const schemePaths = findSchemePaths(projectRoot, nativeDir);
  return schemePaths.map((schemePath) => path.parse(schemePath).name);
}

export function getAllXcodeProjectPaths(
  projectRoot: string,
  nativeDir: AppleNativeDir = 'ios'
): string[] {
  const pbxprojPaths = withSortedGlobResult(
    globSync(`${nativeDir}/**/*.xcodeproj`, { cwd: projectRoot, ignore: ignoredPaths })
      // Drop leading `/` from glob results to mimick glob@<9 behavior
      .map((filePath) => filePath.replace(/^\//, ''))
      .filter(
        (project) => !/test|example|sample/i.test(project) || path.dirname(project) === nativeDir
      )
  ).sort((a, b) => {
    const isAInNativeDir = path.dirname(a) === nativeDir;
    const isBInNativeDir = path.dirname(b) === nativeDir;
    // preserve previous sort order
    if ((isAInNativeDir && isBInNativeDir) || (!isAInNativeDir && !isBInNativeDir)) {
      return 0;
    }
    return isAInNativeDir ? -1 : 1;
  });

  if (!pbxprojPaths.length) {
    throw new UnexpectedError(
      `Failed to locate the ${nativeDir}/*.xcodeproj files relative to path "${projectRoot}".`
    );
  }
  return pbxprojPaths.map((value) => path.join(projectRoot, value));
}

/**
 * Get the pbxproj for the given path
 */
export function getXcodeProjectPath(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  const [using = '', ...extra] = getAllXcodeProjectPaths(projectRoot, nativeDir);

  if (extra.length) {
    warnMultipleFiles({
      tag: 'xcodeproj',
      fileName: '*.xcodeproj',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

export function getAllPBXProjectPaths(
  projectRoot: string,
  nativeDir: AppleNativeDir = 'ios'
): string[] {
  const projectPaths = getAllXcodeProjectPaths(projectRoot, nativeDir);
  const paths = projectPaths
    .map((value) => path.join(value, 'project.pbxproj'))
    .filter((value) => existsSync(value));

  if (!paths.length) {
    throw new UnexpectedError(
      `Failed to locate the ${nativeDir}/*.xcodeproj/project.pbxproj files relative to path "${projectRoot}".`
    );
  }
  return paths;
}

export function getPBXProjectPath(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  const [using = '', ...extra] = getAllPBXProjectPaths(projectRoot, nativeDir);

  if (extra.length) {
    warnMultipleFiles({
      tag: 'project-pbxproj',
      fileName: 'project.pbxproj',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

export function getAllInfoPlistPaths(
  projectRoot: string,
  nativeDir: AppleNativeDir = 'ios'
): string[] {
  const paths = withSortedGlobResult(
    globSync(`${nativeDir}/*/Info.plist`, {
      absolute: true,
      cwd: projectRoot,
      ignore: ignoredPaths,
    })
  ).sort(
    // longer name means more suffixes, we want the shortest possible one to be first.
    (a, b) => a.length - b.length
  );

  if (!paths.length) {
    throw new UnexpectedError(
      `Failed to locate Info.plist files relative to path "${projectRoot}".`
    );
  }
  return paths;
}

export function getInfoPlistPath(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  const [using = '', ...extra] = getAllInfoPlistPaths(projectRoot, nativeDir);

  if (extra.length) {
    warnMultipleFiles({
      tag: 'info-plist',
      fileName: 'Info.plist',
      projectRoot,
      using,
      extra,
    });
  }

  return using;
}

export function getAllEntitlementsPaths(
  projectRoot: string,
  nativeDir: AppleNativeDir = 'ios'
): string[] {
  const paths = globSync(`${nativeDir}/*/*.entitlements`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths,
  });
  return paths;
}

/**
 * @deprecated: use Entitlements.getEntitlementsPath instead
 */
export function getEntitlementsPath(projectRoot: string): string | null {
  return Entitlements.getEntitlementsPath(projectRoot);
}

export function getSupportingPath(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  return path.resolve(
    projectRoot,
    nativeDir,
    path.basename(getSourceRoot(projectRoot, nativeDir)),
    'Supporting'
  );
}

export function getExpoPlistPath(projectRoot: string, nativeDir: AppleNativeDir = 'ios'): string {
  const supportingPath = getSupportingPath(projectRoot, nativeDir);
  return path.join(supportingPath, 'Expo.plist');
}

function warnMultipleFiles({
  tag,
  fileName,
  projectRoot,
  using,
  extra,
}: {
  tag: string;
  fileName: string;
  projectRoot?: string;
  using: string;
  extra: string[];
}) {
  const usingPath = projectRoot ? path.relative(projectRoot, using) : using;
  const extraPaths = projectRoot ? extra.map((v) => path.relative(projectRoot, v)) : extra;
  addWarningIOS(
    `paths-${tag}`,
    `Found multiple ${fileName} file paths, using "${usingPath}". Ignored paths: ${JSON.stringify(
      extraPaths
    )}`
  );
}
