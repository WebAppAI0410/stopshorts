const { withEntitlementsPlist, withInfoPlist, withXcodeProject } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Screen Time API (Family Controls)
 *
 * This plugin:
 * 1. Adds Family Controls capability
 * 2. Adds required entitlements
 * 3. Sets minimum iOS version to 15.0
 */
function withScreenTime(config) {
    // Add Family Controls entitlement
    config = withEntitlementsPlist(config, (config) => {
        config.modResults['com.apple.developer.family-controls'] = {
            AuthorizationMode: 'Individual',
        };
        return config;
    });

    // Add usage description for Family Controls
    config = withInfoPlist(config, (config) => {
        // This key doesn't exist officially but we add it for documentation
        // The actual permission is handled by Family Controls framework
        config.modResults['NSFamilyControlsUsageDescription'] =
            'このアプリはショート動画アプリの使用時間を管理するためにスクリーンタイム機能を使用します。';

        return config;
    });

    // Ensure minimum iOS version is 15.0
    config = withXcodeProject(config, (config) => {
        const project = config.modResults;

        // Get the main target
        const mainTargetId = project.getFirstTarget()?.uuid;
        if (mainTargetId) {
            const buildConfigurations = project.pbxXCBuildConfigurationSection();

            Object.keys(buildConfigurations).forEach((key) => {
                const buildConfig = buildConfigurations[key];
                if (
                    buildConfig.buildSettings &&
                    typeof buildConfig.buildSettings === 'object'
                ) {
                    // Ensure iOS deployment target is at least 15.0
                    const currentTarget = buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
                    if (!currentTarget || parseFloat(currentTarget) < 15.0) {
                        buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.0';
                    }
                }
            });
        }

        return config;
    });

    return config;
}

module.exports = withScreenTime;
