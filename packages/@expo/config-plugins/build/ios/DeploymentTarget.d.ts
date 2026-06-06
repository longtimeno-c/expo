import type { ExpoConfig } from '@expo/config-types';
import type { XCBuildConfiguration } from 'xcode';
import type { ConfigPlugin, XcodeProject } from '../Plugin.types';
/**
 * Set the iOS deployment target for all build configurations in the main application target.
 */
export declare const withDeploymentTarget: ConfigPlugin;
/**
 * A config-plugin to update `ios/Podfile.properties.json` with the deployment target
 */
export declare const withDeploymentTargetPodfileProps: ConfigPlugin<void>;
/** Get the iOS deployment target from Expo config, if defined */
export declare function getDeploymentTarget(config: Pick<ExpoConfig, 'ios'>): string | null;
/**
 * Set the deployment target for an XCBuildConfiguration object.
 *
 * tvOS targets use `TVOS_DEPLOYMENT_TARGET` rather than `IPHONEOS_DEPLOYMENT_TARGET`. A build
 * configuration is treated as tvOS when it already declares a tvOS deployment target or builds
 * against the Apple TV SDK, mirroring the detection used by `setDeviceFamily`. This keeps the
 * `ios.deploymentTarget` config working for projects transformed into Apple TV targets (e.g. via
 * `@react-native-tvos/config-tv`).
 */
export declare function setDeploymentTargetForBuildConfiguration(xcBuildConfiguration: XCBuildConfiguration, deploymentTarget?: string): void;
/**
 * Update the iOS deployment target for all XCBuildConfiguration entries in the main application target.
 */
export declare function updateDeploymentTargetForPbxproj(project: XcodeProject, deploymentTarget: string): XcodeProject;
