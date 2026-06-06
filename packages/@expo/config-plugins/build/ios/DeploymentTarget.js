"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeploymentTarget = getDeploymentTarget;
exports.setDeploymentTargetForBuildConfiguration = setDeploymentTargetForBuildConfiguration;
exports.updateDeploymentTargetForPbxproj = updateDeploymentTargetForPbxproj;
exports.withDeploymentTargetPodfileProps = exports.withDeploymentTarget = void 0;
function _BuildProperties() {
  const data = require("./BuildProperties");
  _BuildProperties = function () {
    return data;
  };
  return data;
}
function _Target() {
  const data = require("./Target");
  _Target = function () {
    return data;
  };
  return data;
}
function _iosPlugins() {
  const data = require("../plugins/ios-plugins");
  _iosPlugins = function () {
    return data;
  };
  return data;
}
function _Xcodeproj() {
  const data = require("./utils/Xcodeproj");
  _Xcodeproj = function () {
    return data;
  };
  return data;
}
/**
 * Set the iOS deployment target for all build configurations in the main application target.
 */
const withDeploymentTarget = config => {
  return (0, _iosPlugins().withXcodeProject)(config, config => {
    const deploymentTarget = getDeploymentTarget(config);
    if (deploymentTarget) {
      config.modResults = updateDeploymentTargetForPbxproj(config.modResults, deploymentTarget);
    }
    return config;
  });
};

/**
 * A config-plugin to update `ios/Podfile.properties.json` with the deployment target
 */
exports.withDeploymentTarget = withDeploymentTarget;
const withDeploymentTargetPodfileProps = exports.withDeploymentTargetPodfileProps = (0, _BuildProperties().createBuildPodfilePropsConfigPlugin)([{
  propName: 'ios.deploymentTarget',
  propValueGetter: config => config.ios?.deploymentTarget ?? null
}], 'withDeploymentTargetPodfileProps');

/** Get the iOS deployment target from Expo config, if defined */
function getDeploymentTarget(config) {
  return config.ios?.deploymentTarget ?? null;
}

/**
 * Set the deployment target for an XCBuildConfiguration object.
 *
 * tvOS targets use `TVOS_DEPLOYMENT_TARGET` rather than `IPHONEOS_DEPLOYMENT_TARGET`. A build
 * configuration is treated as tvOS when it already declares a tvOS deployment target or builds
 * against the Apple TV SDK, mirroring the detection used by `setDeviceFamily`. This keeps the
 * `ios.deploymentTarget` config working for projects transformed into Apple TV targets (e.g. via
 * `@react-native-tvos/config-tv`).
 */
function setDeploymentTargetForBuildConfiguration(xcBuildConfiguration, deploymentTarget) {
  if (!deploymentTarget) {
    return;
  }
  const {
    buildSettings
  } = xcBuildConfiguration;
  const isTVOS = typeof buildSettings.TVOS_DEPLOYMENT_TARGET !== 'undefined' || buildSettings.SDKROOT === 'appletvos';
  if (isTVOS) {
    buildSettings.TVOS_DEPLOYMENT_TARGET = deploymentTarget;
  } else {
    buildSettings.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
  }
}

/**
 * Update the iOS deployment target for all XCBuildConfiguration entries in the main application target.
 */
function updateDeploymentTargetForPbxproj(project, deploymentTarget) {
  const [, mainTarget] = (0, _Target().findFirstNativeTarget)(project);
  (0, _Xcodeproj().getBuildConfigurationsForListId)(project, mainTarget.buildConfigurationList).forEach(([, buildConfig]) => setDeploymentTargetForBuildConfiguration(buildConfig, deploymentTarget));
  return project;
}
//# sourceMappingURL=DeploymentTarget.js.map