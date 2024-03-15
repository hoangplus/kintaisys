'use client';

import moment from 'moment';
import { useEffect, useState, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Loading from './loading';
import {
  readData,
  writeSheet,
  checkTokenInvalid,
  tableToJson,
  getColumnLetter,
  refreshToken,
  updateData,
  updateSession
} from '@/utils/spreadsheet';

import { jwtDecode } from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';

const Home = () => {
  const currentDate = new Date();
  const nextMonthDate = currentDate.getDate() >= 26 ? moment(currentDate).add(1, 'months') : moment(currentDate);
  const currentMonth =  nextMonthDate.month() + 1;
  const currentYear = currentDate.getFullYear();
  const { data, update } = useSession();
  const scrollRef = useRef(null);
  const [options, setOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState('2');
  const [selectMonth, setSelectMonth] = useState(currentMonth);
  const [timer, setTimer] = useState();
  const [checkinIndex, setCheckinIndex] = useState(-1);
  const [dataList, setDataList] = useState([]);
  const [dataListCurrentMonth, setDataListCurrentMont] = useState([]);

  const userInfo = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  
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

  useEffect(() => {
    setInterval(() => {
      const date = new Date();
      const timeFormat = moment(
        `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        'hhmmss'
      ).format('HH:mm:ss');
      setTimer(timeFormat);
    }, 1000);
  }, []);

  useEffect(() => {
    if (userInfo) {
      getData(selectMonth);
    }
  }, [userInfo, selectMonth]);

  const getData = async (month) => {
    setLoading(true);
    readData(month)
      .then((result) => {
        const values = result?.data?.values;
        let newList = [values[4], values[5]];

        for (let index = 0; index < values.length; index++) {
          const row = values[index];
          if (row.length == 0) continue;
          if (row[1] === userInfo?.name) {
            newList.push(row);
            if (newList.length == 4) {
              newList.push(values[index + 1]);
              mapingList(newList);
              if (month === currentMonth) {
                setCheckinIndex(index);
              }
              break;
            }
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Đã xảy ra lỗi:', error);
        setLoading(false);
      });
  };

  const mapingList = (arrays) => {
    if (arrays && arrays.length == 5) {
      const lstDay = arrays[0];
      const lstDate = arrays[1];
      const lstTime = arrays[2];
      const lstCheckIn = arrays[3];
      const lstCheckOut = arrays[4];
      let listTmp = [];

      let day = 0;
      let month = selectMonth == 1 ? 12 : selectMonth - 1;
      let monthString = (month < 10 ? '0' : '') + Math.abs(month);
      let year =
      (selectMonth == 1 && currentDate.getMonth() == 11 && currentDate.getDate() <= 26 || selectMonth != 1)
        ? currentDate.getFullYear()
        : currentDate.getFullYear() - 1;
      const startDay = moment(
        `${year}-${monthString}-${lstDate[2]}`
      );
      for (let index = 2; index < lstDay.length; index++) {
        if (
          selectMonth == currentMonth &&
          lstDate[index] == currentDate.getDate()
        ) {
          if(lstTime[index] && lstTime[index].toUpperCase() == 'O') {
            setCheckInStatus('2');
          }
          else if (!lstCheckIn[index] || lstCheckIn[index].toUpperCase() == 'W') {
            setCheckInStatus('0');
          } else if (!lstCheckOut[index] || lstCheckOut[index].toUpperCase() == 'W') {
            setCheckInStatus('1');
          } else {
            setCheckInStatus('2');
          }
        }
        listTmp.push({
          date: moment(startDay).add(day, 'days').format('YYYY-MM-DD'),
          total_time: lstTime[index] || '',
          check_in: lstCheckIn[index] || '',
          check_out: lstCheckOut[index] || '',
        });

        day++;
      }
      if (selectMonth == currentMonth) {
        setDataListCurrentMont([...listTmp]);
      }
      setDataList(listTmp.reverse());
    }
  };

  const getColumnName = (type) => {
    let index = dataListCurrentMonth.findIndex((item) => {
      let date = new Date(item.date);
      return currentDate.getDate() === date.getDate();
    });
    if (type == 'checkin') {
      return `${getColumnLetter(index + 2)}${checkinIndex + 1}`;
    }
    return `${getColumnLetter(index + 2)}${checkinIndex + 2}`;
  };

  const handleWrite = (accessToken) => {
    let position = '';
    if (checkInStatus === '0') {
      position = getColumnName('checkin');
    } else if (checkInStatus === '1') {
      position = getColumnName('checkout');
    }
    if (position !== '') {
      writeSheet(currentMonth, position, timer, accessToken)
        .then((result) => {
          getData(selectMonth);
        })
        .catch((error) => {
          console.error('Đã xảy ra lỗi wirte:', error);
          setLoading(false);
        });
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    const callbacks = {
      onSuccess: (newToken) => {
        handleWrite(newToken ? newToken : data.accessToken);
      },
      onFail: () => {
        signOut();
      }
    }
    updateData(callbacks, data, update)
  };

  const handleChangeSelect = (event) => {
    setSelectMonth(event.target.value);
    scrollRef.current.scrollTop = 0;
  };

  return (
    <>
      <div>
        <div>
          <div>
            <div className="my-16 max-md:my-10">
              <div className="bg-second-color w-[38.6rem] mx-auto text-center py-12 rounded-2xl shadow-xl max-[430px]:w-full">
                <h1
                  className={`text-[7rem] font-semibold text-primary-color ${
                    checkInStatus !== '2' && 'mb-8'
                  } tracking-[0.2rem] max-md:text-[5.2rem]`}
                >
                  {timer}
                </h1>
                {checkInStatus !== '2' && (
                  <button
                    onClick={handleCheckIn}
                    className={`text-white ${
                      checkInStatus === '1' ? 'bg-orange-color' : 'bg-green-color'
                    } text-[2.8rem] font-black uppercase py-[1.8rem] w-[25rem] rounded-2xl max-md:text-[2rem] max-md:w-[20rem]`}
                  >
                    {checkInStatus === '1' ? 'check out' : 'check in'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-end ml-12 max-md:ml-0 max-md:flex-col max-md:items-start">
              <div className="text-holiday-color max-md:mb-10">
                <h4 className="uppercase font-semibold mb-4">date range</h4>

                <select
                  className="border border-holiday-color font-medium py-[1rem] px-[1rem]"
                  onChange={handleChangeSelect}
                  value={selectMonth}
                  name="month"
                  id="months"
                >
                  {options}
                </select>
              </div>
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

            <div className="mt-16 max-md:mt-[1.6rem]">
              <div
                className="overflow-auto shadow-md"
                style={{ height: 'calc(100vh - 460px' }}
                ref={scrollRef}
              >
                <table className="table-fixed  w-full text-center rounded-t-xl">
                  <thead className="text-primary-color text-[1.8rem] font-semibold max-md:text-[1.3rem]">
                    <tr>
                      <th className="h-[6.6rem] sticky top-0 bg-second-color max-md:h-[5rem]">
                        Date
                      </th>
                      <th className="sticky top-0 bg-second-color">Check in</th>
                      <th className="sticky top-0 bg-second-color">Check out</th>
                      <th className="sticky top-0 bg-second-color">Total time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-second-color text-[1.6rem] text-primary-color font-medium max-md:text-[1.3rem]">
                    {dataList?.map(
                      (item) =>
                        moment().diff(item?.date) >= 0 && (
                          <tr
                            key={item.date}
                            className={`h-[5.4rem] ${
                              item?.total_time === 'w'
                                ? 'bg-weekend-color'
                                : item?.total_time.toUpperCase() === 'O'
                                ? 'bg-offline-color'
                                : item?.total_time.toUpperCase() === 'H'
                                ? 'bg-holiday-color'
                                : ''
                            }`}
                          >
                            <td
                              className={`leading-7 ${
                                item?.total_time === 'w' ? 'text-red-color' : ''
                              }`}
                            >
                              {item?.date &&
                                moment(item?.date).format('ddd, MMM D YYYY')}
                            </td>
                            <td>
                              <p
                                className={`py-2 w-[8.9rem] ${
                                  item?.check_in === 'w' || item?.check_in === ''
                                    ? 'bg-outer-color h-[2.8rem] max-md:h-[2.5rem]'
                                    : 'border'
                                } mx-auto border-blue-color text-blue-color rounded max-md:w-[7rem]`}
                              >
                                {item?.check_in !== 'w' && item?.check_in}
                              </p>
                            </td>
                            <td>
                              <p
                                className={`py-2 w-[8.9rem] ${
                                  item?.check_out === 'w' ||
                                  item?.check_out === ''
                                    ? 'bg-outer-color h-[2.8rem] max-md:h-[2.5rem]'
                                    : 'border'
                                } mx-auto border-orange-color text-orange-color rounded max-md:w-[7rem]`}
                              >
                                {item?.check_out !== 'w' && item?.check_out}
                              </p>
                            </td>
                            <td>
                              <p
                                className={`py-2 w-[8.9rem] ${
                                  item?.total_time === 'w' ||
                                  item?.total_time.toUpperCase() === 'O' ||
                                  item?.total_time.toUpperCase() === 'H' ||
                                  item?.total_time === ''
                                    ? 'bg-outer-color h-[2.8rem] max-md:h-[2.5rem]'
                                    : 'border'
                                } mx-auto border-primary-color rounded max-md:w-[3.5rem]`}
                              >
                                {item?.total_time !== 'w' &&
                                  item?.total_time.toUpperCase() !== 'O' &&
                                  item?.total_time.toUpperCase() !== 'H' &&
                                  item?.total_time.toUpperCase()}
                              </p>
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loading />}
    </>
  );
};

export default Home;
