import ExpoModulesCore
import FamilyControls
import DeviceActivity
import ManagedSettings

public class ScreenTimeModule: Module {
    // Store for managing app shields/blocks
    private let managedSettingsStore = ManagedSettingsStore()

    // DeviceActivityCenter singleton for monitoring
    @available(iOS 15.0, *)
    private lazy var deviceActivityCenter = DeviceActivityCenter()

    // Activity name constant
    private let monitoringActivityName = "stopshorts_monitoring"

    public func definition() -> ModuleDefinition {
        Name("ScreenTime")

        // MARK: - Availability Check

        /// Check if Family Controls is available (iOS 15+)
        Function("isAvailable") { () -> Bool in
            if #available(iOS 15.0, *) {
                return true
            }
            return false
        }

        // MARK: - Authorization

        /// Check current authorization status
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
                // Status cannot be determined without attempting authorization
                return "unknown"
            }
            return "unavailable"
        }

        /// Request Family Controls authorization
        AsyncFunction("requestAuthorization") { (promise: Promise) in
            if #available(iOS 15.0, *) {
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

        // MARK: - App Selection (via FamilyActivitySelection)

        /// Get list of short-video app bundle identifiers to monitor
        /// Note: Bundle IDs verified as of Dec 2024. May change with app updates.
        Function("getShortVideoAppIdentifiers") { () -> [String] in
            return [
                "com.zhiliaoapp.musically",     // TikTok (International)
                "com.ss.iphone.ugc.Aweme",      // TikTok (China/Douyin)
                "com.google.ios.youtube",       // YouTube (includes Shorts)
                "com.burbn.instagram"           // Instagram (includes Reels)
            ]
        }

        /// Check if we have selected any apps to monitor
        Function("hasSelectedApps") { () -> Bool in
            if #available(iOS 15.0, *) {
                // Check App Groups for saved selection
                guard let data = AppGroupsManager.shared.getFamilyActivitySelectionData() else {
                    return false
                }
                do {
                    let selection = try SelectionSerializer.decode(data)
                    return !selection.applicationTokens.isEmpty ||
                           !selection.categoryTokens.isEmpty
                } catch {
                    print("[ScreenTimeModule] Failed to decode selection: \(error)")
                    return false
                }
            }
            return false
        }

        /// Get summary of selected apps (count, isEmpty)
        Function("getSelectionSummary") { () -> [String: Any] in
            if #available(iOS 15.0, *) {
                do {
                    guard let selection = try SelectionSerializer.loadFromAppGroups() else {
                        return [
                            "applicationCount": 0,
                            "categoryCount": 0,
                            "webDomainCount": 0,
                            "isEmpty": true,
                            "totalCount": 0
                        ]
                    }
                    let summary = SelectionSerializer.getSummary(selection)
                    return [
                        "applicationCount": summary.applicationCount,
                        "categoryCount": summary.categoryCount,
                        "webDomainCount": summary.webDomainCount,
                        "isEmpty": summary.isEmpty,
                        "totalCount": summary.totalCount
                    ]
                } catch {
                    print("[ScreenTimeModule] Failed to get selection summary: \(error)")
                }
            }
            return [
                "applicationCount": 0,
                "categoryCount": 0,
                "webDomainCount": 0,
                "isEmpty": true,
                "totalCount": 0
            ]
        }

        /// Clear saved app selection
        AsyncFunction("clearSelection") { (promise: Promise) in
            if #available(iOS 15.0, *) {
                SelectionSerializer.clearFromAppGroups()
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        }

        /// Present the FamilyActivityPicker to select apps to monitor
        /// Selection is automatically saved to App Groups
        AsyncFunction("presentFamilyActivityPicker") { (options: [String: Any]?, promise: Promise) in
            if #available(iOS 15.0, *) {
                let headerText = options?["headerText"] as? String ?? ""
                let footerText = options?["footerText"] as? String ?? ""

                FamilyActivityPickerManager.shared.present(
                    headerText: headerText,
                    footerText: footerText,
                    completion: { selection in
                        // Save selection to App Groups
                        do {
                            try SelectionSerializer.saveToAppGroups(selection)
                            let summary = SelectionSerializer.getSummary(selection)
                            promise.resolve([
                                "success": true,
                                "applicationCount": summary.applicationCount,
                                "categoryCount": summary.categoryCount,
                                "webDomainCount": summary.webDomainCount,
                                "isEmpty": summary.isEmpty
                            ])
                        } catch {
                            promise.resolve([
                                "success": false,
                                "error": error.localizedDescription
                            ])
                        }
                    },
                    onDismiss: nil
                )
            } else {
                promise.resolve([
                    "success": false,
                    "error": "iOS 15+ required"
                ])
            }
        }

        // MARK: - Shield Management

        /// Clear all shields/blocks
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

        /// Apply shields to selected apps
        AsyncFunction("applyShields") { (promise: Promise) in
            if #available(iOS 15.0, *) {
                do {
                    guard let selection = try SelectionSerializer.loadFromAppGroups() else {
                        promise.resolve(["success": false, "error": "No apps selected"])
                        return
                    }

                    // Apply shields
                    if !selection.applicationTokens.isEmpty {
                        self.managedSettingsStore.shield.applications = selection.applicationTokens
                    }
                    if !selection.categoryTokens.isEmpty {
                        self.managedSettingsStore.shield.applicationCategories = .specific(selection.categoryTokens)
                    }

                    promise.resolve(["success": true])
                } catch {
                    promise.resolve(["success": false, "error": error.localizedDescription])
                }
            } else {
                promise.resolve(["success": false, "error": "iOS 15+ required"])
            }
        }

        // MARK: - Intervention Settings

        /// Set intervention settings (timing mode and delay)
        Function("setInterventionSettings") { (timing: String, delayMinutes: Int) -> Bool in
            let validTiming = timing == "immediate" || timing == "delayed" ? timing : "immediate"
            let validDelay = [5, 10, 15].contains(delayMinutes) ? delayMinutes : 5

            AppGroupsManager.shared.interventionTiming = validTiming
            AppGroupsManager.shared.interventionDelayMinutes = validDelay

            return true
        }

        /// Get current intervention settings
        Function("getInterventionSettings") { () -> [String: Any] in
            return [
                "timing": AppGroupsManager.shared.interventionTiming,
                "delayMinutes": AppGroupsManager.shared.interventionDelayMinutes
            ]
        }

        // MARK: - Usage Statistics (Threshold-based)

        /// Get estimated usage for today (based on threshold counts)
        Function("getEstimatedUsage") { () -> [String: Any] in
            let thresholdCount = AppGroupsManager.shared.getTodayThresholdCount()
            let estimatedMinutes = AppGroupsManager.shared.getEstimatedUsageMinutes()

            return [
                "thresholdCount": thresholdCount,
                "estimatedMinutes": estimatedMinutes,
                "accuracy": "5 minutes",
                "note": "Usage is estimated based on 5-minute threshold intervals"
            ]
        }

        // MARK: - Urge Surfing Request

        /// Consume urge surfing request flag (called when app becomes active)
        Function("consumeUrgeSurfingRequest") { () -> Bool in
            return AppGroupsManager.shared.consumeUrgeSurfingRequest()
        }

        /// Check if urge surfing was requested (without consuming)
        Function("hasUrgeSurfingRequest") { () -> Bool in
            return AppGroupsManager.shared.bool(forKey: AppGroupsManager.Keys.urgeSurfingRequested)
        }

        // MARK: - Intervention Events Polling

        /// Poll and consume pending intervention events
        Function("pollInterventionEvents") { () -> [[String: Any]] in
            return AppGroupsManager.shared.consumeInterventionEvents()
        }

        // MARK: - Monitoring Control

        /// Start monitoring target apps with threshold events
        AsyncFunction("startMonitoring") { (promise: Promise) in
            if #available(iOS 15.0, *) {
                do {
                    // Load saved selection
                    guard let selection = try SelectionSerializer.loadFromAppGroups(),
                          !selection.applicationTokens.isEmpty else {
                        promise.resolve(["success": false, "error": "No apps selected. Use FamilyActivityPicker first."])
                        return
                    }

                    let activityName = DeviceActivityName(self.monitoringActivityName)

                    // Create schedule for all-day monitoring
                    let schedule = DeviceActivitySchedule(
                        intervalStart: DateComponents(hour: 0, minute: 0),
                        intervalEnd: DateComponents(hour: 23, minute: 59),
                        repeats: true
                    )

                    // Create threshold events (5-minute intervals for up to 60 minutes)
                    var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
                    for minutes in stride(from: 5, through: 60, by: 5) {
                        let eventName = DeviceActivityEvent.Name("threshold_\(minutes)min")
                        events[eventName] = DeviceActivityEvent(
                            applications: selection.applicationTokens,
                            threshold: DateComponents(minute: minutes)
                        )
                    }

                    // Stop any existing monitoring first
                    self.deviceActivityCenter.stopMonitoring([activityName])

                    // Start monitoring with schedule and events
                    try self.deviceActivityCenter.startMonitoring(
                        activityName,
                        during: schedule,
                        events: events
                    )

                    AppGroupsManager.shared.isMonitoringActive = true
                    promise.resolve(["success": true])
                } catch {
                    promise.resolve(["success": false, "error": error.localizedDescription])
                }
            } else {
                promise.resolve(["success": false, "error": "iOS 15+ required"])
            }
        }

        /// Stop monitoring target apps
        AsyncFunction("stopMonitoring") { (promise: Promise) in
            if #available(iOS 15.0, *) {
                let activityName = DeviceActivityName(self.monitoringActivityName)

                self.deviceActivityCenter.stopMonitoring([activityName])
                AppGroupsManager.shared.isMonitoringActive = false

                promise.resolve(["success": true])
            } else {
                promise.resolve(["success": false, "error": "iOS 15+ required"])
            }
        }

        /// Check if monitoring is active
        /// Syncs UserDefaults state with actual DeviceActivityCenter state on first call
        Function("isMonitoringActive") { () -> Bool in
            if #available(iOS 15.0, *) {
                // Check actual DeviceActivityCenter activities for accurate state
                let activityName = DeviceActivityName(self.monitoringActivityName)
                let isActuallyActive = self.deviceActivityCenter.activities.contains(activityName)

                // Sync UserDefaults if out of sync (e.g., after app crash)
                if isActuallyActive != AppGroupsManager.shared.isMonitoringActive {
                    AppGroupsManager.shared.isMonitoringActive = isActuallyActive
                }

                return isActuallyActive
            }
            return false
        }

        // MARK: - Shield Cooldown

        /// Check if shield is in cooldown period
        Function("isInShieldCooldown") { () -> Bool in
            return AppGroupsManager.shared.isInShieldCooldown()
        }

        /// Set shield cooldown (in seconds)
        Function("setShieldCooldown") { (seconds: Double) -> Void in
            AppGroupsManager.shared.setShieldCooldown(seconds: seconds)
        }

        // MARK: - Debug

        /// Print all App Groups values for debugging
        Function("debugPrintAppGroupsValues") { () -> Void in
            AppGroupsManager.shared.printAllValues()
        }

        // MARK: - Events

        Events("onAuthorizationStatusChange", "onInterventionEvent")

        OnStartObserving {
            // Could set up observers for authorization changes here
        }

        OnStopObserving {
            // Clean up observers
        }
    }
}
