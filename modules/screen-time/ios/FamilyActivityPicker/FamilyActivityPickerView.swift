import SwiftUI
import FamilyControls

/// SwiftUI view wrapper for FamilyActivityPicker
/// This is required because FamilyActivityPicker is SwiftUI-only
@available(iOS 15.0, *)
struct FamilyActivityPickerView: View {
    @Binding var selection: FamilyActivitySelection
    @Binding var isPresented: Bool
    let headerText: String
    let footerText: String
    let onSelectionComplete: ((FamilyActivitySelection) -> Void)?

    var body: some View {
        NavigationView {
            VStack {
                if !headerText.isEmpty {
                    Text(headerText)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                        .padding(.top)
                }

                FamilyActivityPicker(selection: $selection)

                if !footerText.isEmpty {
                    Text(footerText)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                        .padding(.bottom)
                }
            }
            .navigationTitle("アプリを選択")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") {
                        isPresented = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("完了") {
                        onSelectionComplete?(selection)
                        isPresented = false
                    }
                }
            }
        }
    }
}

/// UIHostingController wrapper for presenting FamilyActivityPickerView
@available(iOS 15.0, *)
final class FamilyActivityPickerHostingController: UIHostingController<FamilyActivityPickerView> {
    private var selection: FamilyActivitySelection
    private var isPresented: Bool = true
    private let onComplete: ((FamilyActivitySelection) -> Void)?
    private let onDismiss: (() -> Void)?

    init(
        initialSelection: FamilyActivitySelection = FamilyActivitySelection(),
        headerText: String = "",
        footerText: String = "",
        onComplete: ((FamilyActivitySelection) -> Void)? = nil,
        onDismiss: (() -> Void)? = nil
    ) {
        self.selection = initialSelection
        self.onComplete = onComplete
        self.onDismiss = onDismiss

        // Create placeholder view first
        let placeholderView = FamilyActivityPickerView(
            selection: .constant(FamilyActivitySelection()),
            isPresented: .constant(true),
            headerText: headerText,
            footerText: footerText,
            onSelectionComplete: nil
        )

        super.init(rootView: placeholderView)

        // Now update with proper bindings
        self.rootView = FamilyActivityPickerView(
            selection: Binding(
                get: { [weak self] in self?.selection ?? FamilyActivitySelection() },
                set: { [weak self] newValue in self?.selection = newValue }
            ),
            isPresented: Binding(
                get: { [weak self] in self?.isPresented ?? false },
                set: { [weak self] newValue in
                    self?.isPresented = newValue
                    if !newValue {
                        self?.dismiss(animated: true) {
                            self?.onDismiss?()
                        }
                    }
                }
            ),
            headerText: headerText,
            footerText: footerText,
            onSelectionComplete: { [weak self] finalSelection in
                self?.onComplete?(finalSelection)
            }
        )
    }

    @MainActor required dynamic init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

/// Manager class to present FamilyActivityPicker from anywhere
@available(iOS 15.0, *)
public final class FamilyActivityPickerManager {

    public static let shared = FamilyActivityPickerManager()

    private init() {}

    /// Present the FamilyActivityPicker modally
    /// - Parameters:
    ///   - headerText: Optional header text displayed above the picker
    ///   - footerText: Optional footer text displayed below the picker
    ///   - completion: Called with the final selection when user taps "Done"
    ///   - onDismiss: Called when the picker is dismissed (cancel or done)
    public func present(
        headerText: String = "",
        footerText: String = "",
        completion: @escaping (FamilyActivitySelection) -> Void,
        onDismiss: (() -> Void)? = nil
    ) {
        DispatchQueue.main.async {
            guard let rootVC = self.topViewController() else {
                print("[FamilyActivityPickerManager] No root view controller found")
                return
            }

            // Load existing selection from App Groups
            var initialSelection = FamilyActivitySelection()
            if let savedSelection = try? SelectionSerializer.loadFromAppGroups() {
                initialSelection = savedSelection
            }

            let hostingController = FamilyActivityPickerHostingController(
                initialSelection: initialSelection,
                headerText: headerText,
                footerText: footerText,
                onComplete: completion,
                onDismiss: onDismiss
            )

            hostingController.modalPresentationStyle = .formSheet
            rootVC.present(hostingController, animated: true)
        }
    }

    private func topViewController() -> UIViewController? {
        guard let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first,
              let window = windowScene.windows.first(where: { $0.isKeyWindow }),
              var topController = window.rootViewController else {
            return nil
        }

        while let presentedController = topController.presentedViewController {
            topController = presentedController
        }

        return topController
    }
}
