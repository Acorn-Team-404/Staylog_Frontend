import React, { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api';
import type { LoginRequest } from '../types';
import { MessageUtil } from '../../../global/utils/messageUtil';
import { ErrorCode } from '../../../global/constants/ResponseCode';
import { VALIDATION_MESSAGES } from '../../../global/constants/messages';
import type { ErrorResponse } from '../../../global/types/api';
import './LoginForm.css';
import { useDispatch } from 'react-redux';
import type { UserInfo } from '../../../global/store/types';

interface LoginFormProps {
  onClose?: () => void; // 모달에서 사용시 로그인 성공 후 콜백
}

function LoginForm({ onClose }: LoginFormProps = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isModal = location.pathname !== '/login'; // 모달인지 페이지인지 확인
  const [formData, setFormData] = useState<LoginRequest>({
    loginId: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // 입력값 검증
  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.loginId) {
      newErrors.loginId = VALIDATION_MESSAGES.LOGIN_ID_REQUIRED;
    }

    if (!formData.password) {
      newErrors.password = VALIDATION_MESSAGES.PASSWORD_REQUIRED;
    } else if (formData.password.length < 4) {
      newErrors.password = '비밀번호는 최소 4자 이상이어야 합니다.'; // TODO: 백엔드 정책에 맞게 수정 필요
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name as keyof LoginRequest]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  // 로그인 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // 백엔드 로그인 API 호출
      const loginResponse = await login(formData);
      
      // API 응답에서 토큰과 유저 정보 추출
      console.log(loginResponse)
        
      const fullToken = `${loginResponse.tokenType} ${loginResponse.accessToken}`;
      const user: UserInfo = loginResponse.user;


      // Access Token 저장
      localStorage.setItem('token', `${loginResponse.tokenType} ${loginResponse.accessToken}`);

 
      // Redux Store에 저장 (앱 전역 상태 관리를 위해)
      dispatch({ type: 'SET_TOKEN', payload: fullToken });
      dispatch({ type: 'USER_INFO', payload: user });

      // RefreshToken은 HttpOnly 쿠키로 자동 관리됨

      // 로그인 성공 처리
      if (onClose) {
        onClose(); // 모달인 경우 콜백 실행
      } else {
        navigate('/'); // 페이지인 경우 홈으로 이동
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);

      // 에러 메시지 처리 (중앙집중식 코드 관리 사용)
      if (error.response?.data) {
        const errorData = error.response.data as ErrorResponse;

        // 백엔드에서 ErrorCode를 반환한 경우
        if (errorData.code) {
          setApiError(MessageUtil.getMessageFromResponse(errorData));
        } else if (errorData.message) {
          // ErrorCode 없이 메시지만 있는 경우
          setApiError(errorData.message);
        } else {
          // 응답 데이터는 있지만 형식이 맞지 않는 경우
          setApiError(MessageUtil.getMessageFromHttpStatus(error.response.status));
        }
      } else if (error.response?.status) {
        // HTTP 상태 코드만 있는 경우
        setApiError(MessageUtil.getMessageFromHttpStatus(error.response.status));
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러)
        setApiError('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 기타 에러
        setApiError(MessageUtil.getErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? 'login-form-modal' : 'login-form-page'}>
      <div className="login-form-container">
        {/* 제목 섹션 */}
        <div className="login-header">
          <h1 className="login-title">LOGIN</h1>
          <p className="login-subtitle">로그인</p>
          <div className="login-divider"></div>
        </div>

        {/* 에러 메시지 */}
        {apiError && (
          <div className="login-error">
            {apiError}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* 아이디 입력 */}
          <div className="form-group">
            <input
              type="text"
              className={`form-input ${errors.loginId ? 'error' : ''}`}
              id="loginId"
              name="loginId"
              placeholder="아이디를 입력하세요"
              value={formData.loginId}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.loginId && (
              <div className="error-message">{errors.loginId}</div>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              id="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {/* 버튼 그룹 */}
          <div className="button-group">
            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? '로그인 중...' : 'LOGIN'}
            </button>

            <button
              type="button"
              className="btn-signup"
              onClick={() => {onClose?.(), navigate('/signup')}}
              disabled={loading}
            >
              신규 회원 가입
            </button>
          </div>

          {/* 비밀번호 찾기 링크 */}
          <div className="forgot-password">
            <a href="#" className="forgot-link">
              비밀번호를 잊어버리셨나요?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;