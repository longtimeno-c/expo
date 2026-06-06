import type { JSONObject, JSONValue } from '@expo/json-file';
import type { XcodeProject } from 'xcode';
import type { ForwardedBaseModOptions } from './createBaseMod';
import type { ExportedConfig } from '../Plugin.types';
import { Paths } from '../ios';
import type { InfoPlist } from '../ios/IosConfig.types';
declare function getAppleModFileProviders(nativeDir?: Paths.AppleNativeDir): {
    dangerous: import("./createBaseMod").BaseModProviderMethods<unknown, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    finalized: import("./createBaseMod").BaseModProviderMethods<unknown, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    appDelegate: import("./createBaseMod").BaseModProviderMethods<Paths.AppDelegateProjectFile, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    expoPlist: import("./createBaseMod").BaseModProviderMethods<JSONObject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    xcodeproj: import("./createBaseMod").BaseModProviderMethods<XcodeProject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    infoPlist: import("./createBaseMod").BaseModProviderMethods<InfoPlist, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    entitlements: import("./createBaseMod").BaseModProviderMethods<JSONObject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    podfile: import("./createBaseMod").BaseModProviderMethods<Paths.PodfileProjectFile, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    podfileProperties: import("./createBaseMod").BaseModProviderMethods<Record<string, JSONValue>, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
};
type AppleDefaultProviders = ReturnType<typeof getAppleModFileProviders>;
export declare function withIosBaseMods(config: ExportedConfig, { providers, ...props }?: ForwardedBaseModOptions & {
    providers?: Partial<AppleDefaultProviders>;
}): ExportedConfig;
export declare function getIosModFileProviders(): {
    dangerous: import("./createBaseMod").BaseModProviderMethods<unknown, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    finalized: import("./createBaseMod").BaseModProviderMethods<unknown, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    appDelegate: import("./createBaseMod").BaseModProviderMethods<Paths.AppDelegateProjectFile, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    expoPlist: import("./createBaseMod").BaseModProviderMethods<JSONObject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    xcodeproj: import("./createBaseMod").BaseModProviderMethods<XcodeProject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    infoPlist: import("./createBaseMod").BaseModProviderMethods<InfoPlist, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    entitlements: import("./createBaseMod").BaseModProviderMethods<JSONObject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    podfile: import("./createBaseMod").BaseModProviderMethods<Paths.PodfileProjectFile, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    podfileProperties: import("./createBaseMod").BaseModProviderMethods<Record<string, JSONValue>, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
};
/**
 * macOS reuses the iOS Apple mod providers, but resolves files from the `macos/` directory instead
 * of `ios/`. This lets the existing iOS config plugins apply to a macOS prebuild unchanged.
 */
export declare function withMacosBaseMods(config: ExportedConfig, { providers, ...props }?: ForwardedBaseModOptions & {
    providers?: Partial<AppleDefaultProviders>;
}): ExportedConfig;
export declare function getMacosModFileProviders(): {
    dangerous: import("./createBaseMod").BaseModProviderMethods<unknown, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    finalized: import("./createBaseMod").BaseModProviderMethods<unknown, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    appDelegate: import("./createBaseMod").BaseModProviderMethods<Paths.AppDelegateProjectFile, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    expoPlist: import("./createBaseMod").BaseModProviderMethods<JSONObject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    xcodeproj: import("./createBaseMod").BaseModProviderMethods<XcodeProject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    infoPlist: import("./createBaseMod").BaseModProviderMethods<InfoPlist, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    entitlements: import("./createBaseMod").BaseModProviderMethods<JSONObject, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    podfile: import("./createBaseMod").BaseModProviderMethods<Paths.PodfileProjectFile, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
    podfileProperties: import("./createBaseMod").BaseModProviderMethods<Record<string, JSONValue>, Partial<Pick<import("./withMod").BaseModOptions, "skipEmptyMod" | "saveToInternal">>>;
};
export {};
