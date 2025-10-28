/**
 * 메시지 유틸리티
 * 응답 코드에 따른 메시지를 반환합니다.
 * 백엔드의 MessageUtil과 동일한 역할을 수행합니다.
 */

import { SuccessCode, ErrorCode, HTTP_STATUS_TO_ERROR_CODE } from '../constants/ResponseCode';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION_MESSAGES } from '../constants/messages';
import type { ApiResponse, ErrorResponse } from '../types/api';

/**
 * 메시지 유틸리티 클래스
 * 백엔드: com.staylog.staylog.global.common.util.MessageUtil
 */
export class MessageUtil {
  /**
   * 성공 코드에 해당하는 메시지 반환
   */
  static getSuccessMessage(code: SuccessCode): string {
    return SUCCESS_MESSAGES[code] || '요청이 처리되었습니다.';
  }

  /**
   * 에러 코드에 해당하는 메시지 반환
   */
  static getErrorMessage(code: ErrorCode): string {
    return ERROR_MESSAGES[code] || '오류가 발생했습니다.';
  }

  /**
   * 응답 코드(성공/에러)에 해당하는 메시지 반환
   */
  static getMessage(code: SuccessCode | ErrorCode): string {
    const codeStr = String(code);
    // SuccessCode인지 확인 (S로 시작)
    if (codeStr.startsWith('S')) {
      return this.getSuccessMessage(code as SuccessCode);
    }
    // ErrorCode인지 확인 (E로 시작)
    if (codeStr.startsWith('E')) {
      return this.getErrorMessage(code as ErrorCode);
    }
    return '알 수 없는 응답입니다.';
  }

  /**
   * API 응답 객체에서 메시지 추출
   * 백엔드 응답에 message가 포함되어 있으면 그것을 사용하고,
   * 없으면 code에 해당하는 기본 메시지를 반환합니다.
   */
  static getMessageFromResponse(response: ApiResponse): string {
    // 응답에 메시지가 있으면 그것을 우선 사용
    if (response.message) {
      return response.message;
    }
    // 없으면 코드에 매핑된 기본 메시지 사용
    return this.getMessage(response.code);
  }

  /**
   * HTTP 상태 코드로부터 에러 메시지 반환
   * 백엔드 응답이 없거나 네트워크 에러 등의 경우 사용
   */
  static getMessageFromHttpStatus(status: number, defaultMessage?: string): string {
    const errorCode = HTTP_STATUS_TO_ERROR_CODE[status];
    if (errorCode) {
      return this.getErrorMessage(errorCode);
    }
    return defaultMessage || `오류가 발생했습니다. (상태 코드: ${status})`;
  }

  /**
   * 유효성 검증 메시지 반환
   */
  static getValidationMessage(key: keyof typeof VALIDATION_MESSAGES): string {
    return VALIDATION_MESSAGES[key];
  }

  /**
   * 에러 응답에서 유효성 검증 에러 메시지 추출
   * 여러 필드의 에러가 있을 경우 첫 번째 에러 메시지를 반환
   */
  static getValidationErrorMessage(errorResponse: ErrorResponse): string | null {
    if (!errorResponse.errors || Object.keys(errorResponse.errors).length === 0) {
      return null;
    }

    // 첫 번째 필드의 에러 메시지 반환
    const firstField = Object.keys(errorResponse.errors)[0];
    return errorResponse.errors[firstField];
  }

  /**
   * 에러 응답에서 모든 유효성 검증 에러 메시지 추출
   */
  static getAllValidationErrorMessages(errorResponse: ErrorResponse): string[] {
    if (!errorResponse.errors) {
      return [];
    }
    // Object.values 대신 Object.keys를 사용하여 호환성 확보
    return Object.keys(errorResponse.errors).map(key => errorResponse.errors![key]);
  }

  /**
   * 특정 필드의 유효성 검증 에러 메시지 추출
   */
  static getFieldErrorMessage(errorResponse: ErrorResponse, fieldName: string): string | null {
    return errorResponse.errors?.[fieldName] || null;
  }
}

/**
 * 간편 사용을 위한 함수들
 */

/**
 * 성공 메시지 반환 
 */
export function getSuccessMessage(code: SuccessCode): string {
  return MessageUtil.getSuccessMessage(code);
}

/**
 * 에러 메시지 반환 
 */
export function getErrorMessage(code: ErrorCode): string {
  return MessageUtil.getErrorMessage(code);
}

/**
 * 응답 코드에 따른 메시지 반환 
 */
export function getMessage(code: SuccessCode | ErrorCode): string {
  return MessageUtil.getMessage(code);
}

/**
 * API 응답에서 메시지 추출 
 */
export function getMessageFromResponse(response: ApiResponse): string {
  return MessageUtil.getMessageFromResponse(response);
}

/**
 * HTTP 상태 코드에서 메시지 추출 
 */
export function getMessageFromHttpStatus(status: number, defaultMessage?: string): string {
  return MessageUtil.getMessageFromHttpStatus(status, defaultMessage);
}
