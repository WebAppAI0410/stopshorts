import ManagedSettings
import DeviceActivity

/// ShieldAction Extension for StopShorts
/// Handles user interactions with the shield buttons
@available(iOS 15.0, *)
class StopShortsShieldAction: ShieldActionExtension {

    // ManagedSettingsStore for removing shields
    private let store = ManagedSettingsStore()

    // MARK: - Handle Shield Actions for Applications

    override func handle(
        action: ShieldAction,
        for application: ApplicationToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, appToken: application.hashValue, completionHandler: completionHandler)
    }

    override func handle(
        action: ShieldAction,
        for application: ApplicationToken,
        in category: ActivityCategoryToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, appToken: application.hashValue, completionHandler: completionHandler)
    }

    // MARK: - Handle Shield Actions for Web Domains

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomainToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, appToken: webDomain.hashValue, completionHandler: completionHandler)
    }

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomainToken,
        in category: ActivityCategoryToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, appToken: webDomain.hashValue, completionHandler: completionHandler)
    }

    // MARK: - Private Methods

    private func handleAction(
        action: ShieldAction,
        appToken: Int,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            // "衝動サーフィングを試す" button pressed
            handleUrgeSurfing(appToken: appToken)
            completionHandler(.close)

        case .secondaryButtonPressed:
            // "戻る" button pressed
            handleGoBack(appToken: appToken)
            completionHandler(.close)

        @unknown default:
            completionHandler(.close)
        }
    }

    private func handleUrgeSurfing(appToken: Int) {
        print("[ShieldAction] Urge surfing requested")

        // Record intervention event
        AppGroupsManager.shared.addInterventionEvent(
            action: "urge_surfing",
            proceeded: false,
            appToken: String(appToken)
        )

        // Set flag for main app to detect and navigate to urge surfing screen
        AppGroupsManager.shared.setUrgeSurfingRequested(true)

        // Remove shield temporarily
        removeShieldTemporarily()

        // Set cooldown to prevent immediate re-shield
        let cooldownSeconds: Double = 60 // 1 minute cooldown
        AppGroupsManager.shared.setShieldCooldown(seconds: cooldownSeconds)

        print("[ShieldAction] Recorded intervention event and set urge surfing flag")
    }

    private func handleGoBack(appToken: Int) {
        print("[ShieldAction] User chose to go back")

        // Record intervention event - user successfully turned back
        AppGroupsManager.shared.addInterventionEvent(
            action: "go_back",
            proceeded: false,
            appToken: String(appToken)
        )

        print("[ShieldAction] Recorded go_back intervention event")

        // No shield removal - user is leaving the blocked app
    }

    private func removeShieldTemporarily() {
        // Clear all shields
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
        store.shield.webDomainCategories = nil

        print("[ShieldAction] Shields temporarily removed")
    }
}
