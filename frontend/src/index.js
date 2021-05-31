import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import { CookiesProvider } from "react-cookie";
import ServiceTws from "./servicetws.app.jsx";

ReactDOM.render(
    <CookiesProvider>
        <ServiceTws />
    </CookiesProvider>,
    document.getElementById("root")
);
