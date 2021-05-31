import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
});

const get = async (endpoint) => instance.get(endpoint);
const post = async (endpoint,data) => fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`,{
    method: "POST",
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
});

/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {get,post};