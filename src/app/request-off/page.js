"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  readData,
  refreshToken,
  tableToJson,
  updateStatusRequest,
  updateData
} from "@/utils/spreadsheet";
import moment from "moment";
import Loading from "../loading";
import { useSelector, useDispatch } from "react-redux";
import { REQUEST_STATUS, SHEET_REQUEST_OFF } from "@/constants";
import { v4 as uuidv4 } from "uuid";
import ModalDayOff from "./ModalDayOff";
import { jwtDecode } from "jwt-decode";

const RequestOff = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [listRequestAll, setListRequestAll] = useState([]);
  const { data, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [dataListInitial, setDataListInitial] = useState([]);
  const userInfo = useSelector((state) => state.user.userInfo);

  const handleRequestDayOff = () => {
    setIsOpenModal(true);
  };
  const closeModal = () => {
    setIsOpenModal(false);
  };

  const getData = async () => {
    setLoading(true);
    readData(SHEET_REQUEST_OFF)
      .then((result) => {
        const jsonData = tableToJson(result?.data?.values);
        setListRequestAll(jsonData);
        const listRequest = jsonData.filter(
          (item) => item.email == userInfo.email
        );
        setDataListInitial(result?.data?.values);
        setDataList(listRequest.reverse());
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
  }, [userInfo, isOpenModal]);

  const onRecall = (item) => {
    if (listRequestAll.length > 0) {
      for (let i = 0; i < listRequestAll.length; i++) {
        let itemRequest = listRequestAll[i];
        if (item.id === itemRequest.id) {
          let position = `F${i + 2}`;
          setLoading(true);
          const callbacks = {
            onSuccess: (newToken) => {
              updateStatusRequest(position, "Cancel", newToken ? newToken : data.accessToken)
                .then((response) => {
                  console.log("Recall request success");
                  getData();
                })
                .catch((error) => {
                  console.log("Recall request fail");
                  setLoading(false);
                });
            },
            onFail: () => {
              setLoading(false);
              signOut();
            }
          }
          updateData(callbacks, data, update)
        }
      }
    }
  };

  return (
    <div className="my-16 max-md:my-10">
      <div className="bg-second-color mx-auto text-center p-5 rounded-2xl shadow-xl max-[900px]:w-full place-items-center flex justify-between">
        <div className="flex align-center">
          <img src="/calendar.png" alt="My Image" width="25" height="25" />
          <p
            className={`font-semibold text-primary-color place-self-center ml-3`}
          >
            Time off request
          </p>
        </div>
        <button
          onClick={handleRequestDayOff}
          className={`flex p-5 align-items-center text-white bg-orange-color uppercase py-[1rem] w-[15rem] rounded-2xl max-md:w-[20rem]`}
        >
          <img
            className="mr-3"
            src="/add.png"
            alt="My Image"
            width="12"
            height="12"
          />
          Add Request 
        </button>
      </div>

      <div className="flex my-10">
        <h4 className="uppercase font-semibold mt-10">List time off</h4>
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

      <div className="table-container">
        <table className="table-fixed w-full text-center rounded-t-xl mt-5">
          <thead className="text-primary-color text-[1.8rem] font-semibold max-md:text-[1.3rem]">
            <tr>
              <th className="h-[5.6rem] sticky top-0 bg-second-color max-md:h-[5rem] w-[25rem]">Date</th>
              <th className="sticky top-0 bg-second-color w-[16rem]">Type</th>
              <th className="sticky top-0 bg-second-color">Reason</th>
              <th className="sticky top-0 bg-second-color w-[16rem]">Status</th>
              <th className="sticky top-0 bg-second-color w-[25rem]">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-second-color text-[1.6rem] text-primary-color font-medium max-md:text-[1.3rem] overflow-y-auto">
            {dataList?.map((item) => (
              <tr key={item.id} className={`py-2 h-20 ${item?.is_paid_leave ? '' : 'background-unpaid'}`}>
                <td className={`leading-7 text-red-color`}>{item.date}</td>
                <td>
                  <p
                    className={`py-2 w-[8.9rem] mx-auto border-blue-color text-blue-color rounded max-md:w-[7rem]`}
                  >
                    {item?.type === "0"
                      ? "Sáng"
                      : item?.type === "1"
                      ? "Chiều"
                      : "Full Day"}
                  </p>
                </td>
                <td>
                  <p
                    className={`py-2 mx-auto border-orange-color text-orange-color rounded max-md:w-[7rem]`}
                  >
                    {item.reason}
                  </p>
                </td>
                <td>
                  {item.status == REQUEST_STATUS.PENDING ? (
                    <div className="flex">
                      <button
                        onClick={() => {
                          onRecall(item);
                        }}
                        className={`flex p-2 text-[1rem] justify-center align-items-center text-white bg-orange-color uppercase py-[0.8rem] w-[7rem] rounded-3xl`}
                      >
                        Recall
                      </button>
                      <p
                        className={`font-semibold text-[1rem] text-primary-color tracking-[0.2rem] place-self-center ml-3`}
                      >
                        Pending...
                      </p>
                    </div>
                  ) : item.status == REQUEST_STATUS.APPROVE ? (
                    <div className="flex">
                      <img
                        src="/approve.svg"
                        alt="My Image"
                        width="18"
                        height="18"
                      />
                      <p
                        className={`font-semibold text-[1.2rem] text-primary-color tracking-[0.2rem] place-self-center ml-3`}
                      >
                        Approved
                      </p>
                    </div>
                  ) : item.status == REQUEST_STATUS.REJECT ? (
                    <div className="flex">
                      <img
                        src="/reject.svg"
                        alt="My Image"
                        width="18"
                        height="18"
                      />
                      <p
                        className={`font-semibold text-[1.2rem] text-primary-color tracking-[0.2rem] place-self-center ml-3`}
                      >
                        Refuse
                      </p>
                    </div>
                  ) : (
                    <div className="flex">
                      <p
                        className={`font-semibold text-[1.2rem] text-primary-color tracking-[0.2rem] place-self-center`}
                      >
                        Cancel
                      </p>
                    </div>
                  )}
                </td>
                <td>
                  <p className={`py-2 mx-auto border-primary-color rounded`}>
                    {item.comment}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalDayOff
        dataList={dataList}
        isOpen={isOpenModal}
        closeModal={closeModal}
        dataListInitial={dataListInitial}
      />
      {loading && <Loading />}
    </div>
  );
};

export default RequestOff;
