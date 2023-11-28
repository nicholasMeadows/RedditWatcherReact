import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nicholas.redditWatcher',
  appName: 'reddit-watcher',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
