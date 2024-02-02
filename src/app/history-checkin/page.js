"use client";

import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { readData, tableToJson, wirteRequest } from "@/utils/spreadsheet";
import moment from "moment";
import Loading from "../loading";
import { useSelector, useDispatch } from "react-redux";
import { REQUEST_STATUS, SHEET_REQUEST_OFF, STATUS_PENDING } from "@/constants";
import { v4 as uuidv4 } from "uuid";
import { setListUserInfo } from "../GlobalRedux/reducers/listuser.reducer";

const HistoryCheckin = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextMonthDate =
    currentDate.getDate() >= 26
      ? moment(currentDate).add(1, "months")
      : moment(currentDate);
  const currentMonth = nextMonthDate.month() + 1;
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state) => state.user.userInfo);
  const listUserInfo = useSelector((state) => state.listUser.listUserInfo);
  const dispatch = useDispatch();
  const [selectMonth, setSelectMonth] = useState(currentMonth);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    getData(selectMonth);
  }, [selectMonth]);

  useEffect(() => {
    const months = Array.from({ length: currentMonth }, (_, index) => {
      const startDate = new Date(currentYear, currentMonth - 3 + index, 26); // 26th of the previous month
      const endDate = new Date(currentYear, currentMonth - 2 + index, 25); // 25th of the next month

      if (currentMonth === 1) {
        startDate.setFullYear(currentYear - 1);
      }

      return (
        <option key={index + 1} value={index + 1}>
          {`${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getDate()} ${startDate.getFullYear()} - ${endDate.toLocaleString('en-US', { month: 'short' })} ${endDate.getDate()} ${endDate.getFullYear()}`}
        </option>
      );
    });

    setOptions(months);
  }, []);

  const handleChangeSelect = (event) => {
    setSelectMonth(event.target.value);
  };

  const getData = async (month) => {
    setLoading(true);
    readData(month)
      .then((result) => {
        const values = result?.data?.values;

        const checkinDataList = [];
        let listDate = values[5].slice(2);
        listUserInfo.forEach((user) => {
          let obj = {
            name: user.name,
            dataCheckIn: [],
            dataCheckOut: [],
            dataTotal: [],
          };
          for (let index = 0; index < values.length; index++) {
            const row = values[index];
            if (row[1] == user.name) {
              if (obj.dataTotal.length == 0) {
                obj.dataTotal = values[index].slice(2);
              } else {
                obj.dataCheckIn = values[index].slice(2);
                obj.dataCheckOut = values[index + 1].slice(2);
                checkinDataList.push(obj);
              }
            }
            if (checkinDataList.length == listUserInfo.length) break;
          }
        });
        mapingList(checkinDataList, listDate);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
        setLoading(false);
      });
  };

  const mapingList = (arrays, listDate) => {
    if (arrays && arrays.length > 0) {
      let day = 0;
      let month = selectMonth == 1 ? 12 : selectMonth - 1;
      let monthString = (month < 10 ? "0" : "") + Math.abs(month);
      let year =
        (selectMonth == 1 && currentDate.getMonth() == 11 && currentDate.getDate() <= 26 || selectMonth != 1)
          ? currentDate.getFullYear()
          : currentDate.getFullYear() - 1;
      const startDay = moment(`${year}-${monthString}-${listDate[0]}`);
      const renderList = [];
      for (let index = 0; index < listDate.length; index++) {
        if (parseInt(listDate[index])) {
          let objRender = {
            date: moment(startDay).add(day, "days").format("YYYY-MM-DD"),
            checkInHistory: [],
            key: uuidv4(),
          };
          arrays.forEach((item) => {
            let checkInObj = {
              checkin: moment(item.dataCheckIn[index], "HH:mm:ss").format("HH:mm") == 'Invalid date'
                ? item.dataCheckIn[index] : moment(item.dataCheckIn[index], "HH:mm:ss").format("HH:mm"),
              checkout: moment(item.dataCheckOut[index], "HH:mm:ss").format("HH:mm") == 'Invalid date'
                ? item.dataCheckOut[index] : moment(item.dataCheckOut[index], "HH:mm:ss").format("HH:mm"),
              total: item.dataTotal[index],
              key: uuidv4(),
            };
            objRender.checkInHistory.push(checkInObj);
          });
          renderList.push(objRender);
          day++;
        }
      }
      setDataList(renderList);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="my-16 max-md:my-10">
          <h4 className="uppercase font-semibold mt-10">History Check-in</h4>
          <div className="flex gap-20 my-5">
            <select
              className="text-holiday-color border border-holiday-color font-medium py-[1rem] px-[1rem]"
              onChange={handleChangeSelect}
              value={selectMonth}
              name="month"
              id="months"
            >
              {options}
            </select>
            <div className="flex ml-12 max-md:ml-0">
              <div className="flex items-end">
                <div className="w-[4.5rem] h-[4.2rem] bg-holiday-color border-2 border-border-color max-md:w-[2.8rem] max-md:h-[2.6rem]"></div>
                <p className="ml-3 font-[1.8rem] font-semibold text-primary-color">
                  Holiday
                </p>
              </div>
              <div className="flex items-end ml-8">
                <div className="w-[4.5rem] h-[4.2rem] bg-offline-color border-2 border-border-color max-md:w-[2.8rem] max-md:h-[2.6rem]"></div>
                <p className="ml-3 font-[1.8rem] font-semibold text-primary-color">
                  Offline
                </p>
              </div>
              <div className="flex items-end ml-8">
                <div className="w-[4.5rem] h-[4.2rem] bg-weekend-color border-2 border-border-color max-md:w-[2.8rem] max-md:h-[2.6rem]"></div>
                <p className="ml-3 font-[1.8rem] font-semibold text-primary-color">
                  Weekend
                </p>
              </div>
            </div>
          </div>

          <div className="table-container-manager">
            <table className="table-containers table-fixed w-full text-center rounded-t-xl mt-5">
              <thead className="text-primary-color text-[1.4rem]">
                <tr>
                  <th className="h-[5.6rem] sticky top-0 bg-cloud-color max-md:h-[5rem] w-[10rem] th-checkin"></th>
                  {listUserInfo.map((item) => (
                    <th
                      key={item.email}
                      className="sticky top-0 bg-cloud-color w-[15rem] th-checkin"
                    >
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-second-color text-[1.6rem] text-primary-color font-medium overflow-y-auto">
                {dataList.map(
                  (item) =>
                    moment().diff(item?.date) >= 0 && (
                      <tr className="py-2 h-20" key={item.key}>
                        <td className={`leading-7 text-[1.2rem] td-checkin`}>
                          {item?.date && moment(item?.date).format("DD/MM/YYYY")}
                        </td>
                        {item.checkInHistory.map((data) => (
                          <td className={`leading-7 td-checkin ${(data.total == 'w' && data.checkin == 'w')
                            ? `bg-weekend-color`: data.total == 'O'
                            ? `bg-offline-color` : data.total == 'H'
                            ? `bg-holiday-color` : ``}`} key={data.key}>
                            {(data.total !== 'O' && data.total !== 'w' && data.total !== 'H') && <div>
                              <p className="text-[1.2rem] rounded-md text-loading-color border mb-2">{`${data.checkin || ''} - ${data.checkout || ''}`}</p>
                              {data.total !== '' && <div className="text-[1.2rem] rounded-md bg-second-color text-red-color">
                                {data.total} hours
                              </div>}
                            </div>}
                          </td>
                        ))}
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryCheckin;
