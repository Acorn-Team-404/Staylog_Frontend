import dayjs from "dayjs";
import type { NotificationCardState, NotificationFormatterProps } from "../types/NotificationCardType";


/**
 * response로 받은 데이터를 바탕으로 알림 카드에서 사용할 수 있는 데이터로 가공하는 함수
 * @author 이준혁
 * @param rawItem 테이블의 기본 컬럼 데이터셋
 * @param details JSON 형식으로 정의된 데이터
 * @returns 알림카드에서 바로 사용할 수 있도록 가공된 알림 데이터
 */
function notificationFormatter({ rawItem, details }: NotificationFormatterProps): NotificationCardState {

   switch (rawItem.notiType) {

      // 예약 확정
      case "NOTI_RES_CONFIRM":
         return {
            notiId: rawItem.notiId,
            imageUrl: "https://picsum.photos/id/237/200/300",
            date: details.checkIn + " ~ " + details.checkOut,
            title: details.accommodationName,
            message: details.message,
            typeName: details.typeName,
            timeAgo: dayjs(rawItem.createdAt).fromNow(),
            isRead: rawItem.isRead,
            targetId: rawItem.targetId
         };


      // 예약 취소
      case "NOTI_RES_CANCEL":
         return {
            notiId: rawItem.notiId,
            imageUrl: "https://picsum.photos/id/237/200/300",
            date: details.checkIn + " ~ " + details.checkOut,
            title: details.accommodationName,
            message: details.message,
            typeName: details.typeName,
            timeAgo: dayjs(rawItem.createdAt).fromNow(),
            isRead: rawItem.isRead,
            targetId: rawItem.targetId
         };


      // 리뷰 작성
      case "NOTI_REVIEW_CREATE":
         return {
            notiId: rawItem.notiId,
            imageUrl: "https://picsum.photos/id/237/200/300",
            date: dayjs(rawItem.createdAt).format("YYYY-MM-DD"),
            title: details.authorName,
            message: details.message,
            typeName: details.typeName,
            timeAgo: dayjs(rawItem.createdAt).fromNow(),
            isRead: rawItem.isRead,
            targetId: rawItem.targetId
         };


      // 댓글 작성
      case "NOTI_COMMENT_CREATE":
         return {
            notiId: rawItem.notiId,
            imageUrl: "https://picsum.photos/id/237/200/300",
            date: dayjs(rawItem.createdAt).format("YYYY-MM-DD"),
            title: details.authorName,
            message: details.message,
            typeName: details.typeName,
            timeAgo: dayjs(rawItem.createdAt).fromNow(),
            isRead: rawItem.isRead,
            targetId: rawItem.targetId
         };


      // 모르는 타입이 들어왔을 때 default로 크래시 방지
      default:
         console.warn(`Unknown notification type: ${rawItem.notiType}`);
         return {
            notiId: rawItem.notiId,
            imageUrl: "https://picsum.photos/id/10/200/300", // 기본/에러 이미지
            date: rawItem.createdAt,
            title: "알 수 없는 알림",
            message: rawItem.details, // 파싱 실패했을 수도 있으니 원본
            typeName: "System",
            timeAgo: rawItem.createdAt,
            isRead: rawItem.isRead,
            targetId: rawItem.targetId
         };
   }

}

export default notificationFormatter;