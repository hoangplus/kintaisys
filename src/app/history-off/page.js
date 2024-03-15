"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  readData,
  tableToJson,
  wirteRequest
} from "@/utils/spreadsheet";
import { mergeArraysByEmail } from "@/utils/convertArray"
import moment from "moment";
import Loading from "../loading";
import { useSelector, useDispatch } from "react-redux";
import {
  REQUEST_STATUS,
  SHEET_REQUEST_OFF,
  STATUS_PENDING,
  SHEET_MEMBER
} from "@/constants";
import { v4 as uuidv4 } from "uuid";
import { setListUserInfo } from '../GlobalRedux/reducers/listuser.reducer';

const HistoryOff = () => {
  const [dataList, setDataList] = useState([]);
  const { data, update } = useSession();
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state) => state.user.userInfo);
  const listUserInfo = useSelector((state) => state.listUser.listUserInfo);
  const [textValue, setTextValue] = useState('');
  const [filteredName, setFilteredName] = useState('');
  const dispatch = useDispatch();
  
  // Tạo một đối tượng Map để ánh xạ email và name từ bảng members
  const emailToNameMap = new Map(listUserInfo.map(item => [item.email, item.name]));
  // Tích hợp trường name vào dataList
  const mergedArray = dataList.map(item => ({
    ...item,
    name: emailToNameMap.get(item.email),
  }));

  const nameOptions = [...new Set(mergedArray?.map((item) => item.name))];
  const filteredData = filteredName ? mergedArray.filter((item) => item.name === filteredName) : mergedArray;
  const resultDayOff = mergeArraysByEmail(filteredData, listUserInfo);

  const getData = async () => {
    setLoading(true);
    readData(SHEET_REQUEST_OFF)
      .then((result) => {
        const jsonData = tableToJson(result?.data?.values);
        const listRequest = jsonData.filter(
          (item) => item.status == "approve"
        );
        setDataList(listRequest);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (userInfo) {
      getData();
    }
  }, [userInfo]);

  return (
    <div>
      {loading ? <Loading /> : <div className="my-16 max-md:my-10">
        <h4 className="uppercase font-semibold mt-10">History day off</h4>
        <div className="flex justify-between items-center">
          <select
            id="nameFilter"
            onChange={(e) => setFilteredName(e.target.value)}
            className="text-holiday-color border border-holiday-color font-medium py-[0.5rem] px-[1rem] my-5 my-5"
          >
            <option value="" hidden> Search by username</option>
            <option value="">All</option>
            {nameOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="flex my-10">
            <div className="flex items-end ml-8">
              <div className="w-[4.5rem] h-[4.2rem] background-paid border-2 border-border-color max-md:w-[2.8rem] max-md:h-[2.6rem]"></div>
              <p className="ml-3 font-[1.8rem] font-semibold text-primary-color">
                Paid Leave
              </p>
            </div>
            <div className="flex items-end ml-8">
              <div className="w-[4.5rem] h-[4.2rem] background-unpaid border-2 border-border-color max-md:w-[2.8rem] max-md:h-[2.6rem]"></div>
              <p className="ml-3 font-[1.8rem] font-semibold text-primary-color">
                Unpaid Leave
              </p>
            </div>
          </div>
          {resultDayOff?.length === 1 && <p className="border-b-4 border-orange-color py-2 font-semibold max-md:text-[1.2rem] max-md:w-[12rem] h-[2.5rem]">
            Number of days off: {resultDayOff[0]?.dayoff}
          </p>}
        </div>
        <div className="table-container-manager">
          <table className="table-fixed w-full text-center rounded-t-xl mt-5">
            <thead className="text-primary-color text-[1.8rem] font-semibold max-md:text-[1.3rem]">
              <tr>
                <th className="h-[5.6rem] sticky top-0 bg-second-color max-md:h-[5rem] w-[25rem]">Member</th>
                <th className="sticky top-0 bg-second-color w-[30rem]">Date</th>
                <th className="sticky top-0 bg-second-color">Reason</th>
                <th className="sticky top-0 bg-second-color">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-second-color text-[1.6rem] text-primary-color font-medium max-md:text-[1.3rem] overflow-y-auto">
              {filteredData?.map((item) => (
                <tr key={item.id} className={`py-2 h-20 ${!item?.is_paid_leave ? 'background-unpaid' : ''}`}>
                  <td className={`leading-7 text-red-color`}>
                    <div className="flex items-center">
                      <img src={item?.image ? item?.image : `/user.png`} alt="avatar" className="bg-white rounded-full mr-4 shrink-0 avatar-manage" />
                      <p className="font-bold text-[1.5rem] text-loading-color">{item?.name}</p>
                    </div>
                  </td>
                  <td className={`leading-7 text-red-color`}>{item?.type === '0' ? 'Morning' : item?.type === '1' ? 'Afternoon' : 'All day'}&nbsp;{item?.date}</td>
                  <td className={`leading-7`}>{item?.reason}</td>
                  <td className={`leading-7`}>{item?.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
};

export default HistoryOff;