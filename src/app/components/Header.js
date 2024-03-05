// components/Header.js
import React, { useEffect, useState } from "react";
import { signOut, useSession } from 'next-auth/react';
import {
  readData,
  tableToJson,
  writeDataToMultipleSheets,
  updateData
} from '@/utils/spreadsheet';
import NotificationPopover from './NotificationPopover';
import { useRouter, usePathname } from 'next/navigation';
import {
  SHEET_REQUEST_OFF,
  SHEET_MEMBER
} from "@/constants";
import { useSelector } from "react-redux";

const Header = () => {
  const pathname = usePathname()
  const { data, update } = useSession();
  const router = useRouter();
  const [dataListInitial, setDataListInitial] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [dataListMember, setDataListMember] = useState([]);
  const listUserInfo = useSelector((state) => state.listUser.listUserInfo);
  const userInformation = useSelector((state) => state.user.userInfo);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPopoverOpenMember, setIsPopoverOpenMember] = useState(false);

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);
  const togglePopoverMember = () => setIsPopoverOpenMember(!isPopoverOpenMember);

  const clickNotify = () => {
    router.push('/manage-request')
    setIsPopoverOpen(false)

    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      const requestDetail = dataList.find(request => request.id === row[0]);
      if(requestDetail?.id) {
        row[7] = false;
      }
    }

    const dataRange = [
      {
        range: SHEET_REQUEST_OFF,
        values: originalLst,
      },
    ];

    const callbacks = {
      onSuccess: (newToken) => {
        writeDataToMultipleSheets(newToken ? newToken : data.accessToken, dataRange)
          .then((response) => {
            console.log("Approve request success");
            getData();
          })
          .catch((error) => {
            console.log("Approve request fail");
          });
      },
      onFail: () => {
        signOut();
      }
    }
    updateData(callbacks, data, update)
  }

  const clickCloseNotify = () => {
    setIsPopoverOpen(false)

    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      const requestDetail = dataList.find(request => request.id === row[0]);
      if(requestDetail?.id) {
        row[7] = false;
      }
    }

    const dataRange = [
      {
        range: SHEET_REQUEST_OFF,
        values: originalLst,
      },
    ];

    const callbacks = {
      onSuccess: (newToken) => {
        writeDataToMultipleSheets(newToken ? newToken : data.accessToken, dataRange)
          .then((response) => {
            console.log("Approve request success");
            getData();
          })
          .catch((error) => {
            console.log("Approve request fail");
          });
      },
      onFail: () => {
        signOut();
      }
    }
    updateData(callbacks, data, update)
  }

  const clickNotifyMember = () => {
    router.push('/request-off')
    setIsPopoverOpenMember(false)

    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      const requestDetail = dataListMember.find(request => request.id === row[0]);
      if(requestDetail?.id) {
        row[6] = false;
      }
    }

    const dataRange = [
      {
        range: SHEET_REQUEST_OFF,
        values: originalLst,
      },
    ];

    const callbacks = {
      onSuccess: (newToken) => {
        writeDataToMultipleSheets(newToken ? newToken : data.accessToken, dataRange)
          .then((response) => {
            console.log("Approve request success");
            getData();
          })
          .catch((error) => {
            console.log("Approve request fail");
          });
      },
      onFail: () => {
        signOut();
      }
    }
    updateData(callbacks, data, update)
  }

  const clickCloseNotifyMember = () => {
    setIsPopoverOpenMember(false)

    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      const requestDetail = dataListMember.find(request => request.id === row[0]);
      if(requestDetail?.id) {
        row[6] = false;
      }
    }

    const dataRange = [
      {
        range: SHEET_REQUEST_OFF,
        values: originalLst,
      },
    ];

    const callbacks = {
      onSuccess: (newToken) => {
        writeDataToMultipleSheets(newToken ? newToken : data.accessToken, dataRange)
          .then((response) => {
            console.log("Approve request success");
            getData();
          })
          .catch((error) => {
            console.log("Approve request fail");
          });
      },
      onFail: () => {
        signOut();
      }
    }
    updateData(callbacks, data, update)
  }

  const popoverContent =
  <div className={`wrap-notify ${dataList?.length == 0 && `h-80`}`}>
    <div className="wrap-header-notify">
      <p>Notifications</p>
      <p onClick={() => clickCloseNotify()} className="cursor-pointer">x</p>
    </div>
    {dataList?.map((item, index) => (
      <div key={item.id} className="wrap-notify-box px-4">
        <div className="notify-box flex p-3 leading-7" onClick={() => clickNotify()}>
          <p className="text-orange-color">{item?.name}<span className="text-primary-color"> has created dayoff request on {item?.date}</span></p>
        </div>
      </div>
    ))}
  </div>;

  const popoverContentMember =
  <div className={`wrap-notify ${dataListMember?.length == 0 && `h-80`}`}>
    <div className="wrap-header-notify">
      <p>Notifications</p>
      <p onClick={() => clickCloseNotifyMember()} className="cursor-pointer">x</p>
    </div>
    {dataListMember?.map((item, index) => (
      <div key={item.id} className="px-4">
        <div className="notify-box p-3 leading-7" onClick={() => clickNotifyMember()}>
          <p className="">Your dayoff request on {item?.date} has been {item?.status == 'reject' ? 'rejected' : 'approved'} </p>
        </div>
      </div>
    ))}
  </div>;

  useEffect(() => {
    if ((data && !userInfo)|| data) {
      readData(SHEET_MEMBER)
        .then((result) => {
          const jsonData = tableToJson(result?.data?.values);

          const verifyEmail = jsonData.filter((member) => {
            if (member.email === data?.user.email) {
              localStorage.setItem('user info', JSON.stringify(member));
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

  useEffect(() => {
    if (userInformation) {
      readData(SHEET_REQUEST_OFF)
      .then((result) => {
        const jsonData = tableToJson(result?.data?.values);
        setDataListInitial(result?.data?.values)
        const listRequest = jsonData.filter(
          (item) => item.is_read
        );
        for (const item of listRequest) {
          const userFind = listUserInfo?.find(user => user.email === item.email) || { name: '' };
          item.name = userFind.name;
        }
        setDataList(listRequest);

        //for member
        const listRequestMember = jsonData.filter(
          (item) => item.is_read_admin && item.email === data?.user.email
        );
        for (const item of listRequestMember) {
          const userFind = listUserInfo?.find(user => user.email === item.email) || { name: '' };
          item.name = userFind.name;
        }
        setDataListMember(listRequestMember);
      })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
      });
    }
  }, [userInfo]);

  return (
    <div className={`${(pathname !== '/manage-request' && pathname !== '/history-off'
    && pathname !== '/history-checkin' && pathname !== '/chart-dayoff') ? `justify-between` : `justify-end`}
      flex ml-12 max-md:ml-0`}>
      {(pathname !== '/manage-request' && pathname !== '/history-off'
      && pathname !== '/history-checkin' && pathname !== '/chart-dayoff') && 
      <div className="flex">
        <p className="mr-4 border-b-4 border-green-color py-2 font-semibold max-md:text-[1.2rem] max-md:w-[8.3rem]">
          Days Off: {userInfo?.dayoff === '0' || userInfo?.dayoff === '0,5' ?
          `${parseFloat(userInfo?.dayoff.replace(',', '.'))}d` : `${parseFloat(userInfo?.dayoff.replace(',', '.'))}ds`}
        </p>
        <p className="mr-4 border-b-4 border-orange-color py-2 font-semibold max-md:text-[1.2rem] max-md:w-[12rem]">
          Remaining days off: {12 - userInfo?.dayoff === 0 || 12 - userInfo?.dayoff === 0.5 ?
          `${12 - parseFloat(userInfo?.dayoff.replace(',', '.'))}d` : `${12 - parseFloat(userInfo?.dayoff.replace(',', '.'))}ds`}
        </p>
        <p className="border-b-4 border-gray-color py-2 font-semibold max-md:text-[1.2rem] max-md:w-[12rem]">
          Days Off Unpaid Leave: {userInfo?.dayoff_unpaid_leave === '0' || userInfo?.dayoff_unpaid_leave === '0,5' ?
          `${parseFloat(userInfo?.dayoff_unpaid_leave?.replace(',', '.'))}d` : `${parseFloat(userInfo?.dayoff_unpaid_leave?.replace(',', '.'))}ds`}
        </p>
      </div>}
      {userInfo?.role === "admin" ?
      <div className="align-end relative">
        {dataList?.length == 0 ? <img
          src='/icon-notification.svg'
          alt="avatar"
          className="mr-4 shrink-0 bell-notify cursor-pointer"
          onClick={togglePopover}
        /> :
        <div>
          <img
            src='/icon-notification-number.svg'
            alt="avatar"
            className="mr-4 shrink-0 bell-notify cursor-pointer"
            onClick={togglePopover}
          />
          <p className="text-red-color font-semibold number-notify">{dataList?.length}</p>
        </div>}
        <NotificationPopover
          isOpen={isPopoverOpen}
          onOuterAction={() => clickCloseNotify()}
          content={popoverContent}
        />
      </div> :
      <div className="align-end relative">
        {dataListMember?.length == 0 ?
        <img
          src='/icon-notification.svg'
          alt="avatar"
          className="mr-4 shrink-0 bell-notify cursor-pointer"
          onClick={togglePopoverMember}
        /> :
        <div>
          <img
            src='/icon-notification-number.svg'
            alt="avatar"
            className="mr-4 shrink-0 bell-notify cursor-pointer"
            onClick={togglePopoverMember}
          />
          <p className="text-red-color font-semibold number-notify">{dataListMember?.length}</p>
        </div>}
        <NotificationPopover
          isOpen={isPopoverOpenMember}
          onOuterAction={() => clickCloseNotifyMember()}
          content={popoverContentMember}
        />
      </div>}
    </div>
  );
};

export default Header;
