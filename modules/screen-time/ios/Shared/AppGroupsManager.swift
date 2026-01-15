import Foundation

/// Manages shared UserDefaults via App Groups for communication between main app and extensions
/// App Group Identifier: group.com.nverse.stopshorts.screentime
public final class AppGroupsManager {

    // MARK: - Constants

    public static let appGroupIdentifier = "group.com.nverse.stopshorts.screentime"

    // MARK: - Storage Keys

    public enum Keys {
        /// Base64-encoded FamilyActivitySelection data
        static let familyActivitySelection = "familyActivitySelection"

        /// Intervention timing mode: "immediate" or "delayed"
        static let interventionTiming = "interventionTiming"

        /// Delay minutes for delayed mode: 5, 10, or 15
        static let interventionDelayMinutes = "interventionDelayMinutes"

        /// Array of unprocessed intervention events (dictionaries)
        static let interventionEvents = "interventionEvents"

        /// Dictionary of usage threshold counts keyed by date
        /// Format: "usageCount_YYYY-MM-DD" -> Int
        static let usageThresholdCountsPrefix = "usageCount_"

        /// Shield cooldown end timestamp (TimeInterval)
        static let shieldCooldownUntil = "shieldCooldownUntil"

        /// Flag indicating urge surfing was requested from Shield
        static let urgeSurfingRequested = "urgeSurfingRequested"

        /// Last known monitoring state: true if actively monitoring
        static let isMonitoringActive = "isMonitoringActive"

        /// Daily reset timestamp to clear threshold counts
        static let lastResetDate = "lastResetDate"
    }

    // MARK: - Singleton

    public static let shared = AppGroupsManager()

    // MARK: - Properties

    private let defaults: UserDefaults?

    /// Cached date formatter for performance (DateFormatter is expensive to create)
    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()

    // MARK: - Initialization

    private init() {
        self.defaults = UserDefaults(suiteName: AppGroupsManager.appGroupIdentifier)

        if defaults == nil {
            print("[AppGroupsManager] Warning: Failed to initialize UserDefaults with App Groups")
        }
    }

    // MARK: - Generic Accessors

    public func set(_ value: Any?, forKey key: String) {
        defaults?.set(value, forKey: key)
        // Note: synchronize() is deprecated since iOS 12, system handles sync automatically
    }

    public func string(forKey key: String) -> String? {
        return defaults?.string(forKey: key)
    }

    public func integer(forKey key: String) -> Int {
        return defaults?.integer(forKey: key) ?? 0
    }

    public func double(forKey key: String) -> Double {
        return defaults?.double(forKey: key) ?? 0.0
    }

    public func bool(forKey key: String) -> Bool {
        return defaults?.bool(forKey: key) ?? false
    }

    public func data(forKey key: String) -> Data? {
        return defaults?.data(forKey: key)
    }

    public func array(forKey key: String) -> [Any]? {
        return defaults?.array(forKey: key)
    }

    public func removeObject(forKey key: String) {
        defaults?.removeObject(forKey: key)
    }

    // MARK: - FamilyActivitySelection

    /// Stores Base64-encoded FamilyActivitySelection
    public func setFamilyActivitySelectionData(_ data: Data?) {
        if let data = data {
            let base64String = data.base64EncodedString()
            set(base64String, forKey: Keys.familyActivitySelection)
        } else {
            removeObject(forKey: Keys.familyActivitySelection)
        }
    }

    /// Retrieves Base64-encoded FamilyActivitySelection as Data
    public func getFamilyActivitySelectionData() -> Data? {
        guard let base64String = string(forKey: Keys.familyActivitySelection) else {
            return nil
        }
        return Data(base64Encoded: base64String)
    }

    // MARK: - Intervention Settings

    public var interventionTiming: String {
        get { string(forKey: Keys.interventionTiming) ?? "immediate" }
        set { set(newValue, forKey: Keys.interventionTiming) }
    }

    public var interventionDelayMinutes: Int {
        get {
            let value = integer(forKey: Keys.interventionDelayMinutes)
            return value > 0 ? value : 5 // Default to 5 minutes
        }
        set { set(newValue, forKey: Keys.interventionDelayMinutes) }
    }

    // MARK: - Intervention Events Queue

