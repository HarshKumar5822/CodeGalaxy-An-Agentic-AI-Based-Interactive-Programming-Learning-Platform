import axios from 'axios';

// Node 17+ and modern browsers sometimes block 'localhost' due to IPv6 routing. 
// Using 127.0.0.1 explicitly forces IPv4 routing and prevents 'Failed to Fetch' CORS errors.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5005/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const token = userInfo?.token;
                if (token && token !== 'null' && token !== 'undefined') {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (e) {
            console.warn('Failed to parse userInfo for Authorization header:', e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle expired or rejected tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const msg = (error.response?.data?.message || '').toLowerCase();
            if (msg.includes('token failed') || msg.includes('user not found') || msg.includes('not authorized')) {
                console.warn('[API] Auth token rejected by backend. Clearing stale credentials.');
                try {
                    const userInfoStr = localStorage.getItem('userInfo');
                    if (userInfoStr) {
                        const userInfo = JSON.parse(userInfoStr);
                        delete userInfo.token;
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    }
                } catch (e) {
                    localStorage.removeItem('userInfo');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;

