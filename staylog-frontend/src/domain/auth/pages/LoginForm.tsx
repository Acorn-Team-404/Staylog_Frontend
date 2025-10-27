import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api';
import type { LoginRequest } from '../types';
import './LoginForm.css';

interface LoginFormProps {
  onSuccess?: () => void; // 모달에서 사용시 로그인 성공 후 콜백
}

function LoginForm({ onSuccess }: LoginFormProps = {}) {
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
      newErrors.loginId = '아이디를 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 4) {
      newErrors.password = '비밀번호는 최소 4자 이상이어야 합니다.'; //임시로함ㅋ
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
      const response = await login(formData);

      // Access Token 저장
      localStorage.setItem('token', `${response.tokenType} ${response.accessToken}`);

      // 사용자 정보 저장 (백엔드 응답에 포함됨)
      localStorage.setItem('userInfo', JSON.stringify(response.user));

      // RefreshToken은 HttpOnly 쿠키로 자동 관리됨

      // 로그인 성공 처리
      if (onSuccess) {
        onSuccess(); // 모달인 경우 콜백 실행
      } else {
        navigate('/'); // 페이지인 경우 홈으로 이동
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);

      // 에러 메시지 처리
      if (error.response?.status === 401) {
        setApiError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (error.response?.status === 404) {
        setApiError('존재하지 않는 사용자입니다.');
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
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
              onClick={() => navigate('/signup')}
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