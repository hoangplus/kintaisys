/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_CLIENT_ID:
      '22802419363-t0mgf4n0g9bl9todul47s62jo27hphe2.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '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',
    NEXTAUTH_URL: 'https://kintaisys.vercel.app/',
    NEXTAUTH_URL_INTERNAL: 'https://kintaisys.vercel.app/',
    NEXTAUTH_SECRET: 'c36cefe4d56653b1c615f4e0fbe580e3',
    NEXT_PUBLIC_API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
    SHEET_ID: '1QMqKfjVt4U_so4LyltUQaXbyOwupQuppIqkZ7hYH2yM',
    API_KEY: 'AIzaSyAdvaYE_9MFrHkkP_tu5GdYVzVdO2No0ic',
  },
};

module.exports = nextConfig;