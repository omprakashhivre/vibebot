import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://vibebot-fastapi.onrender.com/',
  timeout: 1000 * 60 * 5,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance
