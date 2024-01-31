"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  readData,
  tableToJson,
  wirteRequest,
} from "@/utils/spreadsheet";
import moment from "moment";
import Loading from "../loading";
import { useSelector } from "react-redux";
import {
  REQUEST_STATUS,
  SHEET_REQUEST_OFF,
  STATUS_PENDING
} from "@/constants";
import { v4 as uuidv4 } from "uuid";

const HistoryOff = () => {
  const [dataList, setDataList] = useState([]);
  const { data, update } = useSession();
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state) => state.user.userInfo);

  const getData = async () => {
    setLoading(true);
    readData(SHEET_REQUEST_OFF)
      .then((result) => {
        const jsonData = tableToJson(result?.data?.values);

        const listRequest = jsonData.filter(
          (item) => item.status == "approve" && item.email === data?.user.email
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
  }, [userInfo, data]);

  return (
    <div>
      {loading ? <Loading /> : <div className="my-16 max-md:my-10">
      <h4 className="uppercase font-semibold mt-10">History day off</h4>
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
              {dataList?.map((item) => (
                <tr key={item.id} className="py-2 h-20">
                  <td className={`leading-7 text-red-color`}>
                    <div className="flex items-center">
                      <img src={data?.user?.image ? data?.user?.image : `/user.png`} alt="avatar" className="bg-white rounded-full mr-4 shrink-0 avatar-manage" />
                      <p className="font-bold text-[1.5rem] text-loading-color">{data?.user?.name}</p>
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