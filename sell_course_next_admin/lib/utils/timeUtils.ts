/**
 * Format thời gian thành dạng "x phút trước", "x giờ trước", etc.
 * @param date - Ngày cần format
 * @returns Chuỗi thời gian đã format
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} năm trước`;
  }
}

/**
 * Format ngày thành dạng "dd/mm/yyyy"
 * @param date - Ngày cần format
 * @returns Chuỗi ngày đã format
 */
export function formatDate(date: Date | string): string {
  const targetDate = new Date(date);
  const day = targetDate.getDate().toString().padStart(2, '0');
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const year = targetDate.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format ngày và giờ thành dạng "dd/mm/yyyy HH:mm"
 * @param date - Ngày cần format
 * @returns Chuỗi ngày giờ đã format
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = new Date(date);
  const day = targetDate.getDate().toString().padStart(2, '0');
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const year = targetDate.getFullYear();
  const hours = targetDate.getHours().toString().padStart(2, '0');
  const minutes = targetDate.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}