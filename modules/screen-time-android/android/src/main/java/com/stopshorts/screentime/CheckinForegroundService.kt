package com.stopshorts.screentime

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service that monitors app usage and triggers check-in overlays
 * when target apps (TikTok, YouTube, Instagram) are detected.
 *
 * Supports two intervention timing modes:
 * - immediate: Show overlay immediately when target app is detected
 * - delayed: Show overlay when cumulative usage for the day reaches a threshold
 */
class CheckinForegroundService : Service() {

    companion object {
        private const val TAG = "CheckinForegroundService"
        private const val NOTIFICATION_ID = 1001
        private const val INTERVENTION_NOTIFICATION_ID = 1002
        private const val CHANNEL_ID = "checkin_monitoring_channel"
        private const val INTERVENTION_CHANNEL_ID = "checkin_intervention_channel"
        private const val CHANNEL_NAME = "App Monitoring"
        private const val INTERVENTION_CHANNEL_NAME = "Intervention Alerts"

        private const val CHECK_INTERVAL_MS = 1500L // Check every 1.5 seconds
        // Cooldown for IMMEDIATE mode only. Delayed mode uses threshold-based triggering.
        // See docs/specs/06_intervention_timing.md
        private const val COOLDOWN_PERIOD_MS = 5 * 60 * 1000L // 5 minutes cooldown (immediate mode)

        const val ACTION_START_MONITORING = "com.stopshorts.screentime.START_MONITORING"
        const val ACTION_STOP_MONITORING = "com.stopshorts.screentime.STOP_MONITORING"
        const val ACTION_UPDATE_TARGETS = "com.stopshorts.screentime.UPDATE_TARGETS"
        const val ACTION_UPDATE_SETTINGS = "com.stopshorts.screentime.UPDATE_SETTINGS"
        const val EXTRA_PACKAGE_NAMES = "package_names"
        const val EXTRA_TIMING = "timing"
        const val EXTRA_DELAY_MINUTES = "delay_minutes"

        // Shared preference keys
        private const val PREFS_NAME = "checkin_settings"
        private const val PREF_TIMING = "intervention_timing"
        private const val PREF_DELAY = "intervention_delay"

        // Static flag to track if service is running
        // This is more reliable than getRunningServices() which is deprecated
        @Volatile
        private var isServiceRunning = false

        /**
         * Check if the monitoring service is currently running
         */
        fun isRunning(): Boolean = isServiceRunning

        /**
         * Start the monitoring service
         */
        fun startMonitoring(context: Context, packageNames: List<String>) {
            val intent = Intent(context, CheckinForegroundService::class.java).apply {
                action = ACTION_START_MONITORING
                putStringArrayListExtra(EXTRA_PACKAGE_NAMES, ArrayList(packageNames))
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        /**
         * Stop the monitoring service
         */
        fun stopMonitoring(context: Context) {
            val intent = Intent(context, CheckinForegroundService::class.java).apply {
                action = ACTION_STOP_MONITORING
            }
            context.startService(intent)
        }

        /**
         * Update target apps while service is running
         */
        fun updateTargetApps(context: Context, packageNames: List<String>) {
            val intent = Intent(context, CheckinForegroundService::class.java).apply {
                action = ACTION_UPDATE_TARGETS
                putStringArrayListExtra(EXTRA_PACKAGE_NAMES, ArrayList(packageNames))
            }
            context.startService(intent)
        }

        /**
         * Update intervention settings (timing mode and delay)
         */
        fun updateInterventionSettings(context: Context, timing: String, delayMinutes: Int) {
            // Save to shared preferences for persistence
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString(PREF_TIMING, timing)
                putInt(PREF_DELAY, delayMinutes)
                apply()
            }

            // Update running service if active
            val intent = Intent(context, CheckinForegroundService::class.java).apply {
                action = ACTION_UPDATE_SETTINGS
                putExtra(EXTRA_TIMING, timing)
                putExtra(EXTRA_DELAY_MINUTES, delayMinutes)
            }
            context.startService(intent)
        }
    }

    // Check if app is debuggable at runtime (works correctly for library modules)
    private val isDebuggable: Boolean by lazy {
        (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
    }

    // Debug logging helper - only logs in debug builds
    private fun logDebug(message: String) {
        if (isDebuggable) {
            Log.d(TAG, message)
        }
    }

    // Worker thread for UsageStats API calls (avoid ANR on main thread)
    private var workerThread: HandlerThread? = null
    private var workerHandler: Handler? = null
    // Main thread handler for UI operations (overlay)
    private val mainHandler = Handler(Looper.getMainLooper())

    private lateinit var usageStatsTracker: UsageStatsTracker
    private lateinit var overlayController: OverlayController
    private var targetPackages: MutableSet<String> = mutableSetOf()
    private val lastCheckinTimestamps: MutableMap<String, Long> = mutableMapOf()
    private var isMonitoring = false

    // Intervention timing settings
    private var interventionTiming: String = "immediate" // "immediate" or "delayed"
    private var interventionDelayMinutes: Int = 5 // 5, 10, or 15

    // Track cumulative threshold crossings per app (for delayed mode)
    private val lastThresholdCounts: MutableMap<String, Int> = mutableMapOf()
    private var lastThresholdDate: String = ""

    private val monitoringRunnable = object : Runnable {
        override fun run() {
            if (!isMonitoring) return

            checkForegroundApp()

            // Schedule next check on worker thread
            workerHandler?.postDelayed(this, CHECK_INTERVAL_MS)
        }
    }

    // Track the currently detected app for intervention events
    private var currentDetectedApp: String? = null

    override fun onCreate() {
        super.onCreate()

        // Initialize worker thread for UsageStats API calls
        workerThread = HandlerThread("UsageStatsWorker").apply { start() }
        workerHandler = Handler(workerThread!!.looper)

        usageStatsTracker = UsageStatsTracker(applicationContext)
        overlayController = OverlayController(applicationContext)
        createNotificationChannel()
        createInterventionNotificationChannel()
        loadInterventionSettings()
        setupOverlayCallback()
    }

    /**
     * Load intervention settings from shared preferences
     */
    private fun loadInterventionSettings() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        interventionTiming = prefs.getString(PREF_TIMING, "immediate") ?: "immediate"
        interventionDelayMinutes = prefs.getInt(PREF_DELAY, 5)
        logDebug("Loaded settings: timing=$interventionTiming, delay=$interventionDelayMinutes min")
    }

    /**
     * Set up overlay callback to handle user actions
     */
    private fun setupOverlayCallback() {
        overlayController.setCallback(object : OverlayController.OverlayCallback {
            override fun onContinueAnyway() {
                // User chose to continue using the app
                // The overlay is already hidden by OverlayController
                logDebug("User chose to continue")

                // Send intervention event to React Native (proceeded = true)
                sendInterventionEvent(proceeded = true, appPackage = currentDetectedApp ?: "")
            }

            override fun onGoBack() {
                // User chose to go back - bring them to home screen
                val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_HOME)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                applicationContext.startActivity(homeIntent)
                logDebug("User chose to go back")

                // Send intervention event to React Native (proceeded = false)
                sendInterventionEvent(proceeded = false, appPackage = currentDetectedApp ?: "")
            }

            override fun onUrgeSurfing() {
                // User chose to do urge surfing - launch app with deep link
                val appPackage = currentDetectedApp ?: ""
                launchUrgeSurfing(appPackage)

                // Send intervention event (proceeded = false since they're doing something constructive)
                sendInterventionEvent(proceeded = false, appPackage = appPackage)
            }
        })
    }

