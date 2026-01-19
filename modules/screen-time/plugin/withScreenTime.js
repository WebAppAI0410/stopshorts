const {
    withEntitlementsPlist,
    withInfoPlist,
    withXcodeProject,
    IOSConfig,
} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Expo Config Plugin for Screen Time API (Family Controls)
 *
 * This plugin:
 * 1. Adds Family Controls capability (when ENABLE_FAMILY_CONTROLS=true)
 * 2. Adds App Groups capability for extension communication
 * 3. Adds required entitlements
 * 4. Sets minimum iOS version to 15.0
 * 5. Adds DeviceActivityMonitor, ShieldConfiguration, and ShieldAction extensions
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

// Extension configurations
const EXTENSIONS = [
    {
        name: 'ScreenTimeMonitor',
        displayName: 'StopShorts Monitor',
        extensionPointIdentifier: 'com.apple.deviceactivitymonitor',
        principalClass: '$(PRODUCT_MODULE_NAME).StopShortsMonitorExtension',
        sourceDir: 'ScreenTimeMonitor',
        sourceFiles: ['StopShortsMonitorExtension.swift'],
    },
    {
        name: 'ScreenTimeShieldConfig',
        displayName: 'StopShorts Shield',
        extensionPointIdentifier: 'com.apple.shieldconfiguration',
        principalClass: '$(PRODUCT_MODULE_NAME).StopShortsShieldConfiguration',
        sourceDir: 'ScreenTimeShieldConfig',
        sourceFiles: ['StopShortsShieldConfiguration.swift'],
    },
    {
        name: 'ScreenTimeShieldAction',
        displayName: 'StopShorts Action',
        extensionPointIdentifier: 'com.apple.shieldaction',
        principalClass: '$(PRODUCT_MODULE_NAME).StopShortsShieldAction',
        sourceDir: 'ScreenTimeShieldAction',
        sourceFiles: ['StopShortsShieldAction.swift'],
    },
];

// Shared source files needed by all extensions
const SHARED_SOURCE_FILES = [
    'AppGroupsManager.swift',
    'SelectionSerializer.swift',
];

