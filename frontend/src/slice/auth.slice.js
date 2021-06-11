import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: "auth",
    initialState: {},
    reducers: {
        authorize: (state) => {
            console.log("authorized");
        },
        revoke: (state) => {
            console.log("authorized");
        }
    }
})

export const {authorize, revoke} = authSlice.reducer;
export default authSlice.reducer;