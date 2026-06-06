"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSchemeNames = findSchemeNames;
exports.findSchemePaths = findSchemePaths;
exports.getAllEntitlementsPaths = getAllEntitlementsPaths;
exports.getAllInfoPlistPaths = getAllInfoPlistPaths;
exports.getAllPBXProjectPaths = getAllPBXProjectPaths;
exports.getAllXcodeProjectPaths = getAllXcodeProjectPaths;
exports.getAppDelegate = getAppDelegate;
exports.getAppDelegateFilePath = getAppDelegateFilePath;
exports.getAppDelegateHeaderFilePath = getAppDelegateHeaderFilePath;
exports.getAppDelegateObjcHeaderFilePath = getAppDelegateObjcHeaderFilePath;
exports.getEntitlementsPath = getEntitlementsPath;
exports.getExpoPlistPath = getExpoPlistPath;
exports.getFileInfo = getFileInfo;
exports.getInfoPlistPath = getInfoPlistPath;
exports.getPBXProjectPath = getPBXProjectPath;
exports.getPodfilePath = getPodfilePath;
exports.getSourceRoot = getSourceRoot;
exports.getSupportingPath = getSupportingPath;
exports.getXcodeProjectPath = getXcodeProjectPath;
function _fs() {
  const data = require("fs");
  _fs = function () {
    return data;
  };
  return data;
}
function _glob() {
  const data = require("glob");
  _glob = function () {
    return data;
  };
  return data;
}
function path() {
  const data = _interopRequireWildcard(require("path"));
  path = function () {
    return data;
  };
  return data;
}
function Entitlements() {
  const data = _interopRequireWildcard(require("./Entitlements"));
  Entitlements = function () {
    return data;
  };
  return data;
}
function _errors() {
  const data = require("../utils/errors");
  _errors = function () {
    return data;
  };
  return data;
}
function _glob2() {
  const data = require("../utils/glob");
  _glob2 = function () {
    return data;
  };
  return data;
}
function _warnings() {
  const data = require("../utils/warnings");
  _warnings = function () {
    return data;
  };
  return data;
}
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ignoredPaths = ['**/@(Carthage|Pods|vendor|node_modules)/**'];

/**
 * The native project directory for an Apple platform, relative to the project root. Defaults to
 * `ios`. macOS prebuilds live in a sibling `macos` directory, so the path helpers accept this so the
 * same Apple tooling can resolve files for either platform.
 */

