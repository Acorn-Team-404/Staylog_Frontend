

/**
 * 응답으로 받는 알림데이터(여러개라면 배열)
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
}

export interface NotificationCardProps extends NotificationCardState {
  handleDelete: (notiId: number) => void
}


export interface NotificationFormatterProps {
  rawItem: responseNotification
  details: any
}