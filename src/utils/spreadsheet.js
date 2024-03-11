import axios from "axios";
import {
  SHEET_ID,
  API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SHEET_REQUEST_OFF,
  REQUEST_STATUS,
} from "../constants";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { convertArrayList, convertArraySplitDayList } from "./convertArray";

export const readData = async (sheetName) => {
  return axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`
  );
};

export const writeSheet = async (month, position, value, accessToken) => {
  const range = `${month}!${position}`; // specify the sheet name
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  return axios.put(
    apiUrl,
    { values: [[value]], majorDimension: "ROWS" },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        valueInputOption: "RAW",
      },
    }
  );
};

export const checkTokenInvalid = async (accessToken) => {
  return axios.get(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
  );
};

export const tableToJson = (table) => {
  const headers = table[0];
  const jsonData = [];

  for (let i = 1; i < table.length; i++) {
    const rowData = {};
    for (let j = 0; j < headers.length; j++) {
      let value = table[i][j];
      if (typeof value === "string") {
        if (value.trim().toUpperCase() == "TRUE") {
          value = true;
        } else if (value.trim().toUpperCase() == "FALSE") {
          value = false;
        }
      }
      rowData[headers[j]] = value;
    }
    jsonData.push(rowData);
  }
  return jsonData;
};

export const refreshToken = async (refreshToken) => {
  const apiUrl = `https://oauth2.googleapis.com/token`;
  let data = {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };
  return axios.post(apiUrl, data);
};

// index starts from 0
export const getColumnLetter = (index) => {
  let columnLetter = "";
  while (index >= 0) {
    let remainder = index % 26;
    columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
    index = Math.floor(index / 26) - 1;
  }
  return columnLetter;
};

export const wirteRequest = (requests, accessToken) => {
  const range = SHEET_REQUEST_OFF; // specify the sheet name
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?key=${API_KEY}`;
  const rowsToAdd = requests.map((item) => ({
    values: [
      item.id,
      item.email,
      item.date,
      item.type.toString(),
      item.reason,
      item.status,
      item.is_read_admin,
      item.is_read,
      item.is_paid_leave
    ],
  }));
  return axios.post(
    apiUrl,
    { values: rowsToAdd.map((row) => row.values) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
      },
    }
  );
};

export const updateStatusRequest = (position, status, accessToken) => {
  const range = `${SHEET_REQUEST_OFF}!${position}`; // specify the sheet name
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  return axios.put(
    apiUrl,
    { values: [[status]], majorDimension: "ROWS" },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        valueInputOption: "RAW",
      },
    }
  );
};

export const writeDataToMultipleSheets = (accessToken, dataRange) => {
  const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate?key=${API_KEY}`;

  return axios.post(
    sheetsApiUrl,
    {
      valueInputOption: 'RAW',
      data: dataRange.map((item) => ({
        range: item.range,
        values: item.values,
      })),
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const updateData = (callbacks, data, update) => {
  const decodedToken = jwtDecode(data.id_token);
  let currentTime = new Date();
  if (currentTime < decodedToken.exp * 1000) {
    callbacks.onSuccess()
    console.log("write no refresh token");
  } else {
    if (data.refresh_token) {
      console.log("write with refresh token");
      refreshToken(data.refresh_token)
        .then((response) => {
          console.log("refresh token success");
          let newToken = response.data.access_token;
          let newIdToken = response.data.id_token;
          update({ ...data, newToken, newIdToken })
          callbacks.onSuccess(newToken)
        })
        .catch((error) => {
          console.log('refresh token fail');
          console.log(error);
          callbacks.onFail()
        });
    } else {
      callbacks.onFail()
    }
  }};

export const getCellNameTotalTime = (email, dateTime, listUser) => {
  const startIndex = 7;
  let userIndex = listUser.findIndex((item) => item.email == email);
  const date = moment(dateTime, "DD-MM-YYYY");
  if (userIndex == -1 || !date.isValid()) return null;
  let startDate = null;
  if (date.date() > 25) {
    startDate = date.clone().date(26);
  } else {
    startDate = date.clone().add(-1, "months").date(26);
  }
  const month = startDate.month() + 2 > 12 ? 1 : startDate.month() + 2;
  const diffDays = date.diff(startDate, "days");
  const columnName = getColumnLetter(diffDays + 2);
  const rowIndex = startIndex + userIndex;
  const position = `${columnName}${rowIndex}`;
  const range = `${month}!${position}`;
  return range;
};

export const groupRequestByEmail = (requests) => {
  const groupedData = {};
  requests.forEach((item) => {
    if (!groupedData[item.email]) {
      groupedData[item.email] = [item];
    } else {
      groupedData[item.email].push(item);
    }
  });

  return Object.values(groupedData);
};

export const getRangeRequests = (requests, email, listApprove, listUserInfo) => {
  const arrayList = convertArrayList(requests);
  const arraySplitDayList = convertArraySplitDayList(arrayList);
  const arrayRequestConverted = arraySplitDayList.filter((item) => {
    const date = moment(item.date, "DD/MM/YYYY");
    return date.day() !== 0 && date.day() !== 6;
  });

  const listApproveWithEmail = listApprove.filter(
    (item) => item.email == email && item.type != 2
  );
  const arrayListApprove = convertArrayList(listApproveWithEmail);
  const arraySplitApproveList = convertArraySplitDayList(arrayListApprove);
  const listApproveNoWeekDay = arraySplitApproveList.filter((item) => {
    const date = moment(item.date, "DD/MM/YYYY");
    return date.day() !== 0 && date.day() !== 6;
  });
 

  const listSome = listApproveNoWeekDay.filter((item) =>
    arrayRequestConverted.some((item2) => item2.date === item.date)
  );
  const listAll = arrayRequestConverted.concat(listSome);
  const duplicateDates = findDuplicateDates(listAll);
  const ranges = [];
  duplicateDates.forEach((date) => {
    let range = getCellNameTotalTime(email, date, listUserInfo);
    if (range) ranges.push(range);
  });
  return ranges;
};

export const findDuplicateDates = (listRequest) => {
  const seenDates = {};
  const duplicateDates = [];
  listRequest.forEach((item) => {
    if (seenDates[item.date]) {
      if (!duplicateDates.includes(item.date)) {
        duplicateDates.push(item.date);
      }
    } else {
      seenDates[item.date] = true;
    }
  });

  return duplicateDates;
};