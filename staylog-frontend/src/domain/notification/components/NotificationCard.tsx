import { Card, Image } from "react-bootstrap";

function NotificationCard() {
  return (
    <>
      <Card
        style={{ width: '90%' }}
        className="mx-auto position-relative bg-secondary-subtle border-0 rounded-3"
      >
        {/* 알림 점 (Red Dot) */}
        <span
          className="position-absolute"
          style={{
            top: '12px',
            right: '12px',
            width: '10px',
            height: '10px',
            backgroundColor: '#fd5353',
            borderRadius: '50%',
          }}
        />

        {/* Card.Body */}
        <Card.Body className="d-flex align-items-center p-3">
          {/* 1. 이미지 */}
          <Image
            src="https://picsum.photos/id/237/100/100" // 표시용 이미지
            style={{
              width: '85px',
              height: '85px',
              objectFit: 'cover',
            }}
            className="rounded-3"
          />

          <div className="flex-grow-1">
            <Card.Text as="small" className="text-muted mb-1 d-block ms-3">
              2025-08-31
            </Card.Text>

            <div className="d-flex justify-content-between align-items-baseline mb-1">
              <Card.Title as="h6" className="fw-bold mb-0 ms-3">
                브리드호텔 양양
              </Card.Title>
              <Card.Text as="small" className="mb-0 text-secondary">
                Review
              </Card.Text>
            </div>

            <hr className="my-2 border-secondary opacity-50" />

            <div className="d-flex justify-content-between align-items-baseline">
              <Card.Text className="mb-0 fw-medium ms-3 fs-7">
                신규 리뷰
              </Card.Text>
              <Card.Text as="small" className="mb-0 text-muted">
                1분 전
              </Card.Text>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default NotificationCard;