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
      rowData[headers[j]] = table[i][j];
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
    values: [item.id, item.email, item.date, item.type.toString(), item.reason, REQUEST_STATUS.PENDING],
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
  }
};