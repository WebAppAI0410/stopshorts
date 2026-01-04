package com.stopshorts.screentime

import android.app.AppOpsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class ScreenTimeAndroidModule : Module() {
    private val context: Context
        get() = requireNotNull(appContext.reactContext)

    companion object {
        // Action for intervention events broadcast
        const val ACTION_INTERVENTION_EVENT = "com.stopshorts.screentime.INTERVENTION_EVENT"
        const val EXTRA_PROCEEDED = "proceeded"
        const val EXTRA_APP_PACKAGE = "app_package"
        const val EXTRA_TIMESTAMP = "timestamp"
    }

    // Broadcast receiver for intervention events from the foreground service
    private var interventionReceiver: BroadcastReceiver? = null

    private val usageStatsTracker: UsageStatsTracker by lazy {
        UsageStatsTracker(context)
    }

    private val installedAppsHelper: InstalledAppsHelper by lazy {
        InstalledAppsHelper(context)
    }

    override fun definition() = ModuleDefinition {
        Name("ScreenTimeAndroid")

        // Event for intervention notifications (user choice in overlay)
        Events("onIntervention")

        // Register receiver when module starts
        OnCreate {
            registerInterventionReceiver()
        }

        // Unregister receiver when module is destroyed
        OnDestroy {
            unregisterInterventionReceiver()
        }

        // Get permission status for all required permissions
        AsyncFunction("getPermissionStatus") {
            val usageStats = hasUsageStatsPermission()
            val overlay = hasOverlayPermission()
            val notifications = hasNotificationPermission()

            mapOf(
                "usageStats" to usageStats,
                "overlay" to overlay,
                "notifications" to notifications
            )
        }

        // Check if usage stats permission is granted
        AsyncFunction("hasUsageStatsPermission") {
            hasUsageStatsPermission()
        }

        // Check if overlay permission is granted
        AsyncFunction("hasOverlayPermission") {
            hasOverlayPermission()
        }

        // Open usage stats settings
        AsyncFunction("openUsageStatsSettings") {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }

        // Open overlay settings
        AsyncFunction("openOverlaySettings") {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                android.net.Uri.parse("package:${context.packageName}")
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }

        // Get usage statistics for specified packages (with events fallback)
        AsyncFunction("getUsageStats") { startTime: Long, endTime: Long, packageNames: List<String> ->
            android.util.Log.d("ScreenTimeModule", "getUsageStats called: startTime=$startTime, endTime=$endTime, packages=$packageNames")

            if (!hasUsageStatsPermission()) {
                android.util.Log.w("ScreenTimeModule", "getUsageStats: No permission")
                return@AsyncFunction emptyList<Map<String, Any>>()
            }

            // Use fallback method that tries queryEvents first, then queryUsageStats
            val result = usageStatsTracker.getUsageStatsWithFallback(startTime, endTime, packageNames)
            android.util.Log.d("ScreenTimeModule", "getUsageStats result: ${result.size} apps")
            result
        }

        // Get today's usage for target apps (with events fallback for accuracy)
        AsyncFunction("getTodayUsage") { packageNames: List<String> ->
            android.util.Log.d("ScreenTimeModule", "getTodayUsage called with packages: $packageNames")

            val hasPermission = hasUsageStatsPermission()
            android.util.Log.d("ScreenTimeModule", "hasUsageStatsPermission: $hasPermission")

            if (!hasPermission) {
                android.util.Log.w("ScreenTimeModule", "No usage stats permission, returning empty")
                return@AsyncFunction emptyList<Map<String, Any>>()
            }

            val now = System.currentTimeMillis()
            val startOfDay = java.util.Calendar.getInstance().apply {
                set(java.util.Calendar.HOUR_OF_DAY, 0)
                set(java.util.Calendar.MINUTE, 0)
                set(java.util.Calendar.SECOND, 0)
                set(java.util.Calendar.MILLISECOND, 0)
            }.timeInMillis

            android.util.Log.d("ScreenTimeModule", "Querying from $startOfDay to $now")
            // Use fallback method that tries queryEvents first, then queryUsageStats
            val result = usageStatsTracker.getUsageStatsWithFallback(startOfDay, now, packageNames)
            android.util.Log.d("ScreenTimeModule", "getTodayUsage result: ${result.size} apps")
            result
        }

        // Get current foreground app
        AsyncFunction("getCurrentForegroundApp") {
            if (!hasUsageStatsPermission()) {
                return@AsyncFunction null
            }
            usageStatsTracker.getCurrentForegroundApp()
        }

        // ============================================
        // Installed Apps Functions (Android only)
        // Note: iOS implementation pending - requires Family Controls Entitlement
        // ============================================

        // Get list of installed launcher apps (excludes system apps)
        AsyncFunction("getInstalledApps") {
            installedAppsHelper.getInstalledLauncherApps()
        }

        // Get app icon as Base64 encoded string
        AsyncFunction("getAppIcon") { packageName: String ->
            installedAppsHelper.getAppIcon(packageName)
        }

        // Get app name for a package
        AsyncFunction("getAppName") { packageName: String ->
            installedAppsHelper.getAppName(packageName)
        }

        // Check if an app is installed
        AsyncFunction("isAppInstalled") { packageName: String ->
            installedAppsHelper.isAppInstalled(packageName)
        }

        // ============================================
        // Monitoring Service Control Functions
        // ============================================

        // Start monitoring target apps
        AsyncFunction("startMonitoring") { packageNames: List<String> ->
            CheckinForegroundService.startMonitoring(context, packageNames)
            true
        }

        // Stop monitoring
        AsyncFunction("stopMonitoring") {
            CheckinForegroundService.stopMonitoring(context)
            true
        }

        // Update target apps while monitoring
        AsyncFunction("updateTargetApps") { packageNames: List<String> ->
            CheckinForegroundService.updateTargetApps(context, packageNames)
            true
        }

        // Check if monitoring service is running
        // Uses static flag instead of deprecated getRunningServices()
        AsyncFunction("isMonitoringActive") {
            CheckinForegroundService.isRunning()
        }

        // ============================================
        // Intervention Settings Functions
        // ============================================

        // Set intervention timing settings
        // timing: "immediate" | "delayed"
        // delayMinutes: 5 | 10 | 15
        AsyncFunction("setInterventionSettings") { timing: String, delayMinutes: Int ->
            CheckinForegroundService.updateInterventionSettings(context, timing, delayMinutes)
            true
        }

        // Get current intervention settings
        AsyncFunction("getInterventionSettings") {
            val prefs = context.getSharedPreferences("checkin_settings", Context.MODE_PRIVATE)
            mapOf(
                "timing" to (prefs.getString("intervention_timing", "immediate") ?: "immediate"),
                "delayMinutes" to prefs.getInt("intervention_delay", 5)
            )
        }
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun hasOverlayPermission(): Boolean {
        return Settings.canDrawOverlays(context)
    }

    private fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE)
                as android.app.NotificationManager
            notificationManager.areNotificationsEnabled()
        } else {
            true // Prior to Android 13, notifications are enabled by default
        }
    }

    /**
     * Register broadcast receiver to listen for intervention events from the foreground service
     */
    private fun registerInterventionReceiver() {
        if (interventionReceiver != null) return

        interventionReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context?, intent: Intent?) {
                if (intent?.action == ACTION_INTERVENTION_EVENT) {
                    val proceeded = intent.getBooleanExtra(EXTRA_PROCEEDED, false)
                    val appPackage = intent.getStringExtra(EXTRA_APP_PACKAGE) ?: ""
                    val timestamp = intent.getLongExtra(EXTRA_TIMESTAMP, System.currentTimeMillis())

                    android.util.Log.d("ScreenTimeModule", "Intervention event received: proceeded=$proceeded, app=$appPackage")

                    // Send event to React Native
                    sendEvent("onIntervention", mapOf(
                        "proceeded" to proceeded,
                        "appPackage" to appPackage,
                        "timestamp" to timestamp
                    ))
                }
            }
        }

        val filter = IntentFilter(ACTION_INTERVENTION_EVENT)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(interventionReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            context.registerReceiver(interventionReceiver, filter)
        }

        android.util.Log.d("ScreenTimeModule", "Intervention receiver registered")
    }

    /**
     * Unregister the broadcast receiver
     * Safe to call even if receiver was never registered or already unregistered
     */
    private fun unregisterInterventionReceiver() {
        val receiver = interventionReceiver ?: return

        try {
            context.unregisterReceiver(receiver)
            android.util.Log.d("ScreenTimeModule", "Intervention receiver unregistered")
        } catch (e: IllegalArgumentException) {
            // Receiver was not registered - this is expected in some lifecycle scenarios
            android.util.Log.w("ScreenTimeModule", "Receiver was not registered, skipping unregister")
        } catch (e: Exception) {
            android.util.Log.e("ScreenTimeModule", "Error unregistering receiver: ${e.javaClass.simpleName}", e)
        } finally {
            interventionReceiver = null
        }
    }
}
