import "dotenv/config";

export default {
  expo: {
    name: "MovingCash_Front",
    slug: "MovingCash_Front",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: { supportsTablet: true },
    android: {
      package: "com.cleame.movingcash",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: { favicon: "./assets/favicon.png" },
    extra: {
      eas: {
        projectId: "a70e0b08-118f-4329-9bcc-c8b9bb6aad28",
      },
      apiUrl: process.env.API_URL,          // 👈 환경변수로 API URL
      googleMapsKey: process.env.GOOGLE_MAPS_KEY,
      tmapKey: process.env.TMAP_KEY,
      wsUrl: process.env.WS_URL,
    },
  },
};
