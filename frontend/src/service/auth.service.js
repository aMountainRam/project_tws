import api from "./api.service.js";
const login = (data) =>
    api.post(
        "/auth/token/login",
        data,
        {},
        {
            credentials: "include",
        }
    );
const refresh = () =>
    api.get(
        "/auth/token/refresh",
        {},
        {
            credentials: "include",
        }
    );

export default { login, refresh };
