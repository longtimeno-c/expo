import type { ExpoConfig } from '@expo/config-types';
import type { JSONObject } from '@expo/json-file';
import type { AppleNativeDir } from './Paths';
export declare const withAssociatedDomains: import("..").ConfigPlugin;
export declare function setAssociatedDomains(config: ExpoConfig, { 'com.apple.developer.associated-domains': _, ...entitlementsPlist }: JSONObject): JSONObject;
export declare function getEntitlementsPath(projectRoot: string, { targetName, buildConfiguration, nativeDir, }?: {
    targetName?: string;
    buildConfiguration?: string;
    nativeDir?: AppleNativeDir;
}): string | null;
export declare function ensureApplicationTargetEntitlementsFileConfigured(projectRoot: string, nativeDir?: AppleNativeDir): void;
