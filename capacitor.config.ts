import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familyexpense.tracker',
  appName: 'Family Expense Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