    /**
     * Send intervention event to React Native via broadcast
     */
    private fun sendInterventionEvent(proceeded: Boolean, appPackage: String) {
        val intent = Intent(ScreenTimeAndroidModule.ACTION_INTERVENTION_EVENT).apply {
            putExtra(ScreenTimeAndroidModule.EXTRA_PROCEEDED, proceeded)
            putExtra(ScreenTimeAndroidModule.EXTRA_APP_PACKAGE, appPackage)
            putExtra(ScreenTimeAndroidModule.EXTRA_TIMESTAMP, System.currentTimeMillis())
            // Set package to ensure only our app receives this broadcast
            setPackage(applicationContext.packageName)
        }
        applicationContext.sendBroadcast(intent)
        logDebug("Sent intervention event - proceeded=$proceeded, app=$appPackage")
    }

    /**
     * Launch urge surfing screen via deep link
     *
     * Note: Android 10+ restricts background activity starts. This method attempts to launch
     * the activity but may fail silently on some devices. The caller should always have a
     * fallback (notification or overlay).
     *
     * @return true if launch was attempted without exception, false otherwise
     */
    private fun launchUrgeSurfing(appPackage: String): Boolean {
        // On Android 10+, background activity starts are restricted.
        // Foreground services can still start activities in most cases,
        // but we should be prepared for failures.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            logDebug("Android 10+: Background activity start may be restricted")
        }

