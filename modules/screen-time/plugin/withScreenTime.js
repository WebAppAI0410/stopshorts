const {
    withEntitlementsPlist,
    withInfoPlist,
    withXcodeProject,
} = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Screen Time API (Family Controls)
 *
 * This plugin:
 * 1. Adds Family Controls capability (when ENABLE_FAMILY_CONTROLS=true)
 * 2. Adds App Groups capability for extension communication
 * 3. Adds required entitlements
 * 4. Sets minimum iOS version to 15.0
 *
 * IMPORTANT: Family Controls requires Apple approval.
 * To request: https://developer.apple.com/contact/request/family-controls-distribution
 *
 * Usage:
 * - Without Family Controls (default): eas build -p ios
 * - With Family Controls: ENABLE_FAMILY_CONTROLS=true eas build -p ios
 */

// App Group identifier for sharing data between main app and extensions
const APP_GROUP_IDENTIFIER = 'group.com.nverse.stopshorts.screentime';

function withScreenTime(config) {
    const enableFamilyControls = process.env.ENABLE_FAMILY_CONTROLS === 'true';

    // Always add App Groups (needed for extension communication)
    config = withAppGroups(config);

    if (enableFamilyControls) {
        console.log('[withScreenTime] Family Controls entitlement ENABLED');
        config = withFamilyControls(config);
    } else {
        console.log(
            '[withScreenTime] Family Controls entitlement DISABLED (set ENABLE_FAMILY_CONTROLS=true to enable)'
        );
    }

    // Ensure minimum iOS version is 15.0
    config = withMinimumIOSVersion(config);

    return config;
}

/**
 * Adds App Groups capability for sharing data with extensions
 */
function withAppGroups(config) {
    return withEntitlementsPlist(config, (config) => {
        // Initialize or get existing app groups array
        const existingGroups =
            config.modResults['com.apple.security.application-groups'] || [];

        // Add our app group if not already present
        if (!existingGroups.includes(APP_GROUP_IDENTIFIER)) {
            config.modResults['com.apple.security.application-groups'] = [
                ...existingGroups,
                APP_GROUP_IDENTIFIER,
            ];
            console.log(`[withScreenTime] Added App Group: ${APP_GROUP_IDENTIFIER}`);
        }

        return config;
    });
}

/**
 * Adds Family Controls entitlement and usage description
 */
function withFamilyControls(config) {
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

    return config;
}

/**
 * Sets minimum iOS deployment target to 15.0
 */
function withMinimumIOSVersion(config) {
    return withXcodeProject(config, (config) => {
        const project = config.modResults;

        const mainTarget = project.getFirstTarget();
        if (!mainTarget?.uuid) {
            console.warn(
                '[withScreenTime] Could not find main target in Xcode project.'
            );
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
                const currentTarget =
                    buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
                if (!currentTarget || parseFloat(currentTarget) < 15.0) {
                    buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.0';
                }
            }
        });

        return config;
    });
}

module.exports = withScreenTime;

// Export constants for use by other plugins/scripts
module.exports.APP_GROUP_IDENTIFIER = APP_GROUP_IDENTIFIER;
