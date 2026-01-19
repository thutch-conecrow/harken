/**
 * Expo config plugin for @harken/sdk-react-native
 *
 * Automatically configures iOS and Android permissions required for
 * camera, photo library, and document picker functionality.
 *
 * @example
 * // app.json or app.config.js
 * {
 *   "expo": {
 *     "plugins": [
 *       "@harken/sdk-react-native"
 *     ]
 *   }
 * }
 *
 * @example
 * // With custom permission strings
 * {
 *   "expo": {
 *     "plugins": [
 *       ["@harken/sdk-react-native", {
 *         "cameraPermission": "Take photos to include with your feedback",
 *         "photoLibraryPermission": "Select photos to include with your feedback"
 *       }]
 *     ]
 *   }
 * }
 */

const {
  withInfoPlist,
  withAndroidManifest,
} = require('@expo/config-plugins');

/**
 * Default permission strings for iOS
 */
const DEFAULT_PERMISSIONS = {
  cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera to take photos for feedback',
  photoLibraryPermission: 'Allow $(PRODUCT_NAME) to access your photos to include with feedback',
};

/**
 * Configure iOS Info.plist permissions
 */
function withIosPermissions(config, options) {
  return withInfoPlist(config, (config) => {
    // Camera permission
    // Custom option overrides existing; default only sets if missing
    if (options.cameraPermission) {
      config.modResults.NSCameraUsageDescription = options.cameraPermission;
    } else if (!config.modResults.NSCameraUsageDescription) {
      config.modResults.NSCameraUsageDescription = DEFAULT_PERMISSIONS.cameraPermission;
    }

    // Photo library permission
    // Custom option overrides existing; default only sets if missing
    if (options.photoLibraryPermission) {
      config.modResults.NSPhotoLibraryUsageDescription = options.photoLibraryPermission;
    } else if (!config.modResults.NSPhotoLibraryUsageDescription) {
      config.modResults.NSPhotoLibraryUsageDescription = DEFAULT_PERMISSIONS.photoLibraryPermission;
    }

    return config;
  });
}

/**
 * Configure Android AndroidManifest.xml permissions
 */
function withAndroidPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure uses-permission array exists
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = manifest['uses-permission'];

    /**
     * Add a permission if it doesn't already exist
     */
    function addPermission(name, attributes = {}) {
      const exists = permissions.some(
        (p) => p.$?.['android:name'] === name
      );
      if (!exists) {
        permissions.push({
          $: {
            'android:name': name,
            ...attributes,
          },
        });
      }
    }

    // Camera permission
    addPermission('android.permission.CAMERA');

    // Photo library permissions
    // READ_MEDIA_IMAGES for Android 13+ (API 33+)
    addPermission('android.permission.READ_MEDIA_IMAGES');

    // READ_EXTERNAL_STORAGE for Android 12 and below
    // Use maxSdkVersion to limit to older APIs
    addPermission('android.permission.READ_EXTERNAL_STORAGE', {
      'android:maxSdkVersion': '32',
    });

    return config;
  });
}

/**
 * Main plugin function
 *
 * @param {import('@expo/config-plugins').ExpoConfig} config - Expo config
 * @param {Object} options - Plugin options
 * @param {string} [options.cameraPermission] - Custom iOS camera permission string
 * @param {string} [options.photoLibraryPermission] - Custom iOS photo library permission string
 */
function withHarkenPermissions(config, options = {}) {
  // Apply iOS permissions
  config = withIosPermissions(config, options);

  // Apply Android permissions
  config = withAndroidPermissions(config);

  return config;
}

module.exports = withHarkenPermissions;
