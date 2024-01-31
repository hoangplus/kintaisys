'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <div className="flex items-center justify-center">
      <div className="mt-[16rem] text-center">
        <img src="/logo_knen.png" alt="Example" />
        <div className="mt-6">
          <p className="font-semibold text-primary-color text-[1.8rem]">
            Welcome to CCK Timekeeper!
          </p>
          <button
            className="mt-14 bg-primary-color w-[28rem] max-md:w-[25rem] py-8 text-white font-semibold max-md:text-[1.8rem] rounded-xl"
            onClick={() =>
              signIn('google', { callbackUrl: process.env.NEXTAUTH_URL })
            }
          >
            <i className="fa-brands fa-google mr-4"></i>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}
