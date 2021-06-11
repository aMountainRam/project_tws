import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import ServiceTws from "./servicetws.app.jsx";
import { Provider } from "react-redux";
import store from "./store";

ReactDOM.render(
    <Provider store={store}>
        <ServiceTws />
    </Provider>,
    document.getElementById("root")
);
