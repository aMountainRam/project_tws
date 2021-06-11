import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

const get = async (endpoint, extra) =>
    fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
        headers: { ...extra },
    });
const post = async (endpoint, data, headers = {}, extra = {}) =>
    fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(data),
        ...extra
    });
// const post = async (endpoint, data, extra) =>
//     fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`, {
//         method: "POST",
//         credentials: "include",
//         preFlight: false,
//         headers: {
//             "Content-Type": "application/json",
//             ...extra,
//         },
//         body: JSON.stringify(data),
//     });

/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default { get, post };
