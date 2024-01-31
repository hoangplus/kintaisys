// import getConfig from 'next/config';
// const { publicRuntimeConfig } = getConfig();

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
export const SHEET_ID = process.env.SHEET_ID
export const API_KEY = process.env.API_KEY

export const SHEET_REQUEST_OFF = "request_off";
export const SHEET_MEMBER = "members";

export const REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVE: 'approve',
    REJECT: 'reject',
    CANCEL: 'cancel'
}