import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.224solutions.app',
  appName: '224Solutions',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    App: {
      launchUrl: 'com.224solutions.app'
    },
    Camera: {
      permissions: {
        camera: 'L\'appareil photo est requis pour prendre des photos des produits et documents',
        photos: 'L\'accès aux photos est requis pour sélectionner des images'
      }
    },
    Geolocation: {
      permissions: {
        location: 'La localisation est requise pour le service de livraison et les cartes'
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#667eea",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#667eea"
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    },
    Haptics: {},
    Network: {},
    Device: {}
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true
  }
};

export default config;