function withScreenTime(config) {
    const enableFamilyControls = process.env.ENABLE_FAMILY_CONTROLS === 'true';

    // Always add App Groups (needed for extension communication)
    config = withAppGroups(config);

    if (enableFamilyControls) {
        console.log('[withScreenTime] Family Controls entitlement ENABLED');
        config = withFamilyControls(config);
        // Re-enabled after fixing quote escaping issues in build settings
        config = withScreenTimeExtensions(config);
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
        const existingGroups =
            config.modResults['com.apple.security.application-groups'] || [];

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
    config = withEntitlementsPlist(config, (config) => {
        config.modResults['com.apple.developer.family-controls'] = true;
        return config;
    });

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

/**
 * Adds Screen Time extensions to the Xcode project
 */
function withScreenTimeExtensions(config) {
    return withXcodeProject(config, (config) => {
        const project = config.modResults;
        const projectRoot = config.modRequest.projectRoot;
        const platformProjectRoot = config.modRequest.platformProjectRoot;
        const bundleIdentifier = IOSConfig.BundleIdentifier.getBundleIdentifier(config);

        // Get the plugin's ios directory
        const pluginIosDir = path.join(
            projectRoot,
            'modules',
            'screen-time',
            'ios'
        );

        // Copy shared files and extensions to the iOS project
        const targetDir = path.join(platformProjectRoot, 'ScreenTimeExtensions');
        copyExtensionFiles(pluginIosDir, targetDir);

        // Add each extension
        for (const ext of EXTENSIONS) {
            try {
                addExtensionTarget(
                    project,
                    ext,
                    bundleIdentifier,
                    targetDir,
                    platformProjectRoot
                );
                console.log(`[withScreenTime] Added extension: ${ext.name}`);
            } catch (error) {
                console.error(`[withScreenTime] Failed to add extension ${ext.name}:`, error.message);
            }
        }

        return config;
    });
}

/**
 * Copy extension source files to iOS project directory
 */
function copyExtensionFiles(sourceDir, targetDir) {
    // Create target directory
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy Shared directory
    const sharedSourceDir = path.join(sourceDir, 'Shared');
    const sharedTargetDir = path.join(targetDir, 'Shared');
    if (fs.existsSync(sharedSourceDir)) {
        copyDirectoryRecursive(sharedSourceDir, sharedTargetDir);
    }

    // Copy each extension directory
    for (const ext of EXTENSIONS) {
        const extSourceDir = path.join(sourceDir, ext.sourceDir);
        const extTargetDir = path.join(targetDir, ext.sourceDir);
        if (fs.existsSync(extSourceDir)) {
            copyDirectoryRecursive(extSourceDir, extTargetDir);
        }
    }

    console.log(`[withScreenTime] Copied extension files to ${targetDir}`);
}

/**
 * Recursively copy a directory
 */
function copyDirectoryRecursive(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

/**
 * Check if an extension target already exists in the project
 */
function extensionTargetExists(project, extensionName) {
    // Access PBXNativeTarget section directly to avoid library method issues
    const targets = project.hash.project.objects.PBXNativeTarget;
    if (!targets) return false;

    for (const key in targets) {
        const target = targets[key];
        // Skip comment entries (keys ending with _comment)
        if (key.endsWith('_comment')) continue;
        // Check both quoted and unquoted name forms
        if (target && typeof target === 'object' && target.name) {
            if (target.name === extensionName || target.name === `"${extensionName}"`) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Add an extension target to the Xcode project
 */
function addExtensionTarget(project, ext, mainBundleId, extensionsDir, platformProjectRoot) {
    // Idempotency check: skip if extension already exists
    try {
        if (extensionTargetExists(project, ext.name)) {
            console.log(`[withScreenTime] Extension ${ext.name} already exists, skipping`);
            return;
        }
    } catch (idempError) {
        console.warn(`[withScreenTime] Warning during idempotency check for ${ext.name}: ${idempError.message}`);
        // Continue anyway - the check is just for safety
    }

    const extBundleId = `${mainBundleId}.${ext.name}`;
    const extDir = path.join(extensionsDir, ext.sourceDir);
    const sharedDir = path.join(extensionsDir, 'Shared');

    // Create a new PBXNativeTarget for the extension
    const targetUuid = project.generateUuid();
    const productUuid = project.generateUuid();
    const buildConfigListUuid = project.generateUuid();
    const debugConfigUuid = project.generateUuid();
    const releaseConfigUuid = project.generateUuid();
    const sourcesBuildPhaseUuid = project.generateUuid();
    const frameworksBuildPhaseUuid = project.generateUuid();

    // Get main target for reference
    const mainTarget = project.getFirstTarget();
    if (!mainTarget) {
        throw new Error('Could not find main target');
    }
    const mainTargetUuid = mainTarget.uuid;

    // Get products group from PBXProject section directly
    let productRefGroup = null;
    const pbxProjectSection = project.hash.project.objects.PBXProject;
    if (pbxProjectSection) {
        for (const key in pbxProjectSection) {
            const proj = pbxProjectSection[key];
            if (proj && proj.isa === 'PBXProject' && proj.productRefGroup) {
                productRefGroup = proj.productRefGroup;
                break;
            }
        }
    }
    if (!productRefGroup) {
        console.warn('[withScreenTime] productRefGroup not found');
    }

    // Product reference - add file reference manually to avoid xcode library issues
    const productName = `${ext.name}.appex`;
    const productFileRefUuid = project.generateUuid();

    // Add product file reference directly to PBXFileReference section
    if (!project.hash.project.objects.PBXFileReference) {
        project.hash.project.objects.PBXFileReference = {};
    }
    project.hash.project.objects.PBXFileReference[productFileRefUuid] = {
        isa: 'PBXFileReference',
        explicitFileType: 'wrapper.app-extension',
        includeInIndex: 0,
        path: productName,
        sourceTree: 'BUILT_PRODUCTS_DIR',
    };

    // Add to products group if it exists
    if (productRefGroup) {
        const group = project.hash.project.objects.PBXGroup[productRefGroup];
        if (group && group.children) {
            group.children.push(productFileRefUuid);
        }
    }

    // Create group for extension sources - directly manipulate hash to avoid library issues
    const extGroupUuid = project.generateUuid();

    // Ensure PBXGroup section exists
    if (!project.hash.project.objects.PBXGroup) {
        project.hash.project.objects.PBXGroup = {};
    }

    // Add the extension group
    project.hash.project.objects.PBXGroup[extGroupUuid] = {
        isa: 'PBXGroup',
        children: [],
        name: ext.name,
        path: ext.name,
        sourceTree: '"<group>"',
    };

    // Add source files to the extension group and create build file entries
    const sourceFileRefs = [];
    const buildFileUuids = [];

    // Ensure PBXFileReference and PBXBuildFile sections exist
    if (!project.hash.project.objects.PBXFileReference) {
        project.hash.project.objects.PBXFileReference = {};
    }
    if (!project.hash.project.objects.PBXBuildFile) {
        project.hash.project.objects.PBXBuildFile = {};
    }

    // Add extension-specific source files
    for (const sourceFile of ext.sourceFiles) {
        const filePath = path.join(extDir, sourceFile);
        if (fs.existsSync(filePath)) {
            const fileRefUuid = project.generateUuid();
            const buildFileUuid = project.generateUuid();

            // Add file reference directly
            project.hash.project.objects.PBXFileReference[fileRefUuid] = {
                isa: 'PBXFileReference',
                lastKnownFileType: 'sourcecode.swift',
                path: sourceFile,
                name: sourceFile,
                sourceTree: '"<group>"',
            };

            // Add to extension group's children
            project.hash.project.objects.PBXGroup[extGroupUuid].children.push(fileRefUuid);

            // Add build file
            project.hash.project.objects.PBXBuildFile[buildFileUuid] = {
                isa: 'PBXBuildFile',
                fileRef: fileRefUuid,
                fileRef_comment: sourceFile,
            };

            sourceFileRefs.push(fileRefUuid);
            buildFileUuids.push(buildFileUuid);
        }
    }

    // Add shared source files
    for (const sharedFile of SHARED_SOURCE_FILES) {
        const filePath = path.join(sharedDir, sharedFile);
        if (fs.existsSync(filePath)) {
            const fileRefUuid = project.generateUuid();
            const buildFileUuid = project.generateUuid();

            project.hash.project.objects.PBXFileReference[fileRefUuid] = {
                isa: 'PBXFileReference',
                lastKnownFileType: 'sourcecode.swift',
                path: `../Shared/${sharedFile}`,
                name: sharedFile,
                sourceTree: '"<group>"',
            };

            project.hash.project.objects.PBXGroup[extGroupUuid].children.push(fileRefUuid);

            project.hash.project.objects.PBXBuildFile[buildFileUuid] = {
                isa: 'PBXBuildFile',
                fileRef: fileRefUuid,
                fileRef_comment: sharedFile,
            };

            buildFileUuids.push(buildFileUuid);
        }
    }

    // Add Info.plist file reference
    const infoPlistPath = path.join(extDir, 'Info.plist');
    if (fs.existsSync(infoPlistPath)) {
        const infoPlistRefUuid = project.generateUuid();
        project.hash.project.objects.PBXFileReference[infoPlistRefUuid] = {
            isa: 'PBXFileReference',
            lastKnownFileType: 'text.plist.xml',
            path: 'Info.plist',
            name: 'Info.plist',
            sourceTree: '"<group>"',
        };
        project.hash.project.objects.PBXGroup[extGroupUuid].children.push(infoPlistRefUuid);
    }

    // Add extension group to main group - access PBXProject section directly
    let mainGroupUuid = null;
    for (const key in pbxProjectSection) {
        const proj = pbxProjectSection[key];
        if (proj && proj.isa === 'PBXProject' && proj.mainGroup) {
            mainGroupUuid = proj.mainGroup;
            break;
        }
    }
    if (mainGroupUuid && project.hash.project.objects.PBXGroup[mainGroupUuid]) {
        project.hash.project.objects.PBXGroup[mainGroupUuid].children.push(extGroupUuid);
    }

    // Create build configurations using direct hash manipulation
    // NOTE: Values with spaces, commas, or special characters need quotes
    const commonBuildSettings = {
        CLANG_ANALYZER_NONNULL: 'YES',
        CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: 'YES_AGGRESSIVE',
        CLANG_CXX_LANGUAGE_STANDARD: '"gnu++20"',
        CLANG_ENABLE_MODULES: 'YES',
        CLANG_ENABLE_OBJC_WEAK: 'YES',
        CODE_SIGN_STYLE: 'Automatic',
        CURRENT_PROJECT_VERSION: '1',
        GENERATE_INFOPLIST_FILE: 'YES',
        INFOPLIST_FILE: `ScreenTimeExtensions/${ext.sourceDir}/Info.plist`,
        INFOPLIST_KEY_CFBundleDisplayName: `"${ext.displayName}"`,
        INFOPLIST_KEY_NSHumanReadableCopyright: '""',
        IPHONEOS_DEPLOYMENT_TARGET: '15.0',
        LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
        MARKETING_VERSION: '1.0',
        PRODUCT_BUNDLE_IDENTIFIER: extBundleId,
        PRODUCT_NAME: '"$(TARGET_NAME)"',
        SKIP_INSTALL: 'YES',
        SWIFT_EMIT_LOC_STRINGS: 'YES',
        SWIFT_VERSION: '5.0',
        TARGETED_DEVICE_FAMILY: '"1,2"',
    };

    // Ensure XCBuildConfiguration section exists
    if (!project.hash.project.objects.XCBuildConfiguration) {
        project.hash.project.objects.XCBuildConfiguration = {};
    }

    // Add Debug configuration
    project.hash.project.objects.XCBuildConfiguration[debugConfigUuid] = {
        isa: 'XCBuildConfiguration',
        buildSettings: {
            ...commonBuildSettings,
            DEBUG_INFORMATION_FORMAT: 'dwarf',
            MTL_ENABLE_DEBUG_INFO: 'INCLUDE_SOURCE',
            SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG',
            SWIFT_OPTIMIZATION_LEVEL: '"-Onone"',
        },
        name: 'Debug',
    };

    // Add Release configuration
    project.hash.project.objects.XCBuildConfiguration[releaseConfigUuid] = {
        isa: 'XCBuildConfiguration',
        buildSettings: {
            ...commonBuildSettings,
            DEBUG_INFORMATION_FORMAT: '"dwarf-with-dsym"',
            MTL_ENABLE_DEBUG_INFO: 'NO',
            SWIFT_OPTIMIZATION_LEVEL: '"-O"',
        },
        name: 'Release',
    };

    // Ensure XCConfigurationList section exists
    if (!project.hash.project.objects.XCConfigurationList) {
        project.hash.project.objects.XCConfigurationList = {};
    }

    // Create build configuration list
    project.hash.project.objects.XCConfigurationList[buildConfigListUuid] = {
        isa: 'XCConfigurationList',
        buildConfigurations: [debugConfigUuid, releaseConfigUuid],
        defaultConfigurationIsVisible: 0,
        defaultConfigurationName: 'Release',
    };

    // Ensure PBXSourcesBuildPhase section exists
    if (!project.hash.project.objects.PBXSourcesBuildPhase) {
        project.hash.project.objects.PBXSourcesBuildPhase = {};
    }

    // Add sources build phase
    project.hash.project.objects.PBXSourcesBuildPhase[sourcesBuildPhaseUuid] = {
        isa: 'PBXSourcesBuildPhase',
        buildActionMask: 2147483647,
        files: buildFileUuids,
        runOnlyForDeploymentPostprocessing: 0,
    };

    // Ensure PBXFrameworksBuildPhase section exists
    if (!project.hash.project.objects.PBXFrameworksBuildPhase) {
        project.hash.project.objects.PBXFrameworksBuildPhase = {};
    }

    // Add frameworks build phase
    project.hash.project.objects.PBXFrameworksBuildPhase[frameworksBuildPhaseUuid] = {
        isa: 'PBXFrameworksBuildPhase',
        buildActionMask: 2147483647,
        files: [],
        runOnlyForDeploymentPostprocessing: 0,
    };

    // Ensure PBXNativeTarget section exists
    if (!project.hash.project.objects.PBXNativeTarget) {
        project.hash.project.objects.PBXNativeTarget = {};
    }

    // Create native target
    project.hash.project.objects.PBXNativeTarget[targetUuid] = {
        isa: 'PBXNativeTarget',
        buildConfigurationList: buildConfigListUuid,
        buildConfigurationList_comment: `Build configuration list for PBXNativeTarget "${ext.name}"`,
        buildPhases: [sourcesBuildPhaseUuid, frameworksBuildPhaseUuid],
        buildRules: [],
        dependencies: [],
        name: ext.name,
        productName: ext.name,
        productReference: productFileRefUuid,
        productReference_comment: `${ext.name}.appex`,
        productType: 'com.apple.product-type.app-extension',
    };

    // Add target to project's targets array
    // Use the pbxProjectSection already defined earlier in this function
    for (const projUuid in pbxProjectSection) {
        const projectEntry = pbxProjectSection[projUuid];
        if (projectEntry && projectEntry.targets && Array.isArray(projectEntry.targets)) {
            projectEntry.targets.push(targetUuid);
            break;
        }
    }

    // Add extension as dependency of main target and embed it
    try {
        addExtensionDependency(project, mainTargetUuid, targetUuid, ext.name, productFileRefUuid);
    } catch (depError) {
        console.warn(`[withScreenTime] Warning during dependency setup for ${ext.name}: ${depError.message}`);
        // Continue - the extension target has been added, dependency linking can be done manually if needed
    }

    // Write entitlements file for the extension
    writeExtensionEntitlements(extDir, ext.name);
}

/**
 * Add extension as dependency of main target and embed in app
 */
function addExtensionDependency(project, mainTargetUuid, extTargetUuid, extName, productRefUuid) {
    // Create target dependency
    const dependencyUuid = project.generateUuid();
    const containerProxyUuid = project.generateUuid();

    // Get project UUID from PBXProject section
    let projectUuid = null;
    const pbxProjectSection = project.hash.project.objects.PBXProject;
    if (pbxProjectSection) {
        for (const key in pbxProjectSection) {
            if (pbxProjectSection[key] && pbxProjectSection[key].isa === 'PBXProject') {
                projectUuid = key;
                break;
            }
        }
    }

    // Add container item proxy
    const containerProxy = {
        isa: 'PBXContainerItemProxy',
        containerPortal: projectUuid || project.getFirstProject()?.uuid,
        proxyType: 1,
        remoteGlobalIDString: extTargetUuid,
        remoteInfo: extName,
    };

    if (!project.hash.project.objects.PBXContainerItemProxy) {
        project.hash.project.objects.PBXContainerItemProxy = {};
    }
    project.hash.project.objects.PBXContainerItemProxy[containerProxyUuid] = containerProxy;

    // Add target dependency
    const targetDependency = {
        isa: 'PBXTargetDependency',
        target: extTargetUuid,
        targetProxy: containerProxyUuid,
    };

    if (!project.hash.project.objects.PBXTargetDependency) {
        project.hash.project.objects.PBXTargetDependency = {};
    }
    project.hash.project.objects.PBXTargetDependency[dependencyUuid] = targetDependency;

    // Add dependency to main target
    const mainTarget = project.hash.project.objects.PBXNativeTarget[mainTargetUuid];
    if (mainTarget) {
        if (!mainTarget.dependencies) {
            mainTarget.dependencies = [];
        }
        mainTarget.dependencies.push(dependencyUuid);
    }

    // Add to embed app extensions build phase
    addToEmbedExtensionsBuildPhase(project, mainTargetUuid, productRefUuid, extName);
}

/**
 * Add extension to embed extensions build phase
 */
function addToEmbedExtensionsBuildPhase(project, mainTargetUuid, productRefUuid, extName) {
    const mainTarget = project.hash.project.objects.PBXNativeTarget[mainTargetUuid];
    if (!mainTarget) return;

    // Find or create embed extensions build phase
    // Handle both array formats: ['UUID'] and [{value: 'UUID', comment: 'name'}]
    let embedPhaseUuid = null;
    for (const phaseEntry of mainTarget.buildPhases || []) {
        // Handle both object format {value: 'UUID'} and plain UUID string
        const phaseUuid = typeof phaseEntry === 'object' && phaseEntry.value
            ? phaseEntry.value
            : phaseEntry;

        if (typeof phaseUuid !== 'string') continue;

        const phase = project.hash.project.objects.PBXCopyFilesBuildPhase?.[phaseUuid];
        // Check both quoted and unquoted forms for compatibility
        if (phase && (phase.name === 'Embed App Extensions' || phase.name === '"Embed App Extensions"')) {
            embedPhaseUuid = phaseUuid;
            break;
        }
    }

    if (!embedPhaseUuid) {
        // Create new embed extensions build phase
        // NOTE: Do NOT add manual quotes - xcode library handles this
        embedPhaseUuid = project.generateUuid();
        const embedPhase = {
            isa: 'PBXCopyFilesBuildPhase',
            buildActionMask: 2147483647,
            dstPath: '""',
            dstSubfolderSpec: 13, // PlugIns folder
            files: [],
            name: '"Embed App Extensions"',
            runOnlyForDeploymentPostprocessing: 0,
        };

        if (!project.hash.project.objects.PBXCopyFilesBuildPhase) {
            project.hash.project.objects.PBXCopyFilesBuildPhase = {};
        }
        project.hash.project.objects.PBXCopyFilesBuildPhase[embedPhaseUuid] = embedPhase;

        // Add to main target build phases
        if (!mainTarget.buildPhases) {
            mainTarget.buildPhases = [];
        }
        mainTarget.buildPhases.push(embedPhaseUuid);
    }

    // Add build file for embedding
    const buildFileUuid = project.generateUuid();
    const buildFile = {
        isa: 'PBXBuildFile',
        fileRef: productRefUuid,
        settings: { ATTRIBUTES: ['RemoveHeadersOnCopy'] },
    };

    project.hash.project.objects.PBXBuildFile[buildFileUuid] = buildFile;

    // Add to embed phase
    const embedPhase = project.hash.project.objects.PBXCopyFilesBuildPhase[embedPhaseUuid];
    if (!embedPhase.files) {
        embedPhase.files = [];
    }
    embedPhase.files.push(buildFileUuid);
}

/**
 * Write entitlements file for extension
 */
function writeExtensionEntitlements(extDir, extName) {
    const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.family-controls</key>
	<true/>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>${APP_GROUP_IDENTIFIER}</string>
	</array>
</dict>
</plist>
`;

    const entitlementsPath = path.join(extDir, `${extName}.entitlements`);
    fs.writeFileSync(entitlementsPath, entitlementsContent);
}

module.exports = withScreenTime;

// Export constants for use by other plugins/scripts
module.exports.APP_GROUP_IDENTIFIER = APP_GROUP_IDENTIFIER;
module.exports.EXTENSIONS = EXTENSIONS;
