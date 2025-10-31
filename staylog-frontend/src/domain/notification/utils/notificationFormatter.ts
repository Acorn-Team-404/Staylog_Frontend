import type { NotificationCardState, NotificationFormatterProps } from "../types/NotificationCardType";

// 💡 함수 이름은 소문자로 시작하는 게 일반적인 유틸 함수 네이밍입니다.
function notificationFormatter({ rawItem, details }: NotificationFormatterProps): NotificationCardState { // ✅ 반환 타입 명시

   
   // switch(rawItem.notiType) {
      
   //    case "NOTI_RES_CONFIRM":
         

   // }
   


   const processedNoti: NotificationCardState = {
      notiId: rawItem.notiId,
      imageUrl: "https://picsum.photos/id/237/200/300",
      date: rawItem.createdAt,
      title: details.accommodationName,
      message: details.message,
      typeName: details.typeName,
      timeAgo: rawItem.createdAt, // (TODO: 변환 필요)
      isRead: rawItem.isRead
   };

   return processedNoti;
}

export default notificationFormatter;