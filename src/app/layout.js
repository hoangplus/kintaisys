'use client';
import { Inter } from 'next/font/google';
import { SessionProvider } from "next-auth/react"
import { Providers } from './GlobalRedux/povider';
import LeftMenu from './components/LeftMenu';
import Header from './components/Header';
import { useRouter, usePathname } from 'next/navigation';

import './reset.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Create Next App',
//   description: 'Generated by create next app',
// };

export default function RootLayout({ children, session }) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
          type="module"
        ></script>
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          {pathname !== '/login' ? 
            <div className="flex max-md:flex-col">
              <LeftMenu />
              <div className="flex-1 px-6 py-10 h-screen w-content-full">
                {(pathname !== '/manage-request' && pathname !== '/history-off' && pathname !== '/history-checkin') && <Header />}
                <Providers>{children}</Providers>
              </div>
            </div>
          :<Providers>{children}</Providers>}
        </SessionProvider>
      </body>
    </html>
  );
}
