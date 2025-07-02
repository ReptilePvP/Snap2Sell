# Snapalyze Mobile

A React Native mobile application for analyzing and estimating the resale value of items using AI-powered image analysis.

## Features

- **Camera Integration**: Take photos or select from gallery
- **AI Analysis**: Powered by Gemini AI for accurate item valuation
- **Backend Integration**: Seamlessly connects to your existing Snapalyze backend
- **History Tracking**: Keep track of all your analyzed items
- **Favorites**: Save important analyses for quick access
- **Dark/Light Theme**: Automatic theme switching support
- **Cross-Platform**: Works on both iOS and Android

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)
- Your Snapalyze backend running (see backend setup in main README)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your configuration:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8080
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the development server:
   ```bash
   npm start
   ```

6. Run on your preferred platform:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## Backend Integration

The mobile app is designed to work with your existing Snapalyze backend:

### Required Backend Endpoints

Make sure your backend has these endpoints running:

- `POST /api/upload-image` - For uploading images to Google Cloud Storage
- `POST /api/analyze-serpapi` - For SerpAPI analysis (optional)

### Network Configuration

For development, the app will connect to `http://localhost:8080` by default. Make sure your backend is running on this port, or update the `EXPO_PUBLIC_API_URL` in your `.env` file.

For production, update the `apiUrl` in `app.json` under `expo.extra.apiUrl`.

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ImageUpload.tsx  # Image upload component
│   │   └── ResultCard.tsx   # Analysis result display
│   ├── contexts/           # React contexts (Theme, Auth, Toast)
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── CameraScreen.tsx # Main camera/analysis screen
│   │   ├── HistoryScreen.tsx
│   │   └── ...
│   ├── services/           # API services
│   │   ├── apiService.ts   # Backend API calls
│   │   └── geminiService.ts # Gemini AI integration
│   ├── types/              # TypeScript type definitions
│   └── constants/          # App constants
├── assets/                 # Images, fonts, etc.
├── App.tsx                 # Main app component
└── app.json               # Expo configuration
```

## Key Features

### Image Analysis Flow

1. **Image Capture/Selection**: Users can take photos with the camera or select from their photo library
2. **Backend Upload**: Images are uploaded to your backend, which stores them in Google Cloud Storage
3. **AI Analysis**: The app uses Gemini AI to analyze the uploaded image
4. **Results Display**: Analysis results are displayed in a user-friendly format

### Integration with Web App

The mobile app shares the same backend and analysis capabilities as your web application:

- Same image upload and storage system
- Same AI analysis engines (Gemini, SerpAPI)
- Consistent data models and API responses
- Shared user authentication system

## Configuration

### Camera Permissions

The app requires camera and photo library permissions. These are configured in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app needs access to camera to scan items for analysis.",
      "NSPhotoLibraryUsageDescription": "This app needs access to photo library to select images for analysis."
    }
  },
  "android": {
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE"
    ]
  }
}
```

### Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## Building for Production

### Android

1. Configure EAS Build:
   ```bash
   npm install -g @expo/cli
   eas build:configure
   ```

2. Build APK:
   ```bash
   eas build --platform android
   ```

### iOS

1. Build for iOS:
   ```bash
   eas build --platform ios
   ```

2. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**: Make sure your backend is running and accessible from your mobile device/emulator
2. **Camera Permissions**: Ensure camera permissions are granted in device settings
3. **API Key Issues**: Verify your Gemini API key is correctly set in the environment variables

### Development Tips

- Use the Expo Go app for quick testing during development
- Test on both iOS and Android devices/simulators
- Monitor network requests in the Expo dev tools
- Check the backend logs for API call issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is part of the Snapalyze application suite.