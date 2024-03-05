/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_CLIENT_ID:
      '96305492305-bout7jov9hgpl0uc9itmv8b7t86sc4ua.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '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',
    NEXTAUTH_URL: 'http://localhost:3000/',
    NEXTAUTH_URL_INTERNAL: 'http://localhost:3000/',
    NEXTAUTH_SECRET: 'c36cefe4d56653b1c615f4e0fbe580e3',
    NEXT_PUBLIC_API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
    SHEET_ID: '1QMqKfjVt4U_so4LyltUQaXbyOwupQuppIqkZ7hYH2yM',
    API_KEY: 'AIzaSyCKVNGMGP904d8nCyPKPDvVfK-DekXlAhc',
  },
};

module.exports = nextConfig;
