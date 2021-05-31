import React from "react";
import { useCookies } from "react-cookie";
import api from "../service/api.service";
export default function Home() {
    const [values, setValues] = React.useState({});
    const handleSubmit = (event) => {
        event.preventDefault();
        api.post("/auth/login", values)
            .then(() => console.log("here"))
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
    );
}
