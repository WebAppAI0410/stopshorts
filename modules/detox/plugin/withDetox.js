const {
    withAppBuildGradle,
    withAppDelegate,
    withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function ensureAndroidTestRunner(contents) {
    if (contents.includes('testInstrumentationRunner')) {
        return contents;
    }

    return contents.replace(
        /defaultConfig\s*{/, 
        'defaultConfig {\n        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"'
    );
}

function ensureAndroidTestDeps(contents) {
    if (contents.includes('com.wix:detox')) {
        return contents;
    }

    const deps = [
        'androidTestImplementation("com.wix:detox:+")',
        'androidTestImplementation("androidx.test:runner:1.5.2")',
        'androidTestImplementation("androidx.test:rules:1.5.0")',
        'androidTestImplementation("androidx.test.ext:junit:1.1.5")',
    ].join('\n    ');

    return contents.replace(/dependencies\s*{/, `dependencies {\n    ${deps}`);
}

function ensureAppDelegateDetox(contents) {
    if (!contents.includes('import Detox')) {
        const importBlock = contents.match(/^(import\s.+\n)+/m);
        if (importBlock) {
            const insert = `${importBlock[0]}#if DEBUG\nimport Detox\n#endif\n`;
            contents = contents.replace(importBlock[0], insert);
        }
    }

    if (!contents.includes('DetoxAppDelegateProxy')) {
        contents = contents.replace(
            /\n\s*return super\.application\(application, didFinishLaunchingWithOptions: launchOptions\)\n\s*}\n/, 
            `\n#if DEBUG\n    DetoxAppDelegateProxy.sharedInstance().application(\n      application,\n      didFinishLaunchingWithOptions: launchOptions\n    )\n#endif\n\n    return super.application(application, didFinishLaunchingWithOptions: launchOptions)\n  }\n`
        );
    }

    return contents;
}

function ensurePodfileDetox(podfileContents) {
    if (podfileContents.includes("pod 'Detox'")) {
        return podfileContents;
    }

    const lines = podfileContents.split('\n');
    const insertLine = "  pod 'Detox', :path => '../node_modules/detox/ios', :configurations => ['Debug']";

    for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].startsWith('  post_install do')) {
            lines.splice(i, 0, insertLine);
            return lines.join('\n');
        }
    }

    return podfileContents + `\n${insertLine}\n`;
}

function withDetox(config) {
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;
        contents = ensureAndroidTestRunner(contents);
        contents = ensureAndroidTestDeps(contents);
        config.modResults.contents = contents;
        return config;
    });

    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const pkg =
                (config.android && (config.android.package || config.android.packageName)) ||
                'com.stopshorts.app';
            const packagePath = pkg.replace(/\./g, '/');
            const filePath = path.join(
                config.modRequest.platformProjectRoot,
                'app',
                'src',
                'androidTest',
                'java',
                packagePath,
                'DetoxTest.java'
            );

            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(
                filePath,
                `package ${pkg};\n\n` +
                    'import androidx.test.ext.junit.rules.ActivityScenarioRule;\n' +
                    'import androidx.test.ext.junit.runners.AndroidJUnit4;\n\n' +
                    'import com.wix.detox.Detox;\n\n' +
                    'import org.junit.Rule;\n' +
                    'import org.junit.Test;\n' +
                    'import org.junit.runner.RunWith;\n\n' +
                    '@RunWith(AndroidJUnit4.class)\n' +
                    'public class DetoxTest {\n' +
                    '  @Rule\n' +
                    '  public ActivityScenarioRule<MainActivity> activityRule = new ActivityScenarioRule<>(MainActivity.class);\n\n' +
                    '  @Test\n' +
                    '  public void runDetoxTests() {\n' +
                    '    Detox.runTests(activityRule);\n' +
                    '  }\n' +
                    '}\n'
            );
            return config;
        },
    ]);

    config = withAppDelegate(config, (config) => {
        if (config.modResults.language === 'swift') {
            config.modResults.contents = ensureAppDelegateDetox(config.modResults.contents);
        }
        return config;
    });

    config = withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            if (fs.existsSync(podfilePath)) {
                const contents = fs.readFileSync(podfilePath, 'utf8');
                const updated = ensurePodfileDetox(contents);
                if (updated !== contents) {
                    fs.writeFileSync(podfilePath, updated);
                }
            }
            return config;
        },
    ]);

    return config;
}

module.exports = withDetox;
