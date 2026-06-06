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
export declare function getAppDelegateHeaderFilePath(projectRoot: string): string;
export declare function getAppDelegateFilePath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function getAppDelegateObjcHeaderFilePath(projectRoot: string): string;
export declare function getPodfilePath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function getFileInfo(filePath: string): {
    path: string;
    contents: string;
    language: AppleLanguage;
};
export declare function getAppDelegate(projectRoot: string, nativeDir?: AppleNativeDir): AppDelegateProjectFile;
export declare function getSourceRoot(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function findSchemePaths(projectRoot: string, nativeDir?: AppleNativeDir): string[];
export declare function findSchemeNames(projectRoot: string, nativeDir?: AppleNativeDir): string[];
export declare function getAllXcodeProjectPaths(projectRoot: string, nativeDir?: AppleNativeDir): string[];
/**
 * Get the pbxproj for the given path
 */
export declare function getXcodeProjectPath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function getAllPBXProjectPaths(projectRoot: string, nativeDir?: AppleNativeDir): string[];
export declare function getPBXProjectPath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function getAllInfoPlistPaths(projectRoot: string, nativeDir?: AppleNativeDir): string[];
export declare function getInfoPlistPath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function getAllEntitlementsPaths(projectRoot: string, nativeDir?: AppleNativeDir): string[];
/**
 * @deprecated: use Entitlements.getEntitlementsPath instead
 */
export declare function getEntitlementsPath(projectRoot: string): string | null;
export declare function getSupportingPath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export declare function getExpoPlistPath(projectRoot: string, nativeDir?: AppleNativeDir): string;
export {};
