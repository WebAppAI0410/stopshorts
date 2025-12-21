/**
 * App Icons for default target apps
 *
 * These are bundled static assets for consistent display across iOS and Android.
 * Icons are 128x128 PNG files with transparent backgrounds.
 */

import { ImageSourcePropType } from 'react-native';
import type { TargetAppId } from '../types';

// App icon assets - require() for static bundling
const APP_ICONS: Partial<Record<TargetAppId, ImageSourcePropType>> = {
    tiktok: require('../../assets/images/app-icons/tiktok.png'),
    youtubeShorts: require('../../assets/images/app-icons/youtube.png'),
    instagramReels: require('../../assets/images/app-icons/instagram.png'),
    twitter: require('../../assets/images/app-icons/twitter.png'),
    facebookReels: require('../../assets/images/app-icons/facebook.png'),
    snapchat: require('../../assets/images/app-icons/snapchat.png'),
};

/**
 * Get app icon for a target app
 * @param appId - The target app ID
 * @returns ImageSourcePropType or undefined if not found
 */
export function getAppIcon(appId: TargetAppId): ImageSourcePropType | undefined {
    return APP_ICONS[appId];
}

/**
 * Check if an app has a bundled icon
 * @param appId - The target app ID
 * @returns boolean
 */
export function hasAppIcon(appId: TargetAppId): boolean {
    return appId in APP_ICONS;
}

export default APP_ICONS;
