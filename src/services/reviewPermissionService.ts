import { Feed, FeedStatus } from '../types/feed';

// 권한 체크 결과 인터페이스
export interface ReviewPermissionResult {
  canWrite: boolean;
  reason?: string;
  errorCode?: string;
  suggestions?: string[];
}

// 권한 체크 옵션
export interface ReviewPermissionOptions {
  allowOwnerOnly?: boolean; // 작성자만 허용
  allowParticipantsOnly?: boolean; // 참여자만 허용
  timeLimit?: number; // 후기 작성 시간 제한 (일 단위)
  requireTravelEnd?: boolean; // 여행 완료 상태만 허용
}

// 기본 권한 설정
const DEFAULT_PERMISSION_OPTIONS: ReviewPermissionOptions = {
  allowOwnerOnly: false,
  allowParticipantsOnly: false, // 임시로 false로 변경
  timeLimit: 30, // 30일
  requireTravelEnd: false, // 임시로 false로 변경 (여행중에서도 후기 작성 가능)
};

/**
 * 포괄적인 후기 작성 권한 체크
 */
export const checkReviewPermission = (
  feed: Feed,
  userId: string,
  options: Partial<ReviewPermissionOptions> = {},
): ReviewPermissionResult => {
  const settings = { ...DEFAULT_PERMISSION_OPTIONS, ...options };

  // 디버깅용 로그
  console.log('🔍 후기 작성 권한 체크:', {
    feedId: feed.id,
    feedStatus: feed.status,
    userId: userId,
    feedAuthor: feed.author,
    hasReview: !!feed.review,
    settings,
  });

  // 1. 기본 사용자 ID 체크
  if (!userId || userId.trim() === '') {
    console.log('❌ 권한 체크 실패: NO_USER_ID');
    return {
      canWrite: false,
      reason: '로그인이 필요합니다.',
      errorCode: 'NO_USER_ID',
      suggestions: ['로그인 후 다시 시도해주세요.'],
    };
  }

  // 2. 피드 상태 체크
  if (
    !feed.status ||
    feed.status === 'recruiting' ||
    feed.status === 'matched'
  ) {
    console.log('❌ 권한 체크 실패: TRAVEL_NOT_STARTED');
    return {
      canWrite: false,
      reason: '아직 여행이 시작되지 않았습니다.',
      errorCode: 'TRAVEL_NOT_STARTED',
      suggestions: [
        '여행이 시작된 후 후기를 작성할 수 있습니다.',
        '여행 상태를 "여행중"으로 변경해주세요.',
      ],
    };
  }

  // 3. 여행 완료 상태 필수 체크
  if (settings.requireTravelEnd && feed.status !== 'completed') {
    console.log('❌ 권한 체크 실패: TRAVEL_NOT_COMPLETED');
    return {
      canWrite: false,
      reason: '여행이 완료된 후에만 후기를 작성할 수 있습니다.',
      errorCode: 'TRAVEL_NOT_COMPLETED',
      suggestions: [
        '여행을 완료하신 후 후기를 작성해주세요.',
        '여행 상태를 "여행완료"로 변경해주세요.',
      ],
    };
  }

  // 4. 이미 후기가 작성된 경우
  if (feed.review) {
    console.log('❌ 권한 체크 실패: REVIEW_ALREADY_EXISTS');
    return {
      canWrite: false,
      reason: '이미 후기가 작성되었습니다.',
      errorCode: 'REVIEW_ALREADY_EXISTS',
      suggestions: ['기존 후기를 수정하거나 삭제 후 다시 작성해주세요.'],
    };
  }

  // 5. 작성자 권한 체크
  const isOwner = feed.author === userId;
  if (settings.allowOwnerOnly && !isOwner) {
    console.log('❌ 권한 체크 실패: NOT_OWNER');
    return {
      canWrite: false,
      reason: '여행 계획 작성자만 후기를 작성할 수 있습니다.',
      errorCode: 'NOT_OWNER',
      suggestions: ['여행 계획 작성자에게 요청해주세요.'],
    };
  }

  // 6. 참여자 권한 체크
  const isParticipant = feed.participants?.includes(userId) || false;
  if (settings.allowParticipantsOnly && !isOwner && !isParticipant) {
    console.log('❌ 권한 체크 실패: NOT_PARTICIPANT');
    return {
      canWrite: false,
      reason: '여행에 참여한 사람만 후기를 작성할 수 있습니다.',
      errorCode: 'NOT_PARTICIPANT',
      suggestions: [
        '여행에 참여 신청을 해주세요.',
        '여행 참여자로 추가를 요청해주세요.',
      ],
    };
  }

  // 7. 시간 제한 체크
  if (settings.timeLimit && feed.updatedAt) {
    const lastUpdate = new Date(feed.updatedAt);
    const now = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysPassed > settings.timeLimit) {
      console.log('❌ 권한 체크 실패: TIME_LIMIT_EXCEEDED');
      return {
        canWrite: false,
        reason: `후기 작성 기간이 만료되었습니다. (${settings.timeLimit}일 이내)`,
        errorCode: 'TIME_LIMIT_EXCEEDED',
        suggestions: [
          '관리자에게 문의하여 후기 작성 기간 연장을 요청해주세요.',
        ],
      };
    }
  }

  // 모든 체크 통과
  console.log('✅ 후기 작성 권한 통과');
  return {
    canWrite: true,
    reason: '후기 작성이 가능합니다.',
  };
};

