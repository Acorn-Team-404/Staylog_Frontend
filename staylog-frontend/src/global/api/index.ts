// src/api/index.ts

import axios from "axios";

// baseURL 값으로 /api 를 기본으로 가지고 있는 axios 객체를 만들어서
const api = axios.create({
    baseURL: "/api",
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // 쿠키 자동 전송/수신
});

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use((config) => {
  // const token = localStorage.token; 과 동일한 동작
    const token = localStorage.getItem('token');
    // 만일 token 이 존재한다면
    if (token) {
      // 요청의 header 에 Authorization 이라는 키값으로 token 을 전달하도록 한다.
      config.headers.Authorization = token;
    }
    return config;
});

//리턴해준다.
export default api;