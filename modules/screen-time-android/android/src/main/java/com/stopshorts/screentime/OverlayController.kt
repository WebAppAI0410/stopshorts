package com.stopshorts.screentime

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Build
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Manages overlay window display when target apps are detected.
 * Shows a full-screen check-in overlay with action buttons.
 */
class OverlayController(private val context: Context) {

    private val windowManager: WindowManager =
        context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    private var overlayView: View? = null
    private var callback: OverlayCallback? = null

    /**
     * Callback interface for overlay user actions
     */
    interface OverlayCallback {
        fun onContinueAnyway()
        fun onGoBack()
        fun onUrgeSurfing()  // New: Launch urge surfing screen
    }

    /**
     * Set callback for overlay actions
     */
    fun setCallback(callback: OverlayCallback) {
        this.callback = callback
    }

    /**
     * Check if overlay is currently showing
     */
    fun isOverlayShowing(): Boolean {
        return overlayView != null
    }

    /**
     * Show the full-screen overlay
     */
    fun showOverlay() {
        if (isOverlayShowing()) {
            return
        }

        try {
            overlayView = createOverlayView()
            windowManager.addView(overlayView, createLayoutParams())
        } catch (e: Exception) {
            e.printStackTrace()
            overlayView = null
        }
    }

    /**
     * Hide the overlay
     */
    fun hideOverlay() {
        try {
            overlayView?.let {
                windowManager.removeView(it)
                overlayView = null
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Create layout parameters for overlay window
     */
    private fun createLayoutParams(): WindowManager.LayoutParams {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        return WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            type,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
            WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        )
    }

    /**
     * Create the overlay view programmatically
     */
    private fun createOverlayView(): View {
        // Root container with semi-transparent dark background
        val rootLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#CC000000")) // 80% black
            gravity = Gravity.CENTER
            setPadding(dpToPx(32), dpToPx(32), dpToPx(32), dpToPx(32))
        }

        // Card container
        val cardLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setBackgroundColor(Color.WHITE)
            setPadding(dpToPx(24), dpToPx(32), dpToPx(24), dpToPx(32))

            // Rounded corners
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(8).toFloat()
            }
        }

        // Title
        val titleText = TextView(context).apply {
            text = "チェックイン"
            textSize = 24f
            setTextColor(Color.parseColor("#1A1A1A"))
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(16)
            }
        }

        // Message
        val messageText = TextView(context).apply {
            text = "ショート動画アプリを開こうとしています。\n本当に続けますか？"
            textSize = 16f
            setTextColor(Color.parseColor("#4A4A4A"))
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(32)
            }
        }

        // Urge Surfing button (primary action - helps user manage urge)
        val urgeSurfingButton = Button(context).apply {
            text = "🌊 衝動サーフィングを試す"
            textSize = 16f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#1E3A5F")) // Primary color
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAllCaps = false
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(48)
            ).apply {
                bottomMargin = dpToPx(12)
            }

            setOnClickListener {
                callback?.onUrgeSurfing()
                hideOverlay()
            }
        }

        // Go back button
        val goBackButton = Button(context).apply {
            text = "戻る"
            textSize = 16f
            setTextColor(Color.parseColor("#4A4A4A"))
            setBackgroundColor(Color.parseColor("#F5F5F5"))
            isAllCaps = false
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(48)
            ).apply {
                bottomMargin = dpToPx(12)
            }

            setOnClickListener {
                callback?.onGoBack()
                hideOverlay()
            }
        }

        // Continue button (secondary - less desirable action)
        val continueButton = Button(context).apply {
            text = "そのまま続ける"
            textSize = 14f
            setTextColor(Color.parseColor("#999999"))
            setBackgroundColor(Color.TRANSPARENT)
            isAllCaps = false
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(40)
            )

            setOnClickListener {
                callback?.onContinueAnyway()
                hideOverlay()
            }
        }

        // Assemble card
        cardLayout.addView(titleText)
        cardLayout.addView(messageText)
        cardLayout.addView(urgeSurfingButton)
        cardLayout.addView(goBackButton)
        cardLayout.addView(continueButton)

        // Add card to root
        rootLayout.addView(cardLayout)

        return rootLayout
    }

    /**
     * Convert dp to pixels
     */
    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }
}
