import { Card, CloseButton, Image } from "react-bootstrap";
import '../../../global/css/BootstrapCustomCss.css';
import { useState } from "react";
import type { NotificationCardProps } from '../types/NotificationCardType';


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
function NotificationCard({ notiId, imageUrl, date, title, typeName, message, timeAgo, isRead, handleDelete }: NotificationCardProps) {

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




  return (
    <>
      <Card onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseReave} style={{ width: '90%', borderRadius: '10px 45px 10px 10px' }} className="mx-auto position-relative bg-secondary-subtle border-0 shadow-sm cursor-pointer mb-4">

        <span className="position-absolute" style={{ top: '2px', right: '2px', width: '10px', height: '10px', backgroundColor: '#ee6f6fff', borderRadius: '50%', opacity: (!mouseOver && isRead == 'N') ? 1 : 0, transition: 'opacity 0.2s ease-in-out', pointerEvents: 'none' }} />
        <CloseButton onClick={() => handleDelete(notiId)} aria-label="알림 닫기" style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '0.5rem', opacity: mouseOver ? 1 : 0, pointerEvents: mouseOver ? 'auto' : 'none' }} />

        <Card.Body className="d-flex align-items-center p-3">
          <Image src={imageUrl} style={{ width: '85px', height: '85px', objectFit: 'cover', }} className="rounded-3" />
          <div className="flex-grow-1">
            <Card.Text as="small" className="text-muted mb-1 d-block ms-3 fs-8">{date}</Card.Text>
            <div className="d-flex justify-content-between align-items-baseline mb-1">
              <Card.Title as="h6" className="fw-bold mb-0 ms-3 text-semiblack">{title}</Card.Title>
              <Card.Text as="small" className="mb-0 text-secondary fs-9">{typeName}</Card.Text>
            </div>

            <hr className="my-2 border-secondary opacity-50" />

            <div className="d-flex justify-content-between align-items-baseline">
              <Card.Text className="mb-0 fw-medium ms-3 fs-8 text-semiblack">{message}</Card.Text>
              <Card.Text as="small" className="mb-0 text-muted fs-10">{timeAgo}</Card.Text>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default NotificationCard;