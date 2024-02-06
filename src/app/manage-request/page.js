"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  readData,
  tableToJson,
  wirteRequest,
  writeDataToMultipleSheets,
  getColumnLetter,
  updateData
} from "@/utils/spreadsheet";
import { countWeekdays } from '@/utils/convertArray'
import moment from "moment";
import Loading from "../loading";
import { useSelector, useDispatch } from "react-redux";
import {
  SHEET_ID,
  API_KEY,
  SHEET_REQUEST_OFF,
  REQUEST_STATUS,
  SHEET_MEMBER
} from "@/constants";
import { v4 as uuidv4 } from "uuid";
import { setListUserInfo } from '../GlobalRedux/reducers/listuser.reducer';
import { setUserInfo } from '../GlobalRedux/reducers/user.reducer';

const ManageRequest = () => {
  const [dataList, setDataList] = useState([]);
  const [dataListInitial, setDataListInitial] = useState([]);
  const [dataMemberInitial, setDataMemberInitial] = useState([]);
  const { data, update } = useSession();
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state) => state.user.userInfo);
  const listUserInfo = useSelector((state) => state.listUser.listUserInfo);
  const [isCheckedItem, setIsCheckedItem] = useState(false);
  const [extendBox, setExtendBox] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const check = dataList.some(item => item?.isChecked)
    setIsCheckedItem(check);
  }, [dataList])
  
  const rejectDayOff = (item) => {
    setLoading(true);
    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      if(row[0] === item.id) {
        row[5] = REQUEST_STATUS.REJECT;
        row[6] = item.comment;
        break;
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
            console.log("Reject request success");
            getData();
            setLoading(false);
          })
          .catch((error) => {
            console.log("Reject request fail");
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

  const approveDayOff = (item) => {
    setLoading(true);
    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      if(row[0] === item.id) {
        row[5] = REQUEST_STATUS.APPROVE;
        row[6] = item.comment;
        break;
      }
    }

    const [startDateString, endDateString] = item?.date.split('-');

    // Chuyển đổi chuỗi ngày thành đối tượng Date
    const startDate =  moment(startDateString, 'DD/MM/YYYY');
    const endDate = moment(endDateString, 'DD/MM/YYYY');

    // Các ngày cần loại bỏ (thứ 7 và chủ nhật)
    const excludedDays = [0, 6]; // 0 là chủ nhật, 6 là thứ 7

    // Tính tổng số ngày sau khi loại bỏ thứ 7 và chủ nhật
    const totalDays = countWeekdays(startDate, endDate, excludedDays);

    const userFind = listUserInfo?.find(user => user.email === item.email)
    const decimalNumber = parseFloat(userFind?.dayoff.replace(',', '.'));

    let addOneDay = decimalNumber + (1 * (endDateString ? totalDays : 1));
    let addHalfDay = decimalNumber + (0.5 * (endDateString ? totalDays : 1));

    let memberList = [...dataMemberInitial]
    for (const row of memberList) {
      if(row[2] === item.email) {
        if(item?.type === '2') {
          row[3] = addOneDay
        } else {
          row[3] = addHalfDay;
        }
        break;
      }
    }
    const dataRange = [
      {
        range: SHEET_REQUEST_OFF,
        values: originalLst,
      },
      {
        range: SHEET_MEMBER,
        values: memberList,
      }
    ];

    const callbacks = {
      onSuccess: (newToken) => {
        writeDataToMultipleSheets(newToken ? newToken : data.accessToken, dataRange)
          .then((response) => {
            console.log("Approve request success");
            getData();
            setLoading(false);
          })
          .catch((error) => {
            console.log("Approve request fail");
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

  const rejectAll = () => {
    setLoading(true);
    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      const requestDetail = dataList.find(request => request.id === row[0]);
      if(requestDetail?.isChecked) {
        row[5] = REQUEST_STATUS.REJECT;
        row[6] = requestDetail.comment;
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
            console.log("Reject all request success");
            getData();
            setLoading(false);
          })
          .catch((error) => {
            console.log("Reject all request fail");
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

  const approveAll = () => {
    setLoading(true);
    let originalLst = [...dataListInitial]
    for (const row of originalLst) {
      const requestDetail = dataList.find(request => request.id === row[0]);
      if(requestDetail?.isChecked) {
        row[5] = REQUEST_STATUS.APPROVE;
        row[6] = requestDetail.comment;
      }
    }
   
    let memberList = [...dataMemberInitial]
    for (const row of memberList) {
      let requestDetails = dataList.filter(request => request.isChecked && request.email === row[2]);

      const requestDetail = requestDetails.map((requestDetail) => {
        if(requestDetail?.isChecked) {
          const [startDateString, endDateString] = requestDetail?.date.split('-');
  
          // Chuyển đổi chuỗi ngày thành đối tượng Date
          const startDate =  moment(startDateString, 'DD/MM/YYYY');
          const endDate = moment(endDateString, 'DD/MM/YYYY');
  
          // Các ngày cần loại bỏ (thứ 7 và chủ nhật)
          const excludedDays = [0, 6]; // 0 là chủ nhật, 6 là thứ 7
  
          // Tính tổng số ngày sau khi loại bỏ thứ 7 và chủ nhật
          const totalDays = countWeekdays(startDate, endDate, excludedDays);
  
          const addOneDay = (1 * (endDateString ? totalDays : 1));
          const addHalfDay = (0.5 * (endDateString ? totalDays : 1));
  
          if (requestDetail.type === '2') {
            row[3] = Number(row[3]) + addOneDay
          } else {
            row[3] = Number(row[3]) + addHalfDay
          }
        }
      })
    }

    const dataRange = [
      {
        range: SHEET_REQUEST_OFF,
        values: originalLst,
      },
      {
        range: SHEET_MEMBER,
        values: memberList,
      },
    ];

    const callbacks = {
      onSuccess: (newToken) => {
        writeDataToMultipleSheets(newToken ? newToken : data.accessToken, dataRange)
          .then((response) => {
            setLoading(false);
            console.log("Approve all request success");
            getData();
          })
          .catch((error) => {
            console.log("Approve all request fail");
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

  const handleTextChange = (id, text) => {
    const newLst = [...dataList];
    for (const request of newLst) {
      if(request.id === id) {
        request.comment = text;
        break;
      }
    }
    setDataList(newLst)
  };

  const onExtend = (id) => {
    setExtendBox((prevExpandedTds) => {
      if (prevExpandedTds.includes(id)) {
        return prevExpandedTds.filter((tdId) => tdId !== id);
      } else {
        return [...prevExpandedTds, id];
      }
    });
  }
  const handleCheckboxChange = (id, isChecked) => {
    const newLst = [...dataList];
    for (const request of newLst) {
      if(request.id === id) {
        request.isChecked = isChecked;
        break;
      }
    }
    setDataList(newLst)
  };
  const handleSelectAll = (isChecked) => {
    const newLst = [...dataList];
    for (const item of newLst) {
      item.isChecked = isChecked;
    }
    setDataList(newLst)
  };
  const getData = async () => {
    setLoading(true);
    readData(SHEET_REQUEST_OFF)
      .then((result) => {
        const jsonData = tableToJson(result?.data?.values);
        const listRequest = jsonData.filter(
          (item) => item.status == "pending"
        );
        for (const item of listRequest) {
          const userFind = listUserInfo?.find(user => user.email === item.email) || { name: '' };
          item.name = userFind.name;
        }
        setDataList(listRequest);
        setDataListInitial(result?.data?.values)
        setLoading(false);
      })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
        setLoading(false);
      });
  }

  useEffect(() => {
    if ((data && !userInfo) || data) {
      readData(SHEET_MEMBER)
        .then((result) => {
          const jsonData = tableToJson(result?.data?.values);

          setDataMemberInitial(result?.data?.values)
          dispatch(setListUserInfo(jsonData));
          const verifyEmail = jsonData.filter((member) => {
            if (member.email === data?.user.email) {
              dispatch(setUserInfo(member));
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
    if (userInfo) {
      getData();
    }
  }, [userInfo]);

  return (
    <div className="my-16 max-md:my-10">
      <div className="flex justify-between items-center">
        <h4 className="uppercase font-semibold mt-10">Manage leave requests</h4>
        {dataList?.length > 0 && <p className="border-b-4 border-orange-color py-2 font-semibold max-md:text-[1.2rem] max-md:w-[12rem] h-[2.5rem]">
          Total number of requests: {dataList?.length}
        </p>}
      </div>
      <div className="table-container-manager">
        <table className="table-fixed w-full text-center rounded-t-xl mt-5">
          <thead className="text-primary-color text-[1.8rem] font-semibold max-md:text-[1.3rem]">
            <tr>
              <th className="h-[5.6rem] sticky top-0 bg-second-color max-md:h-[5rem] w-[5rem]">
                <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={isCheckedItem} className="ml-5" />
              </th>
              <th className="sticky top-0 bg-second-color relative z-50">
                <div className="flex items-center gap-5 justify-end p-5">
                  <button
                    className={`${isCheckedItem ? `text-white bg-orange-color` : `text-white bg-loading-color`}
                    flex p-2 text-[1.3rem] justify-center align-items-center py-[0.8rem] w-[8rem] rounded-3xl`}
                    disabled={!isCheckedItem}
                    onClick={() => approveAll()}
                  >
                    Approve 
                  </button>
                  <button
                    className={`${isCheckedItem ? `text-orange-color bd-orange-color bg-white-color` : `text-loading bg-white-color bd-loading-color`}
                    flex p-2 text-[1.3rem] justify-center align-items-center  py-[0.8rem] w-[8rem] rounded-3xl`}
                    disabled={!isCheckedItem}
                    onClick={() => rejectAll()}
                  >
                    Reject
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-second-color text-[1.6rem] text-primary-color font-medium max-md:text-[1.3rem] overflow-y-auto">
            {dataList?.map((item, index) => (
              <tr key={item.id} className="py-2 h-20">
                <td>
                  <div className="flex">
                    {extendBox.includes(item.id) ? <img src="/icon-up.png" alt="My Image" width="12" height="12" />
                    : <img src="/icon-down.png" alt="My Image" width="12" height="12" />}
                    <input
                      type="checkbox"
                      checked={item.isChecked ? true : false}
                      onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                      className="ml-3"
                    />
                  </div>
                </td>
                <td>
                  <div className="flex justify-between relative z-40 onExtend" onClick={() => onExtend(item.id)} >
                    <div className="flex items-center">
                      <img src={item?.image ? item?.image : `/user.png`} alt="avatar" className="bg-white rounded-full mr-4 shrink-0 avatar-manage" />
                      <p className="font-bold text-loading-color mr-10">{item?.name} has requested leave on &nbsp;
                        {item?.type === '0' ? 'Morning' : item?.type === '1' ? 'Afternoon' : 'All day'} &nbsp; {item?.date}
                      </p>
                    </div>
                    {/* <div className="flex items-center">
                      <p className="font-semibold text-loading-color text-[1.2rem]">12 hours ago</p>
                    </div> */}
                  </div>
                  <div className={`relative z-30 content ${extendBox.includes(item.id) ? `expanded` : ``} flex justify-between items-center ml-[4rem]`}>
                    <div className="items-center text-ellipsis-wrap">
                      <div className="flex my-2 gap-6 text-ellipsis">
                        <p className="">Hours: </p>
                        <p>{item?.type === '0' ? 'Morning' : item?.type === '1' ? 'Afternoon' : 'All day'}</p>
                      </div>
                      <div className="flex my-2 gap-10 text-ellipsis-100">
                        <p className="">Date:</p>
                        <p className="">{item?.date}</p>
                      </div>
                      <div className="flex my-2 gap-2 text-ellipsis-100">
                        <p className="">Reason:</p>
                        <p className="text-start text-ellipsis-100">{item?.reason}</p>
                      </div>
                    </div>
                    <div className="flex wrap-mamage-comment">
                      <img className="h-fit mr-3" src="/pencil.svg" alt="My Image" width="25" height="25"  />
                      <textarea
                        className="textarea-manager"
                        value={item.comment}
                        onChange={(e) => handleTextChange(item.id, e.target.value)}
                        placeholder="Add comment here..."
                        rows={4}
                        cols={10}
                        style={{ width: '100%', height: '80px' }} // Set fixed size
                      />
                    </div>
                    <div className="flex gap-5 items-center w-[15rem]">
                      <button
                        className="text-white bg-orange-color rounded-3xl w-[8rem] text-[1.3rem] h-[2.8rem]"
                        onClick={() => approveDayOff(item)}
                      >
                        Approve
                      </button>
                      <button
                        className="text-orange-color bd-orange-color bg-white-color rounded-3xl w-[8rem] text-[1.3rem] h-[2.8rem]"
                        onClick={() => rejectDayOff(item)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <Loading />}
    </div>
  );
};

export default ManageRequest;