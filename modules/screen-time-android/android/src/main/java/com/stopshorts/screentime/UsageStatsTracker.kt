package com.stopshorts.screentime

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.util.Log

class UsageStatsTracker(private val context: Context) {

    private val usageStatsManager: UsageStatsManager by lazy {
        context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    }

    // Display names for target apps
    companion object {
        private const val TAG = "UsageStats"

        val APP_DISPLAY_NAMES = mapOf(
            "com.zhiliaoapp.musically" to "TikTok",
            "com.ss.android.ugc.trill" to "TikTok",
            "com.google.android.youtube" to "YouTube",
            "com.instagram.android" to "Instagram"
        )

        val TARGET_PACKAGES = listOf(
            "com.zhiliaoapp.musically",  // TikTok
            "com.ss.android.ugc.trill",  // TikTok (alternative)
            "com.google.android.youtube", // YouTube
            "com.instagram.android"       // Instagram
        )

        // Debug logging helpers - only log in debug builds
        private fun logDebug(message: String) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, message)
            }
        }

        private fun logWarning(message: String) {
            if (BuildConfig.DEBUG) {
                Log.w(TAG, message)
            }
        }
    }

    /**
     * Get usage statistics for specified packages within a time range
     */
    fun getUsageStats(
        startTime: Long,
        endTime: Long,
        packageNames: List<String>
    ): List<Map<String, Any>> {
        logDebug("getUsageStats called: startTime=$startTime, endTime=$endTime")
        logDebug("Target packages: $packageNames")

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        if (stats == null) {
            logWarning("queryUsageStats returned null")
            return emptyList()
        }

        logDebug("queryUsageStats returned ${stats.size} entries")

        // Log all stats (not just target packages) for debugging
        stats.forEach { stat ->
            logDebug("  App: ${stat.packageName}, timeMs: ${stat.totalTimeInForeground}")
        }

        val targetPackages = packageNames.ifEmpty { TARGET_PACKAGES }

        val filteredStats = stats
            .filter { it.packageName in targetPackages && it.totalTimeInForeground > 0 }
            .map { stat ->
                mapOf(
                    "packageName" to stat.packageName,
                    "appName" to (APP_DISPLAY_NAMES[stat.packageName] ?: stat.packageName),
                    "totalTimeMs" to stat.totalTimeInForeground,
                    "lastUsed" to stat.lastTimeUsed
                )
            }

        logDebug("Filtered to ${filteredStats.size} target apps")
        return filteredStats
    }

    /**
     * Get the current foreground app
     * Uses multiple event types for better device compatibility
     */
    fun getCurrentForegroundApp(): String? {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 10000 // Last 10 seconds

        val events = usageStatsManager.queryEvents(startTime, endTime)
            ?: return null

        var lastForegroundPackage: String? = null
        val event = UsageEvents.Event()

        while (events.hasNextEvent()) {
            events.getNextEvent(event)

            // Check multiple event types for better device compatibility
            when (event.eventType) {
                UsageEvents.Event.MOVE_TO_FOREGROUND,
                UsageEvents.Event.ACTIVITY_RESUMED -> {
                    lastForegroundPackage = event.packageName
                }
                UsageEvents.Event.MOVE_TO_BACKGROUND,
                UsageEvents.Event.ACTIVITY_PAUSED -> {
                    if (event.packageName == lastForegroundPackage) {
                        lastForegroundPackage = null
                    }
                }
            }
        }

        return lastForegroundPackage
    }

    /**
     * Check if a specific app is currently in foreground
     */
    fun isAppInForeground(packageName: String): Boolean {
        return getCurrentForegroundApp() == packageName
    }

    /**
     * Check if any of the target apps is in foreground
     */
    fun isAnyTargetAppInForeground(): Boolean {
        val currentApp = getCurrentForegroundApp() ?: return false
        return currentApp in TARGET_PACKAGES
    }

    /**
     * Get usage statistics using queryEvents for more accurate real-time data.
     * This method calculates foreground time by tracking MOVE_TO_FOREGROUND and MOVE_TO_BACKGROUND events.
     */
    fun getUsageFromEvents(
        startTime: Long,
        endTime: Long,
        packageNames: List<String>
    ): List<Map<String, Any>> {
        logDebug("getUsageFromEvents called: startTime=$startTime, endTime=$endTime")

        val events = usageStatsManager.queryEvents(startTime, endTime)
        if (events == null) {
            logWarning("queryEvents returned null")
            return emptyList()
        }

        val targetPackages = packageNames.ifEmpty { TARGET_PACKAGES }
        val usageMap = mutableMapOf<String, Long>() // packageName -> totalTimeMs
        val foregroundStart = mutableMapOf<String, Long>() // packageName -> startTime

        val event = UsageEvents.Event()
        var eventCount = 0

        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            eventCount++
            val pkg = event.packageName

            if (pkg !in targetPackages) continue

            when (event.eventType) {
                UsageEvents.Event.MOVE_TO_FOREGROUND,
                UsageEvents.Event.ACTIVITY_RESUMED -> {
                    // App moved to foreground, record start time
                    if (!foregroundStart.containsKey(pkg)) {
                        foregroundStart[pkg] = event.timeStamp
                        logDebug("  $pkg foreground at ${event.timeStamp}")
                    }
                }
                UsageEvents.Event.MOVE_TO_BACKGROUND,
                UsageEvents.Event.ACTIVITY_PAUSED -> {
                    // App moved to background, calculate duration
                    val start = foregroundStart.remove(pkg)
                    if (start != null) {
                        val duration = event.timeStamp - start
                        usageMap[pkg] = (usageMap[pkg] ?: 0L) + duration
                        logDebug("  $pkg background at ${event.timeStamp}, duration=${duration}ms")
                    }
                }
            }
        }

        // Handle apps that are still in foreground (add time up to endTime)
        for ((pkg, start) in foregroundStart) {
            val duration = endTime - start
            usageMap[pkg] = (usageMap[pkg] ?: 0L) + duration
            logDebug("  $pkg still foreground, adding ${duration}ms")
        }

        logDebug("getUsageFromEvents processed $eventCount events, found ${usageMap.size} target apps")

        return usageMap.filter { it.value > 0 }.map { (pkg, timeMs) ->
            mapOf(
                "packageName" to pkg,
                "appName" to (APP_DISPLAY_NAMES[pkg] ?: pkg),
                "totalTimeMs" to timeMs,
                "lastUsed" to endTime
            )
        }
    }

    /**
     * Get usage stats with fallback: try queryEvents first, then queryUsageStats
     */
    fun getUsageStatsWithFallback(
        startTime: Long,
        endTime: Long,
        packageNames: List<String>
    ): List<Map<String, Any>> {
        logDebug("getUsageStatsWithFallback called")

        // Try queryEvents first (more accurate for recent usage)
        val eventsResult = getUsageFromEvents(startTime, endTime, packageNames)
        if (eventsResult.isNotEmpty()) {
            logDebug("Using queryEvents result: ${eventsResult.size} apps")
            return eventsResult
        }

        // Fallback to queryUsageStats
        logDebug("queryEvents empty, falling back to queryUsageStats")
        return getUsageStats(startTime, endTime, packageNames)
    }
}
