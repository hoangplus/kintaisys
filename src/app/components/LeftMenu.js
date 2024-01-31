// components/LeftMenu.js
import React, { useState, useEffect } from "react";
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import {
  readData,
  tableToJson
} from '@/utils/spreadsheet';

const LeftMenu = () => {
  const { data, update } = useSession();
  const router = useRouter();
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (data && !userInfo) {
      readData('members')
        .then((result) => {
          const jsonData = tableToJson(result?.data?.values);

          const verifyEmail = jsonData.filter((member) => {
            if (member.email === data?.user.email) {
              setUserInfo(member);
              return true;
            }
          });

          if (verifyEmail.length === 0) {
            alert('Wrong email');
            signOut();
          }
        })
        .catch((error) => {
          console.error('Đã xảy ra lỗi:', error);
        });
    }
  }, [data]);

  return (
    <div className="w-96 px-6 py-10 h-screen bg-primary-color text-white max-md:h-full max-md:py-8">
      <div className="flex items-center cursor-pointer">
        <div className="bg-white rounded-md mr-4 shrink-0 sidebar-avatar">
          <img src={data?.user.image} />
        </div>
        <div className="flex items-center w-full justify-between">
          <div className="flex flex-col">
            <h3 className="font-bold mb-3">{data?.user.name}</h3>
          </div>
          <i className="fa-solid fa-chevron-right"></i>
        </div>
      </div>
      <div 
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/' ? 'div-menu-active-home' : 'div-menu-home'}`}
        onClick={() => router.push('/')}
      >
        <i className="fa-solid fa-house-chimney"></i>
        <button className="font-semibold ml-3">
          Home
        </button>
      </div>
      <div
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/request-off' ? 'div-menu-active' : 'div-menu'}`}
        onClick={() => router.push('/request-off')}
      >
        <img src="/calendar-menu.svg" alt="My Image" width="20" height="20"  />
        <button className="font-semibold ml-2">
          Request time off
        </button>
      </div>
      {userInfo?.role === "admin" &&
      <div
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/manage-request' ? 'div-menu-active' : 'div-menu'}`}
        onClick={() => router.push('/manage-request')}
      >
        <img src="/folder.svg" alt="My Image" width="20" height="20"  />
        <button className="font-semibold ml-2">
          Manage leave requests
        </button>
      </div>}
      {userInfo?.role === "admin" ?
      <div
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/history-off' ? 'div-menu-active' : 'div-menu'}`}
        onClick={() => router.push('/history-off')}
      >
        <img src="/history-menu.svg" alt="My Image" width="20" height="20"  />
        <button className="font-semibold ml-2">
          History day off
        </button>
      </div> :
      <div
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/history-off-member' ? 'div-menu-active' : 'div-menu'}`}
        onClick={() => router.push('/history-off-member')}
      >
        <img src="/history-menu.svg" alt="My Image" width="20" height="20"  />
        <button className="font-semibold ml-2">
          History day off
        </button>
      </div>
      }
      {userInfo?.role === "admin" &&
      <div
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/history-checkin' ? 'div-menu-active' : 'div-menu'}`}
        onClick={() => router.push('/history-checkin')}
      >
        <img src="/history-menu.svg" alt="My Image" width="20" height="20"  />
        <button className="font-semibold ml-2">
          History Check-in
        </button>
      </div>}
      <div
        className={`flex items-center cursor-pointer mt-10 ${pathname === '/logout' ? 'div-menu-active' : 'div-menu'}`}
        onClick={signOut}
      >
        <i className="fa-solid fa-arrow-right-from-bracket"></i>
        <button className="ml-4 font-semibold">
          Logout
        </button>
      </div>
    </div>
  );
};

export default LeftMenu;
