import axios from "axios";
import { getToken } from "../Services/UserService";

axios.interceptors.request.use(req => {
    const key = getToken();
    const user = localStorage.getItem('user');
    const token = user && key;
    if(token){
        req.headers['access_token'] = token;
    }
    return req;
    },
    error => {
        return Promise.reject(error);
    }
);