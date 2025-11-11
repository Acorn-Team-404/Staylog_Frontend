import { Card, CloseButton, Image } from "react-bootstrap";
import '../../../global/css/BootstrapCustomCss.css';
import { useState } from "react";
import type { NotificationCardProps } from '../types/NotificationCardType';
import dayjs from "dayjs";
import type { ModalMode } from "../../../global/types";
import { useModal } from "../../../global/hooks/useModal";
import Modal from "../../../global/components/Modal";
import { useNavigate } from "react-router-dom";


/**
 * 알림 카드 컴포넌트
 * @author 이준혁
 * @param imageUrl 이미지 주소
 * @param date 체크인/체크아웃 또는 알림 생성일
 * @param title 숙소명 or 작성자 등
 * @param typeName 알림의 종류
 * @param message 알림 내용
 * @param timeAgo 알림 생성일로부터 얼마나 지났는지
 * @param isRead 알림 읽음 여부
 */
function NotificationCard({ notiId, targetId, details, isRead, createdAt, handleDelete, handleReadOne, onClose }: NotificationCardProps) {

  const navigate = useNavigate();

  // 알림 카드에 마우스가 올라갔는지 여부 (delete 버튼을 활성화시킬 용도)
  const [mouseOver, setMouseOver] = useState(false);


  // mouseOver 상태값 변경 함수
  function handleMouseEnter() {
    setMouseOver(true)
  }

  // mouseOver 상태값 변경 함수
  function handleMouseReave() {
    setMouseOver(false)
  }

  // 모달 커스텀훅 사용
      const {isModalOpen, modalMode, openModal, closeModal} = useModal<ModalMode>('none')

function onNavigate() {
    switch (details.typeName) {
      case "Coupon": // 쿠폰 발급 알림
        openModal('coupon')
        break;

      case "Reservation":
        navigate(`/mypage/reservations`)
        onClose()
        break;
        
      case "Refund":
        navigate(`/mypage/reservations`)
        onClose()
        break;
        
      case "Review": // 리뷰글 작성 알림
        navigate(`/board/${targetId}`)
        onClose()
        break;
        
      case "Comment": // 댓글 작성 알림
        navigate(`/board/${targetId}`)
        onClose()
        break;
        
      case "Signup": // 회원가입 알림
        navigate(`/mypage/member`)
        onClose()
        break;

      default:
        // 예외 케이스 처리 (정의되지 않은 type)
        console.warn(`Unhandled notification type: ${details.typeName}`);
        break;
    }
  }




  return (
    <>
      <Card onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseReave} style={{ width: '90%', borderRadius: '10px 45px 10px 10px', backgroundColor: '#ebebebe8' }} className="mx-auto position-relative border-0 shadow-sm cursor-pointer mb-4">
        {isRead &&
          <span className="position-absolute" style={{ top: '2px', right: '2px', width: '10px', height: '10px', backgroundColor: '#ee6f6fff', borderRadius: '50%', opacity: (!mouseOver && isRead == 'N') ? 1 : 0, transition: 'opacity 0.2s ease-in-out', pointerEvents: 'none' }} />
        }
        <CloseButton className="notification-close-btn" onClick={() => handleDelete(notiId)} aria-label="알림 닫기" style={{ position: 'absolute', top: '1px', right: '1px', fontSize: '0.6rem', opacity: mouseOver ? 1 : 0, pointerEvents: mouseOver ? 'auto' : 'none' }} />

        <Card.Body  onClick={() => {handleReadOne(notiId), onNavigate()}} className="d-flex align-items-center p-3">
          <Image src={details.imageUrl} style={{ width: '85px', height: '85px', objectFit: 'cover', }} className="rounded-3" />
          <div className="flex-grow-1">
            <Card.Text as="small" className="text-muted mb-1 d-block ms-3 fs-8">{details.date}</Card.Text>
            <div className="d-flex justify-content-between align-items-baseline mb-1">
              <Card.Title as="h6" style={{ color: 'rgba(54, 54, 54, 1)' }} className="fw-bold mb-0 ms-3">{details.title}</Card.Title>
              <Card.Text as="small" className="mb-0 text-secondary fs-9">{details.typeName}</Card.Text>
            </div>

            <hr className="my-2 border-secondary opacity-50" />

            <div className="d-flex justify-content-between align-items-baseline">
              <Card.Text className="mb-0 fw-medium ms-3 fs-8 text-semiblack">{details.message}</Card.Text>
              <Card.Text as="small" className="mb-0 text-muted fs-10">{dayjs(createdAt).fromNow()}</Card.Text>
            </div>
          </div>
        </Card.Body>
      </Card>

        {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} />
        }

    </>
  );
}

export default NotificationCard;