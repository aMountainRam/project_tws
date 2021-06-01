import React from "react";
import { useCookies } from "react-cookie";
import api from "../service/api.service";
export default function Home() {
    const [accessToken, setAccessToken] = React.useState({});
    const [values, setValues] = React.useState({});
    const handleSubmit = (event) => {
        event.preventDefault();
        api.post("/auth/token/login", values, accessToken)
            .then(async (res) => setAccessToken({authorization: await res.json().then(j => `${j.tokenType} ${j.accessToken}`)}))
            .catch((err) => console.log(err));
    };
    const handleRefresh = (event) => {
        event.preventDefault();
        api.get("/auth/token/refresh", accessToken)
            .then(async (res) => setAccessToken({authorization: await res.json().then(j => `${j.tokenType} ${j.accessToken}`)}))
            .catch((err) => console.log(err));
    };
    const handleLogout = (event) => {
        event.preventDefault();
        api.get("/auth/logout", accessToken)
            .then(() => setAccessToken({}))
            .catch((err) => console.log(err));
    };
    const handleChange = (event, arg) => {
        const v = event.target.value;
        if (v && typeof v === "string") {
            if (v !== "") {
                setValues({ ...values, [arg]: v });
            }
        } else {
            let newValues = { ...values };
            delete newValues[arg];
            setValues(newValues);
        }
    };
    React.useEffect(() => console.log(values), [values]);
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <form onSubmit={handleSubmit}>
                    <input
                        id="username"
                        type="text"
                        onChange={(e) => handleChange(e, "username")}
                        placeholder="Enter username..."
                    />
                    <input
                        id="password"
                        type="password"
                        onChange={(e) => handleChange(e, "password")}
                        placeholder="Enter password..."
                    />
                    <input type="submit" value="Submit" />
                </form>
            </div>
            <button style={{ maxWidth: "150px" }} onClick={handleRefresh}>
                Refresh
            </button>
            <button style={{ maxWidth: "150px" }} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
