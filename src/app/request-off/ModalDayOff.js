import ReactModal from 'react-modal';
import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from "uuid";
import {
  convertArrayList,
  convertArraySplitDayList,
  convertArrayModal,
  convertArraySplitDayModal,
} from "@/utils/convertArray";
import {
  wirteRequest,
  updateData,
  writeDataToMultipleSheets,
  getRangeRequests,
} from "@/utils/spreadsheet";
import { useSession, signOut } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../loading";
import { REQUEST_STATUS, SHEET_REQUEST_OFF } from "@/constants";

const ModalDayOff = ({ isOpen, closeModal, dataList, dataListInitial }) => {
  if (!isOpen) {
    return null;
  }

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [items, setItems] = useState([]);
  const [convertDateSelect, setConvertDateSelect] = useState([]);
  const [selectedOption, setSelectedOption] = useState('2');
  const [textValue, setTextValue] = useState('');
  const [errMessageDate, setErrMessageDate] = useState(false);
  const { data, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedOptionRadio, setSelectedOptionRadio] = useState(true);
  const userInfo = useSelector((state) => state.user.userInfo);
  const listUserInfo = useSelector((state) => state.listUser.listUserInfo);

  const handleSelectChangeRadio = (event) => {
    setSelectedOptionRadio(!selectedOptionRadio);
  };

  const handleDateChange = (dates) => {
    setErrMessageDate(false)
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const handleClick = () => {
    onSelect(label);
  };

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };
  const startDateFormat = startDate?.toLocaleDateString('en-GB')
  const endDateFormat = endDate?.toLocaleDateString('en-GB')

  const arrayList = convertArrayList(dataList)
  const arraySplitDayList = convertArraySplitDayList(arrayList)

  const addDayOff = () => {
    const newItem = {
      id: uuidv4(),
      email: data.user.email,
      type: selectedOption,
      is_read_admin: userInfo?.role == "admin" ? true : false,
      is_read: userInfo?.role == "admin" ? true : false,
      is_paid_leave: selectedOptionRadio,
      reason: textValue,
      date:
        !endDate || startDateFormat === endDateFormat
          ? `${startDateFormat}`
          : `${startDateFormat} - ${endDateFormat}`,
      status:
        userInfo?.role === "admin"
          ? REQUEST_STATUS.APPROVE
          : REQUEST_STATUS.PENDING,
    };

    const overlapsWithExisting = items.some((item) => {
      const [existingStartDate, existingEndDate] = item.date.split(' - ');
      const newStartDate = new Date(startDateFormat);
      const newEndDate = endDate ? new Date(endDateFormat) : newStartDate;

      const existingStart = new Date(existingStartDate);
      const existingEnd = existingEndDate ? new Date(existingEndDate) : existingStart;

      return (
        (newStartDate >= existingStart && newStartDate <= existingEnd) ||
        (newEndDate >= existingStart && newEndDate <= existingEnd) ||
        (existingStart >= newStartDate && existingStart <= newEndDate) ||
        (existingEnd >= newStartDate && existingEnd <= newEndDate)
      );
    });

    if (overlapsWithExisting) {
      setErrMessageDate(true);
      return;
    }

    const convertDateSelect = [
      {
        type: selectedOption,
        date: (!endDate || startDateFormat === endDateFormat)
        ? `${startDateFormat}` : `${startDateFormat} - ${endDateFormat}`
      }
    ]

    const arrayModal = convertArrayModal(convertDateSelect)
    const arraySplitDayModal = convertArraySplitDayModal(arrayModal)

    const checkDateExists = arraySplitDayModal.some(obj1 => arraySplitDayList.some(obj2 => obj1.date === obj2.date && obj1.type === obj2.type))

    if (checkDateExists) {
      setErrMessageDate(true);
    } else {
      setItems([...items, newItem]);
      setTextValue("");
      setSelectedOption("2");
      setStartDate(null);
      setEndDate(null);
    }
  };

  const addRequestPostToSheet = () => {
    setLoading(true);
    if (userInfo.role === "admin") {
      const data2 = [
        ...items.map((item) => [
          item.id,
          item.email,
          item.date,
          item.type,
          item.reason,
          item.status,
          item.is_read_admin ? "TRUE" : "",
          item.is_read ? "TRUE" : "FALSE",
          item.is_paid_leave ? "TRUE" : "FALSE",
          "", // comment
        ]),
      ];
      const dataRequest = [...dataListInitial].concat(data2);
      const listApprove = dataList.filter(
        (item) => item.status.trim().toUpperCase() == "APPROVE"
      );
      const ranges = getRangeRequests(
        items,
        userInfo.email,
        listApprove,
        listUserInfo
      );

      const rangeDayOffs = [];
      ranges.forEach((range) => {
        rangeDayOffs.push({ range: range, values: [["O"]] });
      });

      const dataRange = [
        {
          range: SHEET_REQUEST_OFF,
          values: dataRequest,
        },
        ...rangeDayOffs,
      ];
      const callbacks = {
        onSuccess: (newToken) => {
          writeDataToMultipleSheets(
            newToken ? newToken : data.accessToken,
            dataRange
          )
            .then((response) => {
              toast.success("Update successful", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3000,
              });
              closeModal();
              setLoading(false);
            })
            .catch((error) => {
              console.error("Đã xảy ra lỗi:", error);
              setLoading(false);
            });
        },
        onFail: () => {
          setLoading(false);
          closeModal();
          signOut();
        },
      };

      console.log(dataRange);
      updateData(callbacks, data, update);
    } else {
      const callbacks = {
        onSuccess: (newToken) => {
          wirteRequest(items, newToken ? newToken : data.accessToken)
            .then((res) => {
              // const response = await writeDataToMultipleSheets();
              toast.success("Update successful", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3000,
              });
              closeModal();
              setLoading(false);
            })
            .catch((error) => {
              console.error("Đã xảy ra lỗi:", error);
              setLoading(false);
            });
        },
        onFail: () => {
          setLoading(false);
          closeModal();
          signOut();
        },
      };
      updateData(callbacks, data, update);
    }
  };

  const isWeekend = (date) => {
    const dayOfWeek = date.getDay();
    return (
      dayOfWeek === 1 ||
      dayOfWeek === 2 ||
      dayOfWeek === 3 ||
      dayOfWeek === 4 ||
      dayOfWeek === 5
    ); // 0 is Sunday, 6 is Saturday
  };

  const targetIndices = [0, 1];
  const filteredArray = items.filter((item, index) => targetIndices.includes(index));
  const mappedValues = filteredArray.map((item) => item.date);

  const onCloseBoxDayOff = (id) => {
    const updatedArray = [...items];
    const indexToDelete = updatedArray.findIndex((item) => item.id === id);

    if (indexToDelete !== -1) {
      updatedArray.splice(indexToDelete, 1);

      updatedArray.forEach((item, index) => {
        item.id = index + 1;
      });

      setItems(updatedArray);
    }
  }

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const maxCharacters = 500;
  const remainingCharacters = maxCharacters - textValue?.length;

  useEffect(() => {
    setItems(items)
  }, [items]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Request to day off"
    >
      <p className="mb-5 text-start mb-10">Fill out this form to request time off. You'll receive an email once the request has been approved.</p>
      <div className="w-100 justify-center mb-5 wrap-box-modal p-5">
        <div className="flex w-100 mb-5 place-items-center">
          <p className="font-semibold mr-10">Hours</p>
          <select
            id="mySelect"
            value={selectedOption}
            onChange={handleSelectChange}
            className="text-holiday-color border border-holiday-color font-medium py-[0.5rem] px-[1rem]"
          >
            <option value="2">All day</option>
            <option value="0">Morning Off</option>
            <option value="1">Afternoon Off</option>
          </select>

          {errMessageDate && <div className="w-100 place-items-center ml-auto">
            <p className="font-semibold text-red-color">Your date has already been selected</p>
          </div>}
        </div>
        <div className="flex gap-10 mt-10 justify-between">
          <div className="flex">
            <p className="font-semibold mr-10">When</p>
            <div className="text-center mr-10">
              <div className="flex gap-5 mb-5 justify-end">
                {(startDateFormat || endDateFormat) && <p className="text-orange-color font-semibold">{startDateFormat} - {endDateFormat}</p>}
                <i className="fa-solid fa-calendar-plus text-orange-color"></i>
              </div>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                inline
                minDate={new Date()}
                className="customDatePicker"
                filterDate={isWeekend}
              />
            </div>
          </div>

          <div className="flex">
            <p className="font-semibold mr-10">Reasons</p>
            <div>
              <textarea
                className="textarea"
                value={textValue}
                onChange={handleTextChange}
                placeholder="Type reason for off ..."
                rows={4} // Set the number of rows as needed
                cols={50} // Set the number of columns as needed
                style={{ width: '450px', height: '170px' }} // Set fixed size
                maxLength="500"
              />
              <p className="text-blue-color text-[1.2rem] mt-2">
                {remainingCharacters} characters remainning..({maxCharacters} maximum)
              </p>
            </div>
          </div>
        </div>

        <div className="ml-24 my-10 flex gap-5">
          <div className="flex gap-2">
            <input
              type="radio"
              value={selectedOptionRadio}
              checked={selectedOptionRadio}
              onChange={handleSelectChangeRadio}
            />
            <label>
              Paid leave
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="radio"
              value={!selectedOptionRadio}
              checked={!selectedOptionRadio}
              onChange={handleSelectChangeRadio}
            />
            <label>
              Unpaid leave
            </label>
          </div>
        </div>

        <div className="flex justify-center gap-20 my-10">
          <button
            onClick={addDayOff}
            className="add-day flex text-white bg-blue-color uppercase py-[1rem] px-[2rem] rounded-2xl max-md:w-[20rem] mx-10"
            disabled={!selectedOption || !textValue || !startDateFormat}
          >
            <img className="mr-3" src="/add.png" alt="My Image" width="12" height="12" />
            Add day
          </button>
        </div>
        <hr className="mb-10" />
        <div className={`wrap-custom-box gap-10 justify-start ${items?.length > 0 && `p-8`}`}>
          {items.map((item, index) => (
            <div key={index} className="border-tab">
              <p className="font-semibold mr-3 mb-1">Request {index + 1}</p>
              <div className="custom-box">
                <button
                  onClick={() => onCloseBoxDayOff(item.id)}
                  className="close-box"
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </button>
                <div className="flex my-2 gap-7">
                  <p className="font-semibold">Hours: </p>
                  <p>{item?.type === '0' ? 'Morning' : item?.type === '1' ? 'Afternoon' : 'All day'}</p>
                </div>
                <div className="flex my-2 gap-10">
                  <p className="font-semibold">Date:</p>
                  <p className="">{item?.date}</p>
                </div>
                <div className="flex my-2 gap-3">
                  <p className="font-semibold">Reason:</p>
                  <p className="text-ellipsis">{item?.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex mt-20">
        <button
          onClick={addRequestPostToSheet}
          className={`${items?.length == 0 ? `bg-gray-color` : `bg-orange-color`} text-white py-[1rem] px-[2rem] rounded-2xl max-md:w-[20rem] mx-10`}
          disabled={items?.length == 0}
        >
          Request Time Off
        </button>
        <button
          onClick={closeModal}
          className="text-orange-color bd-orange-color bg-white-color uppercase py-[1rem] px-[2rem] rounded-2xl max-md:w-[20rem] mx-10"
        >
          Cancel
        </button>
      </div>
      {loading && <Loading />}
      <ToastContainer />
    </ReactModal>
  );
};
export default ModalDayOff;