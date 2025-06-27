import 'dotenv/config';

export default {
  expo: {
    name: "Snap2Cash",
    slug: "snap2cash-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#3b82f6"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ndresells.snap2cash",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to camera to scan items for analysis.",
        NSPhotoLibraryUsageDescription: "This app needs access to photo library to select images for analysis."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#3b82f6"
      },
      package: "com.ndresells.snap2cash",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you select images for analysis."
        }
      ]
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      searchApiKey: process.env.EXPO_PUBLIC_SEARCH_API_KEY,
      serpApiKey: process.env.EXPO_PUBLIC_SERP_API_KEY,
      superMemoryApiKey: process.env.EXPO_PUBLIC_SUPER_MEMORY_API_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
};