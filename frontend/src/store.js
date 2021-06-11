import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/auth.slice.js";

export default configureStore({
    reducer: {
        auth: authReducer
    }
})