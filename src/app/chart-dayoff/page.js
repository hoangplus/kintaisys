"use client";

import React, { useEffect, useState, useRef, use } from "react";
import DaysOffChart from "./DaysOffChart";
import { useSession } from "next-auth/react";
import { SHEET_MEMBER, SHEET_REQUEST_OFF } from "@/constants";
import { readData, tableToJson } from "@/utils/spreadsheet";
import moment from "moment";
import { useSelector } from "react-redux";
import { convertArraySplitDayList } from "@/utils/convertArray";
import Loading from "../loading";

const monthNames = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const ChartDayoff = () => {
  const chartRef = useRef(null);
  const { data, update } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [dataList, setDataList] = useState([]);
  const listUserInfo = useSelector((state) => state.listUser.listUserInfo);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [resultMonth, setResultMonth] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSelectedMonth = (e) => {
    setSelectedMonth(e.target.value);
  };

  useEffect(() => {
    setLoading(true);
    readData(SHEET_MEMBER)
      .then((result) => {
        const jsonData = tableToJson(result?.data?.values);
        setUserInfo(jsonData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
        setLoading(false);
      });

    readData(SHEET_REQUEST_OFF)
      .then((result) => {
        setLoading(false);
        const jsonData = tableToJson(result?.data?.values);

        const listRequest = jsonData.filter((item) => item.status == "approve");

        const listDataChart = [];
        listUserInfo.forEach((user) => {
          let item = {
            user,
            dayOffs: Array.from({ length: 12 }, () => 0),
            unPaidDayOffs: Array.from({ length: 12 }, () => 0),
          };
          listRequest.forEach((request) => {
            if (request.email == user.email) {
              if (request.date.includes("-")) {
                let convertResults = convertArraySplitDayList([request]);
                convertResults.forEach((itemRequest) => {
                  const dateRequest = moment(itemRequest.date, "DD/MM/YYYY");
                  if (dateRequest.day() !== 0 && dateRequest.day() !== 6) {
                    const value = request.type == 2 ? 1 : 0.5;
                    const month = dateRequest.month();
                    if (request.is_paid_leave) {
                      item.dayOffs[month] += value;
                    } else {
                      item.unPaidDayOffs[month] += value;
                    }
                  }
                });
              } else {
                const dateRequest = moment(request.date, "DD/MM/YYYY");
                const month = dateRequest.month();
                const value = request.type == 2 ? 1 : 0.5;
                if (request.is_paid_leave) {
                  item.dayOffs[month] += value;
                } else {
                  item.unPaidDayOffs[month] += value;
                }
              }
            }
          });
          listDataChart.push(item);
        });
        setDataList(listDataChart);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Đã xảy ra lỗi:", error);
      });
  }, []);

  useEffect(() => {
    if (dataList.length > 0) {
      setResultMonth(getListDataChartWithMonth(selectedMonth))
    }
  }, [dataList, selectedMonth]);

  const getListDataChartWithMonth = (month) => {
    if (month) {
      const index = month - 1;
      let dayOffs = dataList.map((item) => {
        return item.dayOffs[index];
      });

      let unPaidDayOffs = dataList.map((item) => {
        return item.unPaidDayOffs[index];
      });
      return {
        dayOffs,
        unPaidDayOffs,
      };
    } else {
      let dayOffs = dataList.map((item) => {
        return item.dayOffs.reduce((acc, curr) => acc + curr, 0);
      });

      let unPaidDayOffs = dataList.map((item) => {
        return item.unPaidDayOffs.reduce((acc, curr) => acc + curr, 0);
      });
      return {
        dayOffs,
        unPaidDayOffs,
      };
    }
  };

  useEffect(() => {
    let myChart = null;

    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      // Destroy the existing chart before creating a new one
      if (myChart) {
        myChart.destroy();
      }

      myChart = DaysOffChart(ctx, userInfo, resultMonth);
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  }, [resultMonth]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <h2 className="uppercase font-semibold my-10">Days Off Chart</h2>
          <select
            value={selectedMonth}
            onChange={handleSelectedMonth}
            className="text-holiday-color border border-holiday-color font-medium py-[1rem] px-[1rem]"
          >
            <option value="">Whole Year</option>
            {monthNames.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          {resultMonth && (
            <div className="wrap-canvas" >
              <canvas className="canvas" ref={chartRef}></canvas>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartDayoff;
