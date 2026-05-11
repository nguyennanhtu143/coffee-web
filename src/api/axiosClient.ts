import axios, { AxiosInstance } from 'axios';

const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
});

axiosClient.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('isShop');
            window.location.href = '/login';
            return Promise.reject(error);
        }
        const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
        return Promise.reject(new Error(message));
    }
);

export default axiosClient;

// Upload instance - không set Content-Type (browser tự set multipart boundary)
export const axiosUpload: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

axiosUpload.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
});

axiosUpload.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response?.data?.message || error.message || 'Upload thất bại';
        return Promise.reject(new Error(message));
    }
);
