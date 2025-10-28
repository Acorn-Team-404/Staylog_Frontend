

// 모달 모드 타입 정의
// (타입이 추가될 때마다 항목 추가해서 사용하면 됩니다.)
export type ModalMode = 'login' | 'search';



// 부모 컴포넌트로 받은 데이터의 타입 설정 (수정 금지)
export interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   mode: ModalMode;
}