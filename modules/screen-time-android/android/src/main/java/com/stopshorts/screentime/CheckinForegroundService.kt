package com.stopshorts.screentime

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service that monitors app usage and triggers check-in overlays
 * when target apps (TikTok, YouTube, Instagram) are detected.
 */
class CheckinForegroundService : Service() {

    companion object {
        private const val TAG = "CheckinForegroundService"

        // Debug logging helper - only logs in debug builds
        private fun logDebug(message: String) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, message)
            }
        }
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "checkin_monitoring_channel"
        private const val CHANNEL_NAME = "App Monitoring"

        private const val CHECK_INTERVAL_MS = 1500L // Check every 1.5 seconds
        private const val COOLDOWN_PERIOD_MS = 5 * 60 * 1000L // 5 minutes cooldown

        const val ACTION_START_MONITORING = "com.stopshorts.screentime.START_MONITORING"
        const val ACTION_STOP_MONITORING = "com.stopshorts.screentime.STOP_MONITORING"
        const val ACTION_UPDATE_TARGETS = "com.stopshorts.screentime.UPDATE_TARGETS"
        const val EXTRA_PACKAGE_NAMES = "package_names"

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
    }

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var usageStatsTracker: UsageStatsTracker
    private lateinit var overlayController: OverlayController
    private var targetPackages: MutableSet<String> = mutableSetOf()
    private val lastCheckinTimestamps: MutableMap<String, Long> = mutableMapOf()
    private var isMonitoring = false

    private val monitoringRunnable = object : Runnable {
        override fun run() {
            if (!isMonitoring) return

            checkForegroundApp()

            // Schedule next check
            handler.postDelayed(this, CHECK_INTERVAL_MS)
        }
    }

    // Track the currently detected app for intervention events
    private var currentDetectedApp: String? = null

    override fun onCreate() {
        super.onCreate()
        usageStatsTracker = UsageStatsTracker(applicationContext)
        overlayController = OverlayController(applicationContext)
        createNotificationChannel()
        setupOverlayCallback()
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
                val deepLinkUri = android.net.Uri.parse("stopshorts://urge-surfing?app=$appPackage")

                val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    setPackage(applicationContext.packageName)
                }

                try {
                    applicationContext.startActivity(deepLinkIntent)
                    logDebug("Launching urge surfing with deep link: $deepLinkUri")
                } catch (e: Exception) {
                    // Fallback: just open the app
                    logDebug("Deep link failed, opening app normally")
                    val launchIntent = packageManager.getLaunchIntentForPackage(applicationContext.packageName)
                    launchIntent?.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    launchIntent?.let { applicationContext.startActivity(it) }
                }

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
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()
    }

    /**
     * Start monitoring foreground apps
     */
    private fun startMonitoring(packageNames: List<String>) {
        if (isMonitoring) {
            // Already monitoring, just update targets
            updateTargetApps(packageNames)
            return
        }

        targetPackages.clear()
        targetPackages.addAll(packageNames)
        isMonitoring = true

        // Start foreground service with notification
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        // Start monitoring loop
        handler.post(monitoringRunnable)
    }

    /**
     * Stop monitoring foreground apps
     */
    private fun stopMonitoring() {
        isMonitoring = false
        handler.removeCallbacks(monitoringRunnable)
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
            val currentApp = usageStatsTracker.getCurrentForegroundApp()

            // Check if current app is in target list
            if (currentApp != null && currentApp in targetPackages) {
                // Check cooldown period
                if (shouldShowOverlay(currentApp)) {
                    triggerCheckinOverlay(currentApp)
                    lastCheckinTimestamps[currentApp] = System.currentTimeMillis()
                }
            }
        } catch (e: Exception) {
            // Log error but don't crash the service
            e.printStackTrace()
        }
    }

    /**
     * Check if overlay should be shown based on cooldown period
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

        // Show overlay on main thread
        handler.post {
            try {
                overlayController.showOverlay()
                logDebug("Showing overlay for $appName ($packageName)")
            } catch (e: Exception) {
                e.printStackTrace()
                logDebug("Failed to show overlay - ${e.message}")
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
