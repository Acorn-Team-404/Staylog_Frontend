// src/domain/admin/pages/AdminHomeManagement.tsx

import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import ImageManager from '../../../global/components/ImageManager';
import ImageCarousel from '../../../global/components/ImageCarousel'; // 사용자 정의 캐러셀 import
import type { ImageData } from '../../../global/types/image';

const AdminHomeManagement: React.FC = () => {
  const TARGET_TYPE = "HOME";
  const TARGET_ID = 1;

  const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태

  // ImageManager의 저장을 외부에서 트리거하기 위한 상태
  const [uploadTrigger, setUploadTrigger] = useState(0);
  
  // 캐러셀을 다시 렌더링하기 위한 key 상태
  const [carouselKey, setCarouselKey] = useState(Date.now());

  const handleSaveClick = () => {
    setUploadTrigger(prev => prev + 1);
  };

  const handleUploadComplete = (uploadedImages: ImageData[]) => {
    alert("홈 화면 이미지가 성공적으로 업데이트되었습니다.");
    setIsEditing(false); // 조회 모드로 전환
    setCarouselKey(Date.now()); // 캐러셀 컴포넌트의 key를 변경하여 강제로 리렌더링
    setUploadTrigger(0); // 저장 트리거를 다시 0으로 초기화
  };

  const handleUploadError = (error: string) => {
    alert(`이미지 저장에 실패했습니다: ${error}`);
  };

  // 조회 모드 렌더링
  if (!isEditing) {
    return (
      <div className="admin-home-management p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-1">홈 화면 캐러셀 미리보기</h2>
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            이미지 변경
          </Button>
        </div>
        <ImageCarousel
          key={carouselKey} // key를 변경하여 컴포넌트를 새로 마운트하도록 함
          targetType={TARGET_TYPE}
          targetId={TARGET_ID}
          aspectRatio="16:9" // 원하는 비율로 설정
          rounded={true} // 모서리 둥글게
        />
      </div>
    );
  }

  // 편집 모드 렌더링
  return (
    <div className="admin-home-management p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">홈 화면 캐러셀 이미지 관리</h2>
          <p className="text-muted mb-0">
            홈 화면에 표시될 캐러셀 이미지를 관리합니다. (최대 5개)
          </p>
        </div>
        <div>
          <Button variant="secondary" className="me-2" onClick={() => setIsEditing(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSaveClick}>
            저장
          </Button>
        </div>
      </div>
      
      <p className="text-muted mb-4">
        이미지 순서를 변경하거나 새로운 이미지를 추가/삭제한 후에는 반드시 '저장' 버튼을 눌러주세요.
      </p>

      <ImageManager
        targetType={TARGET_TYPE}
        targetId={TARGET_ID}
        isEditMode={true}
        uploadTrigger={uploadTrigger}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        maxImages={5}
      />
    </div>
  );
};

export default AdminHomeManagement;