        val deepLinkUri = android.net.Uri.parse("stopshorts://urge-surfing?app=$appPackage")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            setPackage(applicationContext.packageName)
            // Add category to help with activity resolution
            addCategory(Intent.CATEGORY_DEFAULT)
        }

        return try {
            applicationContext.startActivity(deepLinkIntent)
            logDebug("Launched urge surfing with deep link: $deepLinkUri")
            true
        } catch (e: Exception) {
            Log.w(TAG, "Deep link failed: ${e.message}")

            // Fallback: try launching the main app
            val launchIntent = packageManager.getLaunchIntentForPackage(applicationContext.packageName)
            if (launchIntent != null) {
                launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                return try {
                    applicationContext.startActivity(launchIntent)
                    logDebug("Launched app via main intent")
                    true
                } catch (fallbackError: Exception) {
                    Log.w(TAG, "Main intent launch also failed: ${fallbackError.message}")
                    false
                }
            }
            false
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_MONITORING -> {
                val packages = intent.getStringArrayListExtra(EXTRA_PACKAGE_NAMES)
                    ?: UsageStatsTracker.TARGET_PACKAGES
                startMonitoring(packages)
            }
            ACTION_STOP_MONITORING -> {
                stopMonitoring()
            }
            ACTION_UPDATE_TARGETS -> {
                val packages = intent.getStringArrayListExtra(EXTRA_PACKAGE_NAMES)
                    ?: UsageStatsTracker.TARGET_PACKAGES
                updateTargetApps(packages)
            }
            ACTION_UPDATE_SETTINGS -> {
                val timing = intent.getStringExtra(EXTRA_TIMING) ?: "immediate"
                val delayMinutes = intent.getIntExtra(EXTRA_DELAY_MINUTES, 5)
                updateInterventionSettings(timing, delayMinutes)
            }
        }

        return START_STICKY
    }

    /**
     * Update intervention settings at runtime
     */
    private fun updateInterventionSettings(timing: String, delayMinutes: Int) {
        interventionTiming = timing
        interventionDelayMinutes = delayMinutes
        logDebug("Updated settings: timing=$timing, delay=$delayMinutes min")

        // Clear threshold tracking when settings change
        lastThresholdCounts.clear()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()

        // Clean up worker thread
        workerThread?.quitSafely()
        workerThread = null
        workerHandler = null
    }

    /**
     * Start monitoring foreground apps
     */
    private fun startMonitoring(packageNames: List<String>) {
        Log.i(TAG, "startMonitoring called with packages: $packageNames")

        if (isMonitoring) {
            // Already monitoring, just update targets
            Log.i(TAG, "Already monitoring, updating targets")
            updateTargetApps(packageNames)
            return
        }

        targetPackages.clear()
        targetPackages.addAll(packageNames)
        isMonitoring = true
        isServiceRunning = true  // Update static flag

        Log.i(TAG, "Monitoring started with ${targetPackages.size} target packages: $targetPackages")
        Log.i(TAG, "Intervention settings: timing=$interventionTiming, delay=$interventionDelayMinutes min")

        // Start foreground service with notification
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        // Start monitoring loop on worker thread (avoid ANR)
        workerHandler?.post(monitoringRunnable)
    }

    /**
     * Stop monitoring foreground apps
     */
    private fun stopMonitoring() {
        isMonitoring = false
        isServiceRunning = false  // Update static flag
        workerHandler?.removeCallbacks(monitoringRunnable)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    /**
     * Update the list of target apps to monitor
     */
    private fun updateTargetApps(packageNames: List<String>) {
        targetPackages.clear()
        targetPackages.addAll(packageNames)

        // Update notification to reflect changes
        val notification = createNotification()
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    /**
     * Check current foreground app and trigger overlay if needed
     */
    private fun checkForegroundApp() {
        try {
            resetDailyThresholdsIfNeeded()
            val currentApp = usageStatsTracker.getCurrentForegroundApp()
            val now = System.currentTimeMillis()

            // Enhanced debug logging
            logDebug("checkForegroundApp: currentApp=$currentApp, targetPackages=$targetPackages, timing=$interventionTiming")

            // Check if current app is in target list
            if (currentApp != null && currentApp in targetPackages) {
                logDebug("Target app detected: $currentApp")
                if (interventionTiming == "immediate") {
                    // Immediate mode: launch urge surfing directly if possible, fallback to overlay
                    val shouldShow = shouldShowOverlay(currentApp)
                    logDebug("Immediate mode - shouldShowOverlay=$shouldShow")
                    if (shouldShow) {
                        currentDetectedApp = currentApp
                        logDebug("Attempting to launch urge surfing for $currentApp")
                        val opened = launchUrgeSurfing(currentApp)
                        logDebug("launchUrgeSurfing result: $opened")
                        if (opened) {
                            sendInterventionEvent(proceeded = false, appPackage = currentApp)
                        } else {
                            logDebug("Falling back to overlay for $currentApp")
                            triggerCheckinOverlay(currentApp)
                        }
                        lastCheckinTimestamps[currentApp] = now
                    }
                } else {
                    // Delayed mode: cumulative usage threshold per day
                    handleCumulativeIntervention(currentApp, now)
                }
            } else {
                // No target app in foreground
            }
        } catch (e: Exception) {
            // Log error but don't crash the service
            Log.e(TAG, "Error in checkForegroundApp", e)
        }
    }

    /**
     * Handle delayed intervention mode - show overlay after daily cumulative usage reaches threshold
     *
     * Per spec (docs/specs/06_intervention_timing.md):
     * - Trigger at each cumulative threshold (e.g., 10, 20, 30 minutes)
     * - Use lastThresholdCounts to prevent duplicate triggers at the same threshold
     * - Do NOT apply 5-minute cooldown in delayed mode; threshold count is the gate
     */
    private fun handleCumulativeIntervention(packageName: String, now: Long) {
        if (interventionDelayMinutes <= 0) return

        val totalMinutesToday = getTodayUsageMinutes(packageName, now)
        val thresholdCount = totalMinutesToday / interventionDelayMinutes
        val lastCount = lastThresholdCounts[packageName] ?: 0

        // Trigger only when crossing a new threshold
        // This replaces the cooldown logic for delayed mode - we only care about threshold crossings
        if (thresholdCount <= lastCount) return

        logDebug("Cumulative threshold reached for $packageName (${totalMinutesToday}min, threshold #$thresholdCount)")

        // Attempt to launch urge surfing directly; fallback to notification + overlay
        currentDetectedApp = packageName
        val opened = launchUrgeSurfing(packageName)
        if (opened) {
            sendInterventionEvent(proceeded = false, appPackage = packageName)
        } else {
            // Send high-priority notification first
            sendInterventionNotification(packageName)
            // Show overlay as fallback
            triggerCheckinOverlay(packageName)
        }

        // Mark threshold as triggered
        lastThresholdCounts[packageName] = thresholdCount
        lastCheckinTimestamps[packageName] = now
    }

    private fun getTodayUsageMinutes(packageName: String, now: Long): Int {
        val startOfDay = getStartOfDayMillis(now)
        val stats = usageStatsTracker.getUsageStatsWithFallback(startOfDay, now, listOf(packageName))
        val totalMs = stats.firstOrNull()?.get("totalTimeMs") as? Number ?: 0
        return (totalMs.toLong() / 60000L).toInt()
    }

    private fun getStartOfDayMillis(now: Long): Long {
        val calendar = java.util.Calendar.getInstance().apply {
            timeInMillis = now
            set(java.util.Calendar.HOUR_OF_DAY, 0)
            set(java.util.Calendar.MINUTE, 0)
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }
        return calendar.timeInMillis
    }

    private fun resetDailyThresholdsIfNeeded() {
        val todayKey = getDateKey(System.currentTimeMillis())
        if (todayKey != lastThresholdDate) {
            lastThresholdDate = todayKey
            lastThresholdCounts.clear()
            lastCheckinTimestamps.clear()
            logDebug("Reset daily thresholds for $todayKey")
        }
    }

    private fun getDateKey(timestamp: Long): String {
        val calendar = java.util.Calendar.getInstance().apply { timeInMillis = timestamp }
        val year = calendar.get(java.util.Calendar.YEAR)
        val month = calendar.get(java.util.Calendar.MONTH) + 1
        val day = calendar.get(java.util.Calendar.DAY_OF_MONTH)
        return String.format("%04d-%02d-%02d", year, month, day)
    }

    /**
     * Check if overlay should be shown based on cooldown period.
     *
     * NOTE: This cooldown is ONLY used for immediate mode to prevent rapid successive triggers.
     * For delayed (cumulative) mode, the threshold count mechanism in handleCumulativeIntervention
     * serves as the gate, not this cooldown. See docs/specs/06_intervention_timing.md.
     */
    private fun shouldShowOverlay(packageName: String): Boolean {
        val lastCheckin = lastCheckinTimestamps[packageName] ?: return true
        val timeSinceLastCheckin = System.currentTimeMillis() - lastCheckin
        return timeSinceLastCheckin >= COOLDOWN_PERIOD_MS
    }

    /**
     * Trigger the check-in overlay for the detected app
     */
    private fun triggerCheckinOverlay(packageName: String) {
        val appName = UsageStatsTracker.APP_DISPLAY_NAMES[packageName] ?: packageName

        // Check if overlay is already showing to avoid duplicate overlays
        if (overlayController.isOverlayShowing()) {
            return
        }

        // Store the current app for intervention event
        currentDetectedApp = packageName

        // Show overlay on main thread (UI operation)
        mainHandler.post {
            try {
                overlayController.showOverlay()
                logDebug("Showing overlay for $appName ($packageName)")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to show overlay", e)
            }
        }
    }

    /**
     * Create notification channel (required for Android 8.0+)
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors app usage for check-in prompts"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Create high-priority notification channel for intervention alerts
     */
    private fun createInterventionNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                INTERVENTION_CHANNEL_ID,
                INTERVENTION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alerts when you've been using a tracked app for too long"
                setShowBadge(true)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Send high-priority notification when intervention is triggered.
     * Uses fullScreenIntent on Android 10+ to ensure the notification can interrupt
     * even when background activity starts are restricted.
     */
    private fun sendInterventionNotification(packageName: String) {
        val appName = UsageStatsTracker.APP_DISPLAY_NAMES[packageName] ?: packageName

        // Create intent to open the app with deep link
        val deepLinkUri = android.net.Uri.parse("stopshorts://urge-surfing?app=$packageName")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            setPackage(applicationContext.packageName)
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            deepLinkIntent,
            pendingIntentFlags
        )

        // Create a separate pending intent for fullScreenIntent (use different request code)
        val fullScreenPendingIntent = PendingIntent.getActivity(
            this,
            1,
            deepLinkIntent,
            pendingIntentFlags
        )

        val iconResId = applicationContext.resources.getIdentifier(
            "ic_launcher",
            "mipmap",
            applicationContext.packageName
        ).takeIf { it != 0 } ?: android.R.drawable.ic_dialog_alert

        val notification = NotificationCompat.Builder(this, INTERVENTION_CHANNEL_ID)
            .setContentTitle("⏰ $interventionDelayMinutes 分経過しました")
            .setContentText("$appName を使い続けていますね。休憩しませんか？")
            .setSmallIcon(iconResId)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)  // Use ALARM for higher priority
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            // fullScreenIntent allows activity to start even on Android 10+ when device is locked
            // or when background activity starts are restricted
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "衝動サーフィングを開始",
                pendingIntent
            )
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(INTERVENTION_NOTIFICATION_ID, notification)
        logDebug("Sent intervention notification with fullScreenIntent for $appName")
    }

    /**
     * Create the persistent notification for foreground service
     */
    private fun createNotification(): Notification {
        val notificationIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
        )

        val appCount = targetPackages.size
        val contentText = if (appCount > 0) {
            "Monitoring $appCount app${if (appCount > 1) "s" else ""}"
        } else {
            "Monitoring app usage"
        }

        // Get the app's launcher icon dynamically
        val iconResId = applicationContext.resources.getIdentifier(
            "ic_launcher",
            "mipmap",
            applicationContext.packageName
        ).takeIf { it != 0 } ?: android.R.drawable.ic_menu_view // Fallback if not found

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("StopShorts is active")
            .setContentText(contentText)
            .setSmallIcon(iconResId)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }
}
