import ManagedSettings
import ManagedSettingsUI
import UIKit

/// ShieldConfiguration Extension for StopShorts
/// Customizes the appearance of the shield overlay when blocked apps are opened
@available(iOS 15.0, *)
class StopShortsShieldConfiguration: ShieldConfigurationDataSource {

    // MARK: - Shield Configuration for Applications

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return createShieldConfiguration()
    }

    override func configuration(
        shielding application: Application,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        return createShieldConfiguration()
    }

    // MARK: - Shield Configuration for Web Domains

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return createShieldConfiguration()
    }

    override func configuration(
        shielding webDomain: WebDomain,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        return createShieldConfiguration()
    }

    // MARK: - Private Methods

    private func createShieldConfiguration() -> ShieldConfiguration {
        // Get intervention settings from App Groups
        let timing = AppGroupsManager.shared.interventionTiming
        let isDelayed = timing == "delayed"

        // Customize subtitle based on intervention mode
        let subtitle: String
        if isDelayed {
            let delayMinutes = AppGroupsManager.shared.interventionDelayMinutes
            subtitle = "\(delayMinutes)分後に使用可能になります"
        } else {
            subtitle = "本当に続けますか？一度立ち止まって考えてみましょう"
        }

        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterial,
            backgroundColor: UIColor.systemBackground,
            icon: nil,
            title: ShieldConfiguration.Label(
                text: "チェックイン",
                color: UIColor.label
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: UIColor.secondaryLabel
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "衝動サーフィングを試す",
                color: UIColor.white
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0), // #10B981 Emerald
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "戻る",
                color: UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0)
            )
        )
    }
}
