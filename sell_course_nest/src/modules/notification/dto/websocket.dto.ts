export interface JoinRoomDto {
  room: string;
}

export interface GetNotificationsDto {
  page?: number;
  limit?: number;
}

export interface MarkNotificationReadDto {
  notificationId: string;
}

export interface UnreadCountResponseDto {
  count: number;
}

export interface JoinedRoomResponseDto {
  room: string;
}

export interface NotificationMarkedResponseDto {
  notificationId: string;
}

export interface ErrorResponseDto {
  message: string;
}