/**
 * 간단한 후기 작성 권한 체크 (기존 호환성)
 */
export const hasReviewPermission = (feed: Feed, userId: string): boolean => {
  const result = checkReviewPermission(feed, userId);
  return result.canWrite;
};

/**
 * 권한 체크 결과에 따른 사용자 메시지 생성
 */
export const getPermissionMessage = (
  result: ReviewPermissionResult,
): string => {
  if (result.canWrite) {
    return '후기를 작성할 수 있습니다. ✍️';
  }

  let message = `❌ ${result.reason}`;

  if (result.suggestions && result.suggestions.length > 0) {
    message += '\n\n💡 해결 방법:';
    result.suggestions.forEach((suggestion, index) => {
      message += `\n${index + 1}. ${suggestion}`;
    });
  }

  return message;
};

/**
 * 권한별 UI 상태 결정
 */
export const getReviewButtonState = (
  feed: Feed,
  userId: string,
): {
  show: boolean;
  enabled: boolean;
  text: string;
  tooltip?: string;
} => {
  const result = checkReviewPermission(feed, userId);

  if (!result.canWrite) {
    // 기본적으로 권한이 없으면 버튼 숨김
    if (
      result.errorCode === 'NOT_PARTICIPANT' ||
      result.errorCode === 'NOT_OWNER'
    ) {
      return {
        show: false,
        enabled: false,
        text: '후기 작성',
        tooltip: result.reason,
      };
    }

    // 조건부로 비활성화된 버튼 표시
    return {
      show: true,
      enabled: false,
      text: '후기 작성',
      tooltip: result.reason,
    };
  }

  return {
    show: true,
    enabled: true,
    text: '✍️ 후기 작성',
    tooltip: '여행 후기를 작성해보세요!',
  };
};

/**
 * 참여자 추가 권한 체크
 */
export const canAddParticipant = (
  feed: Feed,
  userId: string,
  targetUserId: string,
): boolean => {
  // 작성자만 참여자 추가 가능
  if (feed.author !== userId) return false;

  // 모집중이거나 매칭완료 상태에서만 가능
  if (feed.status !== 'recruiting' && feed.status !== 'matched') return false;

  // 이미 참여자인 경우 불가
  if (feed.participants?.includes(targetUserId)) return false;

  // 최대 참여자 수 체크
  if (
    feed.maxParticipants &&
    feed.participants &&
    feed.participants.length >= feed.maxParticipants
  )
    return false;

  return true;
};

/**
 * 참여자 제거 권한 체크
 */
export const canRemoveParticipant = (
  feed: Feed,
  userId: string,
  targetUserId: string,
): boolean => {
  // 작성자이거나 본인인 경우 가능
  const isOwner = feed.author === userId;
  const isSelf = userId === targetUserId;

  if (!isOwner && !isSelf) return false;

  // 여행중이거나 완료된 상태에서는 제거 불가
  if (feed.status === 'traveling' || feed.status === 'completed') return false;

  // 참여자 목록에 있는지 확인
  return feed.participants?.includes(targetUserId) || false;
};

/**
 * 피드 상태 변경 권한 체크
 */
export const canChangeFeedStatus = (
  feed: Feed,
  userId: string,
  newStatus: FeedStatus,
): ReviewPermissionResult => {
  // 기본적으로 작성자만 상태 변경 가능
  if (feed.author !== userId) {
    // 예외: 참여자는 traveling → completed 가능
    if (
      newStatus === 'completed' &&
      feed.status === 'traveling' &&
      feed.participants?.includes(userId)
    ) {
      return { canWrite: true, reason: '여행 완료 처리가 가능합니다.' };
    }

    return {
      canWrite: false,
      reason: '여행 계획 작성자만 상태를 변경할 수 있습니다.',
      errorCode: 'NOT_OWNER',
    };
  }

  return { canWrite: true, reason: '상태 변경이 가능합니다.' };
};
