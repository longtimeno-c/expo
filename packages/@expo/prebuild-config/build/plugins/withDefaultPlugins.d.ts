/**
 * These are the versioned first-party plugins with some of the future third-party plugins mixed in for legacy support.
 */
import type { ConfigPlugin } from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config-types';
/**
 * Whether the current prebuild targets Apple TV / Android TV. Mirrors the `EXPO_TV` signal used by
 * [`@react-native-tvos/config-tv`](https://github.com/react-native-tvos/config-tv) so the default
 * Expo plugins stay in sync with the TV transform and skip iPhone/iPad-only settings.
 */
export declare function isTVEnabled(): boolean;
/**
 * Config plugin to apply all of the custom Expo iOS config plugins we support by default.
 * TODO: In the future most of this should go into versioned packages like expo-updates, etc...
 */
export declare const withIosExpoPlugins: ConfigPlugin<{
    bundleIdentifier: string;
}>;
/**
 * Config plugin to apply all of the custom Expo Android config plugins we support by default.
 * TODO: In the future most of this should go into versioned packages like expo-updates, etc...
 */
export declare const withAndroidExpoPlugins: ConfigPlugin<{
    package: string;
    projectRoot: string;
}>;
export declare const withVersionedExpoSDKPlugins: ConfigPlugin;
export declare function getAutoPlugins(): string[];
export declare function getLegacyExpoPlugins(): string[];
export declare function withLegacyExpoPlugins(config: ExpoConfig): ExpoConfig;
