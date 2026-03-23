import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000",   // your FastAPI URL
})

// This runs before every request — attaches JWT token automatically
// Think of it like a Python middleware/dependency
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")  // grab token from browser storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // same header your FastAPI expects
  }
  return config
})

export default api