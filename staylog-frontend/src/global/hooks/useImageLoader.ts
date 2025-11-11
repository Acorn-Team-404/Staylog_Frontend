import { useState, useCallback } from 'react';
import api from '../api'; // API 클라이언트 경로에 맞게 수정

// 백엔드 ImageDto와 유사한 인터페이스 정의 (imageUrl 포함)
export interface ImageResponseDto {
  imageId: number;
  imageType: string;
  targetType: string;
  targetId: string;
  savedName: string;
  originalName: string;
  fileSize: string;
  mimeType: string;
  displayOrder: number;
  uploadDate: string;
  imageUrl: string; // 백엔드에서 추가된 URL 필드
}

interface UseImageLoaderResult {
  images: ImageResponseDto[];
  loading: boolean;
  error: string | null;
  loadImages: (targetType: string, targetId: string) => Promise<void>;
  clearImages: () => void;
}

export const useImageLoader = (): UseImageLoaderResult => {
  const [images, setImages] = useState<ImageResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async (targetType: string, targetId: string) => {
    if (!targetType || !targetId) {
      setError('Target Type과 Target ID를 모두 입력해야 합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]); // 새로운 이미지 로드 전에 기존 이미지 초기화

    try {
      const response = await api.get<ImageResponseDto[]>(`/v1/images/${targetType}/${targetId}`);
      // 백엔드 응답 구조에 따라 data.data 또는 data를 직접 사용할 수 있음
      setImages(response);
    } catch (err: any) {
      console.error('이미지 로드 실패:', err);
      const errorMessage = err.response?.data?.message || '이미지 로드에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
    setLoading(false);
  }, []);

  return { images, loading, error, loadImages, clearImages };
};