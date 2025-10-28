# 중앙집중식 코드 관리 시스템

백엔드의 `SuccessCode`, `ErrorCode`, `messages.properties`와 일관성 있는 프론트엔드 코드 관리 시스템입니다.

## 📁 구조

```
src/global/
├── constants/
│   ├── ResponseCode.ts    # 성공/에러 코드 Enum
│   ├── messages.ts         # 코드별 메시지 매핑
│   └── index.ts           # 통합 export
├── types/
│   ├── api.ts             # API 응답 타입 정의
│   └── index.ts
└── utils/
    ├── messageUtil.ts     # 메시지 유틸리티
    └── index.ts
```

## 🚀 사용 방법

### 1. 기본 사용 (성공/에러 메시지)

```typescript
import { MessageUtil, SuccessCode, ErrorCode } from '@/global/constants';

// 성공 메시지
const successMsg = MessageUtil.getSuccessMessage(SuccessCode.LOGIN_SUCCESS);
// "로그인되었습니다."

// 에러 메시지
const errorMsg = MessageUtil.getErrorMessage(ErrorCode.INVALID_CREDENTIALS);
// "아이디 또는 비밀번호가 올바르지 않습니다."
```

### 2. API 응답 처리

```typescript
import { MessageUtil, ErrorCode } from '@/global/constants';
import type { ErrorResponse } from '@/global/types';

try {
  const response = await someApi();
  // 성공 처리
} catch (error: any) {
  if (error.response?.data) {
    const errorData = error.response.data as ErrorResponse;

    // 백엔드 ErrorCode 사용
    if (errorData.code) {
      setErrorMessage(MessageUtil.getMessageFromResponse(errorData));
    }
  } else if (error.response?.status) {
    // HTTP 상태 코드만 있는 경우
    setErrorMessage(MessageUtil.getMessageFromHttpStatus(error.response.status));
  }
}
```

### 3. 유효성 검증 메시지

```typescript
import { VALIDATION_MESSAGES } from '@/global/constants';

// 클라이언트 측 검증
if (!email) {
  setError(VALIDATION_MESSAGES.EMAIL_REQUIRED);
  // "이메일을 입력해주세요."
}

if (password.length < 8) {
  setError(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
  // "비밀번호는 최소 8자 이상이어야 합니다."
}
```

### 4. 백엔드 유효성 검증 에러 처리

```typescript
import { MessageUtil } from '@/global/utils';
import type { ErrorResponse } from '@/global/types';

const errorData = error.response.data as ErrorResponse;

// 첫 번째 에러 메시지 가져오기
const firstError = MessageUtil.getValidationErrorMessage(errorData);

// 특정 필드의 에러 메시지
const emailError = MessageUtil.getFieldErrorMessage(errorData, 'email');

// 모든 에러 메시지 가져오기
const allErrors = MessageUtil.getAllValidationErrorMessages(errorData);
```

## 📋 코드 체계

### SuccessCode (S로 시작)

- **S000~S099**: 일반 성공 코드
- **S100~S199**: Auth 도메인
- **S200~S299**: User 도메인
- **S300~S399**: Accommodation 도메인
- **S400~S499**: Booking 도메인
- **S500~S599**: Payment 도메인
- **S600~S699**: Review 도메인
- **S700~S799**: Journal 도메인
- **S800~S899**: Search 도메인
- **S900~S999**: Notification 도메인

### ErrorCode (E로 시작)

- **E000~E099**: 일반 에러 코드
- **E100~E199**: Auth 도메인
- **E200~E299**: User 도메인
- 이하 동일...

## ✅ 장점

1. **백엔드와 일관성**: 동일한 코드 체계 사용
2. **유지보수 용이**: 메시지 변경 시 한 곳만 수정
3. **타입 안정성**: TypeScript enum으로 오타 방지
4. **확장 가능**: 다국어 지원 등으로 확장 가능
5. **테스트 용이**: 메시지 로직 분리

## 🔧 확장 방법

### 새로운 도메인 코드 추가

1. `ResponseCode.ts`에 코드 추가
2. `messages.ts`에 메시지 추가

```typescript
// ResponseCode.ts
export enum SuccessCode {
  // 기존 코드...
  NEW_DOMAIN_SUCCESS = 'S1000',
}

// messages.ts
export const SUCCESS_MESSAGES = {
  // 기존 메시지...
  [SuccessCode.NEW_DOMAIN_SUCCESS]: '새 도메인 작업이 성공했습니다.',
};
```


## 📝 참고사항

- 백엔드 API가 응답 코드 체계를 사용하지 않는 경우, HTTP 상태 코드로 fallback 처리
- 네트워크 에러 등 예외 상황에 대한 기본 메시지 제공
- 클라이언트 전용 검증 메시지는 `VALIDATION_MESSAGES` 사용
