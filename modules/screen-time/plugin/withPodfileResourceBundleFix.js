const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config Plugin to fix Xcode 14+ resource bundle code signing error
 *
 * Starting from Xcode 14, resource bundles are signed by default.
 * This causes build failures when pods have resource bundles without
 * a development team set.
 *
 * This plugin modifies the Podfile to disable code signing for
 * resource bundle targets.
 */
function withPodfileResourceBundleFix(config) {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

            if (!fs.existsSync(podfilePath)) {
                console.warn('[withPodfileResourceBundleFix] Podfile not found');
                return config;
            }

            let podfileContent = fs.readFileSync(podfilePath, 'utf8');

            // Check if the fix is already applied
            if (podfileContent.includes('CODE_SIGNING_ALLOWED')) {
                console.log('[withPodfileResourceBundleFix] Fix already applied');
                return config;
            }

            // The code to add inside post_install block
            const resourceBundleFix = `
    # Fix Xcode 14+ resource bundle code signing error
    # Disable code signing for resource bundle targets
    installer.target_installation_results.pod_target_installation_results
      .each do |pod_name, target_installation_result|
        target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
          resource_bundle_target.build_configurations.each do |config|
            config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
          end
        end
      end`;

            // Find the end of post_install block and insert before it
            // Look for pattern: react_native_post_install(...) followed by end
            const postInstallEndPattern = /(\s*react_native_post_install\([^)]+\)[^)]*\))/;
            const match = podfileContent.match(postInstallEndPattern);

            if (match) {
                // Insert after react_native_post_install call
                const insertIndex = match.index + match[0].length;
                podfileContent =
                    podfileContent.slice(0, insertIndex) +
                    resourceBundleFix +
                    podfileContent.slice(insertIndex);

                fs.writeFileSync(podfilePath, podfileContent);
                console.log('[withPodfileResourceBundleFix] Applied resource bundle signing fix');
            } else {
                console.warn('[withPodfileResourceBundleFix] Could not find post_install block');
            }

            return config;
        },
    ]);
}

module.exports = withPodfileResourceBundleFix;
