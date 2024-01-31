'use client';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  // Configure one or more authentication providers
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile https://www.googleapis.com/auth/spreadsheets", access_type: 'offline'} },
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, trigger, session }) => {
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      if (account?.refresh_token) {
        token.refresh_token = account.refresh_token;
      }
      if (account?.id_token) {
        token.id_token = account.id_token;
      }
      if (trigger === "update") {
        token.access_token = session.access_token;
        token.id_token = session.id_token
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.access_token;
      session.refresh_token = token.refresh_token;
      session.id_token = token.id_token
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});