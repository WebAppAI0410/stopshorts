package com.stopshorts.screentime

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import java.io.ByteArrayOutputStream

/**
 * Helper class for retrieving installed apps information.
 * Used to allow users to select custom apps for monitoring.
 *
 * Note: iOS implementation pending - requires Family Controls Entitlement approval from Apple.
 */
class InstalledAppsHelper(private val context: Context) {

    private val packageManager: PackageManager = context.packageManager

    /**
     * Get list of launcher apps (apps that appear in the app drawer).
     * Excludes system apps to show only user-installed apps.
     *
     * @return List of app information maps containing packageName, appName, isSystemApp, and category
     */
    fun getInstalledLauncherApps(): List<Map<String, Any?>> {
        val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfoList: List<ResolveInfo> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.queryIntentActivities(
                mainIntent,
                PackageManager.ResolveInfoFlags.of(0)
            )
        } else {
            @Suppress("DEPRECATION")
            packageManager.queryIntentActivities(mainIntent, 0)
        }

        return resolveInfoList
            .asSequence()
            .filter { resolveInfo ->
                // Exclude system apps
                !isSystemApp(resolveInfo.activityInfo.applicationInfo)
            }
            .distinctBy { it.activityInfo.packageName }
            .map { resolveInfo ->
                val appInfo = resolveInfo.activityInfo.applicationInfo
                mapOf(
                    "packageName" to appInfo.packageName,
                    "appName" to packageManager.getApplicationLabel(appInfo).toString(),
                    "isSystemApp" to isSystemApp(appInfo),
                    "category" to getCategoryName(appInfo)
                )
            }
            .sortedBy { (it["appName"] as String).lowercase() }
            .toList()
    }

    /**
     * Get app icon as Base64 encoded string.
     * This is optional and can be used for displaying app icons in the UI.
     *
     * @param packageName The package name of the app
     * @return Base64 encoded PNG image string, or null if not found
     */
    fun getAppIcon(packageName: String): String? {
        return try {
            val drawable = packageManager.getApplicationIcon(packageName)
            drawableToBase64(drawable)
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    /**
     * Get app name for a given package name.
     *
     * @param packageName The package name of the app
     * @return The app name, or the package name if not found
     */
    fun getAppName(packageName: String): String {
        return try {
            val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getApplicationInfo(
                    packageName,
                    PackageManager.ApplicationInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getApplicationInfo(packageName, 0)
            }
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            packageName
        }
    }

    /**
     * Check if an app is installed.
     *
     * @param packageName The package name to check
     * @return true if installed, false otherwise
     */
    fun isAppInstalled(packageName: String): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getApplicationInfo(
                    packageName,
                    PackageManager.ApplicationInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getApplicationInfo(packageName, 0)
            }
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    private fun isSystemApp(appInfo: ApplicationInfo): Boolean {
        return (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
    }

    private fun getCategoryName(appInfo: ApplicationInfo): String {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            when (appInfo.category) {
                ApplicationInfo.CATEGORY_SOCIAL -> "SOCIAL"
                ApplicationInfo.CATEGORY_VIDEO -> "VIDEO"
                ApplicationInfo.CATEGORY_GAME -> "GAME"
                ApplicationInfo.CATEGORY_IMAGE -> "IMAGE"
                ApplicationInfo.CATEGORY_AUDIO -> "AUDIO"
                ApplicationInfo.CATEGORY_NEWS -> "NEWS"
                ApplicationInfo.CATEGORY_PRODUCTIVITY -> "PRODUCTIVITY"
                else -> "OTHER"
            }
        } else {
            "OTHER"
        }
    }

    private fun drawableToBase64(drawable: Drawable): String {
        val bitmap = if (drawable is BitmapDrawable && drawable.bitmap != null) {
            drawable.bitmap
        } else {
            val width = drawable.intrinsicWidth.coerceAtLeast(1)
            val height = drawable.intrinsicHeight.coerceAtLeast(1)
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            bitmap
        }

        val stream = ByteArrayOutputStream()
        // Compress to reduce size - 80% quality is usually sufficient
        bitmap.compress(Bitmap.CompressFormat.PNG, 80, stream)
        val byteArray = stream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }
}