    /// Adds an intervention event to the queue
    public func addInterventionEvent(action: String, proceeded: Bool, appToken: String?) {
        var events = getInterventionEvents()
        let event: [String: Any] = [
            "action": action,
            "proceeded": proceeded,
            "appToken": appToken ?? "",
            "timestamp": Date().timeIntervalSince1970
        ]
        events.append(event)
        set(events, forKey: Keys.interventionEvents)
    }

    /// Retrieves and clears all pending intervention events
    public func consumeInterventionEvents() -> [[String: Any]] {
        let events = getInterventionEvents()
        removeObject(forKey: Keys.interventionEvents)
        return events
    }

    private func getInterventionEvents() -> [[String: Any]] {
        guard let events = array(forKey: Keys.interventionEvents) as? [[String: Any]] else {
            return []
        }
        return events
    }

    // MARK: - Usage Threshold Counting

    /// Increments the threshold count for today
    public func incrementThresholdCount() {
        let key = thresholdCountKey(for: Date())
        let currentCount = integer(forKey: key)
        set(currentCount + 1, forKey: key)
    }

    /// Gets the threshold count for today (each count represents 5 minutes)
    public func getTodayThresholdCount() -> Int {
        resetIfNewDay()
        return integer(forKey: thresholdCountKey(for: Date()))
    }

    /// Calculates estimated usage in minutes based on threshold counts
    public func getEstimatedUsageMinutes() -> Int {
        return getTodayThresholdCount() * 5 // Each threshold = 5 minutes
    }

    private func thresholdCountKey(for date: Date) -> String {
        let dateString = Self.dateFormatter.string(from: date)
        return Keys.usageThresholdCountsPrefix + dateString
    }

    private func resetIfNewDay() {
        let todayString = Self.dateFormatter.string(from: Date())

        if let lastReset = string(forKey: Keys.lastResetDate), lastReset == todayString {
            return // Already reset today
        }

        // Clear old threshold counts (keep only today's)
        // Note: UserDefaults doesn't have a way to list all keys,
        // so we rely on the daily reset mechanism
        set(todayString, forKey: Keys.lastResetDate)
    }

    // MARK: - Shield Cooldown

    public var shieldCooldownUntil: Date? {
        get {
            let timestamp = double(forKey: Keys.shieldCooldownUntil)
            return timestamp > 0 ? Date(timeIntervalSince1970: timestamp) : nil
        }
        set {
            if let date = newValue {
                set(date.timeIntervalSince1970, forKey: Keys.shieldCooldownUntil)
            } else {
                removeObject(forKey: Keys.shieldCooldownUntil)
            }
        }
    }

    /// Checks if shield is in cooldown period
    public func isInShieldCooldown() -> Bool {
        guard let cooldownEnd = shieldCooldownUntil else { return false }
        return Date() < cooldownEnd
    }

    /// Sets a cooldown period (in seconds)
    public func setShieldCooldown(seconds: TimeInterval) {
        shieldCooldownUntil = Date().addingTimeInterval(seconds)
    }

    // MARK: - Urge Surfing Request

    /// Sets the urge surfing request flag (called from ShieldAction extension)
    public func setUrgeSurfingRequested(_ requested: Bool) {
        set(requested, forKey: Keys.urgeSurfingRequested)
    }

    /// Consumes the urge surfing request flag (called from main app)
    public func consumeUrgeSurfingRequest() -> Bool {
        let wasRequested = bool(forKey: Keys.urgeSurfingRequested)
        if wasRequested {
            removeObject(forKey: Keys.urgeSurfingRequested)
        }
        return wasRequested
    }

    // MARK: - Monitoring State

    public var isMonitoringActive: Bool {
        get { bool(forKey: Keys.isMonitoringActive) }
        set { set(newValue, forKey: Keys.isMonitoringActive) }
    }

    // MARK: - Debug

    public func printAllValues() {
        print("[AppGroupsManager] Current values:")
        print("  - familyActivitySelection: \(string(forKey: Keys.familyActivitySelection) != nil ? "set" : "nil")")
        print("  - interventionTiming: \(interventionTiming)")
        print("  - interventionDelayMinutes: \(interventionDelayMinutes)")
        print("  - isMonitoringActive: \(isMonitoringActive)")
        print("  - todayThresholdCount: \(getTodayThresholdCount())")
        print("  - estimatedUsageMinutes: \(getEstimatedUsageMinutes())")
        print("  - urgeSurfingRequested: \(bool(forKey: Keys.urgeSurfingRequested))")
        print("  - isInShieldCooldown: \(isInShieldCooldown())")
    }
}
