

/**
 * 응답으로 받는 순수한 알림데이터(여러개라면 배열)
 * @author 이준혁
 */
export interface responseNotification {
  notiId: number
  userId: number
  notiType: string
  targetId: number
  details: string
  isRead: string
  createdAt: string
}



/**
 * 알림 데이터 가공 함수에 전달할 Props
 * @author 이준혁
 */
export interface NotificationFormatterProps {
  rawItem: responseNotification
  details: any
}



/**
 * NotificaionCard로 전달할 가공된 알림 데이터
 * @author 이준혁
 */
export interface NotificationCardState {
  notiId: number
  imageUrl: string
  date: string
  title: string
  typeName: string
  message: string
  timeAgo: string
  isRead: string
  targetId: number
}

/**
 * 알림 카드에 전달할 Props
 * @author 이준혁
 * @param handleDelete 알림 삭제 handler
 */
export interface NotificationCardProps extends NotificationCardState {
  handleDelete: (notiId: number) => void
}