function getAppDelegateHeaderFilePath(projectRoot) {
  const [using, ...extra] = (0, _glob2().withSortedGlobResult)((0, _glob().globSync)('ios/*/AppDelegate.h', {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  }));
  if (!using) {
    throw new (_errors().UnexpectedError)(`Could not locate a valid AppDelegate header at root: "${projectRoot}"`);
  }
  if (extra.length) {
    warnMultipleFiles({
      tag: 'app-delegate-header',
      fileName: 'AppDelegate',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getAppDelegateFilePath(projectRoot, nativeDir = 'ios') {
  const [using, ...extra] = (0, _glob2().withSortedGlobResult)((0, _glob().globSync)(`${nativeDir}/*/AppDelegate.@(m|mm|swift)`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  }));
  if (!using) {
    throw new (_errors().UnexpectedError)(`Could not locate a valid AppDelegate at root: "${projectRoot}"`);
  }
  if (extra.length) {
    warnMultipleFiles({
      tag: 'app-delegate',
      fileName: 'AppDelegate',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getAppDelegateObjcHeaderFilePath(projectRoot) {
  const [using, ...extra] = (0, _glob2().withSortedGlobResult)((0, _glob().globSync)('ios/*/AppDelegate.h', {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  }));
  if (!using) {
    throw new (_errors().UnexpectedError)(`Could not locate a valid AppDelegate.h at root: "${projectRoot}"`);
  }
  if (extra.length) {
    warnMultipleFiles({
      tag: 'app-delegate-objc-header',
      fileName: 'AppDelegate.h',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getPodfilePath(projectRoot, nativeDir = 'ios') {
  const [using, ...extra] = (0, _glob2().withSortedGlobResult)((0, _glob().globSync)(`${nativeDir}/Podfile`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  }));
  if (!using) {
    throw new (_errors().UnexpectedError)(`Could not locate a valid Podfile at root: "${projectRoot}"`);
  }
  if (extra.length) {
    warnMultipleFiles({
      tag: 'podfile',
      fileName: 'Podfile',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getLanguage(filePath) {
  const extension = path().extname(filePath);
  if (!extension && path().basename(filePath) === 'Podfile') {
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
      throw new (_errors().UnexpectedError)(`Unexpected iOS file extension: ${extension}`);
  }
}
function getFileInfo(filePath) {
  return {
    path: path().normalize(filePath),
    contents: (0, _fs().readFileSync)(filePath, 'utf8'),
    language: getLanguage(filePath)
  };
}
function getAppDelegate(projectRoot, nativeDir = 'ios') {
  const filePath = getAppDelegateFilePath(projectRoot, nativeDir);
  return getFileInfo(filePath);
}
function getSourceRoot(projectRoot, nativeDir = 'ios') {
  const appDelegate = getAppDelegate(projectRoot, nativeDir);
  return path().dirname(appDelegate.path);
}
function findSchemePaths(projectRoot, nativeDir = 'ios') {
  return (0, _glob2().withSortedGlobResult)((0, _glob().globSync)(`${nativeDir}/*.xcodeproj/xcshareddata/xcschemes/*.xcscheme`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  }));
}
function findSchemeNames(projectRoot, nativeDir = 'ios') {
  const schemePaths = findSchemePaths(projectRoot, nativeDir);
  return schemePaths.map(schemePath => path().parse(schemePath).name);
}
function getAllXcodeProjectPaths(projectRoot, nativeDir = 'ios') {
  const pbxprojPaths = (0, _glob2().withSortedGlobResult)((0, _glob().globSync)(`${nativeDir}/**/*.xcodeproj`, {
    cwd: projectRoot,
    ignore: ignoredPaths
  })
  // Drop leading `/` from glob results to mimick glob@<9 behavior
  .map(filePath => filePath.replace(/^\//, '')).filter(project => !/test|example|sample/i.test(project) || path().dirname(project) === nativeDir)).sort((a, b) => {
    const isAInNativeDir = path().dirname(a) === nativeDir;
    const isBInNativeDir = path().dirname(b) === nativeDir;
    // preserve previous sort order
    if (isAInNativeDir && isBInNativeDir || !isAInNativeDir && !isBInNativeDir) {
      return 0;
    }
    return isAInNativeDir ? -1 : 1;
  });
  if (!pbxprojPaths.length) {
    throw new (_errors().UnexpectedError)(`Failed to locate the ${nativeDir}/*.xcodeproj files relative to path "${projectRoot}".`);
  }
  return pbxprojPaths.map(value => path().join(projectRoot, value));
}

/**
 * Get the pbxproj for the given path
 */
function getXcodeProjectPath(projectRoot, nativeDir = 'ios') {
  const [using = '', ...extra] = getAllXcodeProjectPaths(projectRoot, nativeDir);
  if (extra.length) {
    warnMultipleFiles({
      tag: 'xcodeproj',
      fileName: '*.xcodeproj',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getAllPBXProjectPaths(projectRoot, nativeDir = 'ios') {
  const projectPaths = getAllXcodeProjectPaths(projectRoot, nativeDir);
  const paths = projectPaths.map(value => path().join(value, 'project.pbxproj')).filter(value => (0, _fs().existsSync)(value));
  if (!paths.length) {
    throw new (_errors().UnexpectedError)(`Failed to locate the ${nativeDir}/*.xcodeproj/project.pbxproj files relative to path "${projectRoot}".`);
  }
  return paths;
}
function getPBXProjectPath(projectRoot, nativeDir = 'ios') {
  const [using = '', ...extra] = getAllPBXProjectPaths(projectRoot, nativeDir);
  if (extra.length) {
    warnMultipleFiles({
      tag: 'project-pbxproj',
      fileName: 'project.pbxproj',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getAllInfoPlistPaths(projectRoot, nativeDir = 'ios') {
  const paths = (0, _glob2().withSortedGlobResult)((0, _glob().globSync)(`${nativeDir}/*/Info.plist`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  })).sort(
  // longer name means more suffixes, we want the shortest possible one to be first.
  (a, b) => a.length - b.length);
  if (!paths.length) {
    throw new (_errors().UnexpectedError)(`Failed to locate Info.plist files relative to path "${projectRoot}".`);
  }
  return paths;
}
function getInfoPlistPath(projectRoot, nativeDir = 'ios') {
  const [using = '', ...extra] = getAllInfoPlistPaths(projectRoot, nativeDir);
  if (extra.length) {
    warnMultipleFiles({
      tag: 'info-plist',
      fileName: 'Info.plist',
      projectRoot,
      using,
      extra
    });
  }
  return using;
}
function getAllEntitlementsPaths(projectRoot, nativeDir = 'ios') {
  const paths = (0, _glob().globSync)(`${nativeDir}/*/*.entitlements`, {
    absolute: true,
    cwd: projectRoot,
    ignore: ignoredPaths
  });
  return paths;
}

/**
 * @deprecated: use Entitlements.getEntitlementsPath instead
 */
function getEntitlementsPath(projectRoot) {
  return Entitlements().getEntitlementsPath(projectRoot);
}
function getSupportingPath(projectRoot, nativeDir = 'ios') {
  return path().resolve(projectRoot, nativeDir, path().basename(getSourceRoot(projectRoot, nativeDir)), 'Supporting');
}
function getExpoPlistPath(projectRoot, nativeDir = 'ios') {
  const supportingPath = getSupportingPath(projectRoot, nativeDir);
  return path().join(supportingPath, 'Expo.plist');
}
function warnMultipleFiles({
  tag,
  fileName,
  projectRoot,
  using,
  extra
}) {
  const usingPath = projectRoot ? path().relative(projectRoot, using) : using;
  const extraPaths = projectRoot ? extra.map(v => path().relative(projectRoot, v)) : extra;
  (0, _warnings().addWarningIOS)(`paths-${tag}`, `Found multiple ${fileName} file paths, using "${usingPath}". Ignored paths: ${JSON.stringify(extraPaths)}`);
}
//# sourceMappingURL=Paths.js.map