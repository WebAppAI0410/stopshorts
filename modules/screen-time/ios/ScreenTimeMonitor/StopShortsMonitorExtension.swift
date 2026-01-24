import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings

/// DeviceActivityMonitor Extension for StopShorts
/// Handles schedule and threshold events in the background
@available(iOS 15.0, *)
class StopShortsMonitorExtension: DeviceActivityMonitor {

    // ManagedSettingsStore for applying shields
    private let store = ManagedSettingsStore()

    // MARK: - Schedule Events

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)

        print("[ScreenTimeMonitor] intervalDidStart: \(activity.rawValue)")

        // Reset daily threshold count at the start of each day
        AppGroupsManager.shared.resetDailyThresholdCountIfNeeded()
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)

        print("[ScreenTimeMonitor] intervalDidEnd: \(activity.rawValue)")

        // Clear shields at the end of the monitoring interval
        clearShields()
    }

    override func intervalWillStartWarning(for activity: DeviceActivityName) {
        super.intervalWillStartWarning(for: activity)

        print("[ScreenTimeMonitor] intervalWillStartWarning: \(activity.rawValue)")
    }

    override func intervalWillEndWarning(for activity: DeviceActivityName) {
        super.intervalWillEndWarning(for: activity)

        print("[ScreenTimeMonitor] intervalWillEndWarning: \(activity.rawValue)")
    }

    // MARK: - Threshold Events

    override func eventDidReachThreshold(
        _ event: DeviceActivityEvent.Name,
        activity: DeviceActivityName
    ) {
        super.eventDidReachThreshold(event, activity: activity)

        print("[ScreenTimeMonitor] eventDidReachThreshold: \(event.rawValue) for activity: \(activity.rawValue)")

        // Extract minutes from event name (e.g., "threshold_5min" -> 5)
        let minutes = extractMinutes(from: event.rawValue)

        // Increment threshold count in App Groups
        AppGroupsManager.shared.incrementThresholdCount()

        print("[ScreenTimeMonitor] Threshold reached: \(minutes) minutes, total count: \(AppGroupsManager.shared.getTodayThresholdCount())")

        // Check intervention settings and apply shields if needed
        applyShieldsIfNeeded()
    }

    // MARK: - Private Methods

    private func extractMinutes(from eventName: String) -> Int {
        // Extract number from "threshold_Xmin" format
        let pattern = "threshold_(\\d+)min"
        guard let regex = try? NSRegularExpression(pattern: pattern),
              let match = regex.firstMatch(
                in: eventName,
                range: NSRange(eventName.startIndex..., in: eventName)
              ),
              let range = Range(match.range(at: 1), in: eventName) else {
            return 0
        }
        return Int(eventName[range]) ?? 0
    }

    private func applyShieldsIfNeeded() {
        // Check if already in cooldown
        if AppGroupsManager.shared.isInShieldCooldown() {
            print("[ScreenTimeMonitor] Shield is in cooldown, skipping")
            return
        }

        // Load selection from App Groups
        guard let selection = try? SelectionSerializer.loadFromAppGroups(),
              !selection.applicationTokens.isEmpty else {
            print("[ScreenTimeMonitor] No apps selected for shielding")
            return
        }

        // Apply shields to selected apps
        store.shield.applications = selection.applicationTokens

        if !selection.categoryTokens.isEmpty {
            store.shield.applicationCategories = .specific(selection.categoryTokens)
        }

        print("[ScreenTimeMonitor] Applied shields to \(selection.applicationTokens.count) apps")
    }

    private func clearShields() {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
        store.shield.webDomainCategories = nil

        print("[ScreenTimeMonitor] Cleared all shields")
    }
}
