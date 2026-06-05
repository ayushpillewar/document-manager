import * as TrackingTransparency from 'expo-tracking-transparency';

/**
 * TrackingService – Requests App Tracking Transparency (ATT) permission
 *
 * In iOS 14.5+, apps must explicitly request permission to track users
 * across other apps and websites. This service handles that permission flow.
 *
 * Note: The permission can only be requested once. If the user denies it,
 * they must manually enable it in Settings > Privacy > Tracking.
 */
export class TrackingService {
  /**
   * Requests the user's App Tracking Transparency permission.
   * @returns true if permission was granted, false if denied or if tracking is disabled
   */
  static async requestPermission(): Promise<boolean> {
    try {
      console.log('Requesting App Tracking Transparency permission...');
      const permission = await TrackingTransparency.requestTrackingPermissionsAsync();
      const granted = permission.granted;
      console.log('App Tracking Transparency permission result:', permission.status);
      return granted;
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      return false;
    }
  }

  /**
   * Gets the current App Tracking Transparency permission status.
   * @returns The current status ('granted', 'denied', 'undetermined', etc.)
   */
  static async getPermissionStatus(): Promise<TrackingTransparency.PermissionStatus> {
    try {
      const status = await TrackingTransparency.getTrackingPermissionsAsync();
      console.log('App Tracking Transparency status:', status.status);
      return status.status;
    } catch (error) {
      console.error('Error checking tracking permission status:', error);
      return 'undetermined';
    }
  }
}
