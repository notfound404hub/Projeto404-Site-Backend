import axios from "axios"
import { config } from "dotenv"

const api = axios.create({
    baseURL: "http://localhost:500/api/users"
})

api.interceptors.request.use(config => {
    const token = sessionStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default api