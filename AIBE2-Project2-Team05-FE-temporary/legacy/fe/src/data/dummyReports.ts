// src/data/dummyReports.ts

// 신고 처리 상태 타입을 정의합니다.
export type ReportStatus = '접수 완료' | '처리 중' | '처리 완료';

// 신고 이력 데이터의 타입을 정의합니다.
export interface Report {
  id: number;
  target: string; // 신고 대상 (사용자명 또는 게시물)
  type: string; // 신고 유형
  date: string; // 신고 날짜
  status: ReportStatus; // 처리 상태
  details?: string; // 상세 내용을 위한 선택적 속성 추가
}

// 신고 이력 더미 데이터 배열입니다.
export const dummyReports: Report[] = [
  {
    id: 1,
    target: '사용자: 악플러123',
    type: '혐오 발언',
    date: '2023-10-25',
    status: '처리 완료',
  },
  {
    id: 2,
    target: '게시물: "제주도 같이 갈 사람 구해요"',
    type: '스팸',
    date: '2023-11-02',
    status: '처리 중',
  },
  {
    id: 3,
    target: '사용자: 사기꾼A',
    type: '사기',
    date: '2023-11-10',
    status: '접수 완료',
  },
]; 