import axios from "axios";

const apiLocalHost = axios.create({
    baseURL: "http://localhost:5000/api",
});

export default apiLocalHost