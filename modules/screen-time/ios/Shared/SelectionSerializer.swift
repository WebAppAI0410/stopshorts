import Foundation
import FamilyControls

/// Handles serialization and deserialization of FamilyActivitySelection
/// for storage in App Groups UserDefaults
@available(iOS 15.0, *)
public final class SelectionSerializer {

    // MARK: - Errors

    public enum SerializationError: Error, LocalizedError {
        case encodingFailed(String)
        case decodingFailed(String)
        case invalidData

        public var errorDescription: String? {
            switch self {
            case .encodingFailed(let message):
                return "Failed to encode FamilyActivitySelection: \(message)"
            case .decodingFailed(let message):
                return "Failed to decode FamilyActivitySelection: \(message)"
            case .invalidData:
                return "Invalid data format for FamilyActivitySelection"
            }
        }
    }

    // MARK: - Serialization

    /// Encodes a FamilyActivitySelection to Data using PropertyListEncoder
    /// FamilyActivitySelection conforms to Codable, so we use PropertyList format
    public static func encode(_ selection: FamilyActivitySelection) throws -> Data {
        do {
            let encoder = PropertyListEncoder()
            encoder.outputFormat = .binary
            let data = try encoder.encode(selection)
            return data
        } catch {
            throw SerializationError.encodingFailed(error.localizedDescription)
        }
    }

    /// Decodes Data to FamilyActivitySelection using PropertyListDecoder
    public static func decode(_ data: Data) throws -> FamilyActivitySelection {
        do {
            let decoder = PropertyListDecoder()
            let selection = try decoder.decode(FamilyActivitySelection.self, from: data)
            return selection
        } catch {
            throw SerializationError.decodingFailed(error.localizedDescription)
        }
    }

    // MARK: - Base64 Convenience Methods

    /// Encodes FamilyActivitySelection to a Base64 string for easy storage
    public static func encodeToBase64(_ selection: FamilyActivitySelection) throws -> String {
        let data = try encode(selection)
        return data.base64EncodedString()
    }

    /// Decodes a Base64 string to FamilyActivitySelection
    public static func decodeFromBase64(_ base64String: String) throws -> FamilyActivitySelection {
        guard let data = Data(base64Encoded: base64String) else {
            throw SerializationError.invalidData
        }
        return try decode(data)
    }

    // MARK: - App Groups Integration

    /// Saves FamilyActivitySelection to App Groups
    public static func saveToAppGroups(_ selection: FamilyActivitySelection) throws {
        let data = try encode(selection)
        AppGroupsManager.shared.setFamilyActivitySelectionData(data)
    }

    /// Loads FamilyActivitySelection from App Groups
    /// Returns nil if no selection has been saved
    public static func loadFromAppGroups() throws -> FamilyActivitySelection? {
        guard let data = AppGroupsManager.shared.getFamilyActivitySelectionData() else {
            return nil
        }
        return try decode(data)
    }

    /// Clears the saved FamilyActivitySelection from App Groups
    public static func clearFromAppGroups() {
        AppGroupsManager.shared.setFamilyActivitySelectionData(nil)
    }

    // MARK: - Selection Info (for debugging/display)

    /// Returns a summary of the selection contents
    public static func getSummary(_ selection: FamilyActivitySelection) -> SelectionSummary {
        return SelectionSummary(
            applicationCount: selection.applicationTokens.count,
            categoryCount: selection.categoryTokens.count,
            webDomainCount: selection.webDomainTokens.count,
            isEmpty: selection.applicationTokens.isEmpty &&
                     selection.categoryTokens.isEmpty &&
                     selection.webDomainTokens.isEmpty
        )
    }
}

// MARK: - Supporting Types

/// Summary information about a FamilyActivitySelection
public struct SelectionSummary: Codable {
    public let applicationCount: Int
    public let categoryCount: Int
    public let webDomainCount: Int
    public let isEmpty: Bool

    /// Total number of items selected
    public var totalCount: Int {
        return applicationCount + categoryCount + webDomainCount
    }
}
