// src/api/index.ts

import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../types";

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


// ✅ 응답 인터셉터: 공통 구조 통일
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const data = response.data;

    if (data.success) {
      // SuccessResponse<T> 구조니까, 실제 유용한 값은 data.data임
      return data.data;
    }

    // success=false인 경우 (에러 코드 등)
    return Promise.reject(data);
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
//리턴해준다.
export default api;