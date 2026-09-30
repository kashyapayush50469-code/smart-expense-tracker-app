import axios from "axios";

const api = axios.create({
    baseURL: "https://smart-expense-tracker-app-86zq.onrender.com",
});

export default api;