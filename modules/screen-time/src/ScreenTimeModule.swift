import ExpoModulesCore
import FamilyControls
import DeviceActivity
import ManagedSettings

public class ScreenTimeModule: Module {
    // Store for managing app shields/blocks
    private let managedSettingsStore = ManagedSettingsStore()

    public func definition() -> ModuleDefinition {
        Name("ScreenTime")

        // Check if Family Controls is available (iOS 15+)
        Function("isAvailable") { () -> Bool in
            if #available(iOS 15.0, *) {
                return true
            }
            return false
        }

        // Check current authorization status
        Function("getAuthorizationStatus") { () -> String in
            if #available(iOS 16.0, *) {
                let status = AuthorizationCenter.shared.authorizationStatus
                switch status {
                case .notDetermined:
                    return "notDetermined"
                case .denied:
                    return "denied"
                case .approved:
                    return "approved"
                @unknown default:
                    return "unknown"
                }
            } else if #available(iOS 15.0, *) {
                // iOS 15 doesn't have authorizationStatus property
                // We need to try requesting and handle the result
                return "notDetermined"
            }
            return "unavailable"
        }

        // Request Family Controls authorization
        AsyncFunction("requestAuthorization") { (promise: Promise) in
            if #available(iOS 16.0, *) {
                Task {
                    do {
                        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                        promise.resolve(["success": true, "status": "approved"])
                    } catch {
                        promise.resolve(["success": false, "status": "denied", "error": error.localizedDescription])
                    }
                }
            } else if #available(iOS 15.0, *) {
                Task {
                    do {
                        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                        promise.resolve(["success": true, "status": "approved"])
                    } catch {
                        promise.resolve(["success": false, "status": "denied", "error": error.localizedDescription])
                    }
                }
            } else {
                promise.resolve(["success": false, "status": "unavailable", "error": "iOS 15+ required"])
            }
        }

        // Get list of short-video app bundle identifiers to monitor
        Function("getShortVideoAppIdentifiers") { () -> [String] in
            return [
                "com.zhiliaoapp.musically",     // TikTok
                "com.ss.iphone.ugc.Aweme",      // TikTok (China)
                "com.google.ios.youtube",       // YouTube (includes Shorts)
                "com.burbn.instagram"           // Instagram (includes Reels)
            ]
        }

        // Check if we have selected any apps to monitor
        // Note: Real implementation would use FamilyActivityPicker
        Function("hasSelectedApps") { () -> Bool in
            if #available(iOS 15.0, *) {
                // Check if we have any apps in the managed settings store
                return self.managedSettingsStore.shield.applicationCategories != nil ||
                       self.managedSettingsStore.shield.applications != nil
            }
            return false
        }

        // Clear all shields/blocks
        AsyncFunction("clearAllShields") { (promise: Promise) in
            if #available(iOS 15.0, *) {
                self.managedSettingsStore.shield.applications = nil
                self.managedSettingsStore.shield.applicationCategories = nil
                self.managedSettingsStore.shield.webDomains = nil
                self.managedSettingsStore.shield.webDomainCategories = nil
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        }

        // Events for authorization status changes
        Events("onAuthorizationStatusChange")

        OnStartObserving {
            // Could set up observers for authorization changes here
        }

        OnStopObserving {
            // Clean up observers
        }
    }
}
