const { withEntitlementsPlist, withInfoPlist, withXcodeProject } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Screen Time API (Family Controls)
 *
 * This plugin:
 * 1. Adds Family Controls capability (when ENABLE_FAMILY_CONTROLS=true)
 * 2. Adds required entitlements
 * 3. Sets minimum iOS version to 15.0
 *
 * IMPORTANT: Family Controls requires Apple approval.
 * To request: https://developer.apple.com/contact/request/family-controls-distribution
 *
 * Usage:
 * - Without Family Controls (default): eas build -p ios
 * - With Family Controls: ENABLE_FAMILY_CONTROLS=true eas build -p ios
 */
function withScreenTime(config) {
    const enableFamilyControls = process.env.ENABLE_FAMILY_CONTROLS === 'true';

    if (enableFamilyControls) {
        console.log('[withScreenTime] Family Controls entitlement ENABLED');

        // Add Family Controls entitlement
        config = withEntitlementsPlist(config, (config) => {
            config.modResults['com.apple.developer.family-controls'] = true;
            return config;
        });

        // Add usage description for Family Controls
        config = withInfoPlist(config, (config) => {
            config.modResults['NSFamilyControlsUsageDescription'] =
                'このアプリはショート動画アプリの使用時間を管理するためにスクリーンタイム機能を使用します。';
            return config;
        });
    } else {
        console.log('[withScreenTime] Family Controls entitlement DISABLED (set ENABLE_FAMILY_CONTROLS=true to enable)');
    }

    // Ensure minimum iOS version is 15.0
    config = withXcodeProject(config, (config) => {
        const project = config.modResults;

        const mainTarget = project.getFirstTarget();
        if (!mainTarget?.uuid) {
            console.warn('[withScreenTime] Could not find main target in Xcode project.');
            return config;
        }

        const buildConfigurations = project.pbxXCBuildConfigurationSection();
        if (!buildConfigurations) {
            console.warn('[withScreenTime] Could not find build configurations.');
            return config;
        }

        Object.keys(buildConfigurations).forEach((key) => {
            const buildConfig = buildConfigurations[key];
            if (
                buildConfig.buildSettings &&
                typeof buildConfig.buildSettings === 'object'
            ) {
                const currentTarget = buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
                if (!currentTarget || parseFloat(currentTarget) < 15.0) {
                    buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.0';
                }
            }
        });

        return config;
    });

    return config;
}

module.exports = withScreenTime;
