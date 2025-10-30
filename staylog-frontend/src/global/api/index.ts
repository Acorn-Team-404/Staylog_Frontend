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


// 응답 인터셉터: 성공 시 data만 반환, 실패 시 Promise.reject
api.interceptors.response.use(
  <T = any>(response: AxiosResponse<ApiResponse<T>>): T | Promise<never> => {
    const { data } = response;

    if (data.success && data.data !== undefined) {
      return data.data;
    }

    return Promise.reject(data);
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * 커스텀 Axios 인스턴스 타입 정의
 * 응답 인터셉터가 ApiResponse<T>의 data 필드를 자동으로 추출하므로,
 * 메서드 반환 타입을 Promise<T>로 정의
 */
interface CustomAxiosInstance {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  request<T = any>(config: any): Promise<T>;
}

// 타입 캐스팅하여 export
export default api as unknown as CustomAxiosInstance;