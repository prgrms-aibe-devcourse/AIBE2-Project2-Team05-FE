// 피드 여행 상태 관리 서비스
import {
  TravelStatus,
  FeedWithTravelStatus,
  TravelStatusHistory,
} from '../types/feed';

class FeedStatusService {
  private statusStorageKey = 'feedTravelStatuses';
  private historyStorageKey = 'feedStatusHistory';

  /**
   * 피드의 여행 상태 업데이트
   */
  updateFeedStatus(
    feedId: number,
    newStatus: TravelStatus,
    note?: string,
  ): boolean {
    try {
      console.log(`🔄 피드 ${feedId} 상태 변경: ${newStatus}`);

      // 1. 기존 상태 데이터 가져오기
      const feedStatuses = this.getAllFeedStatuses();

      // 2. 새로운 상태로 업데이트
      feedStatuses[feedId] = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(note && { note }),
      };

      // 3. localStorage에 저장
      localStorage.setItem(this.statusStorageKey, JSON.stringify(feedStatuses));

      // 4. 히스토리에 기록
      this.addStatusHistory(feedId, newStatus, note);

      // 5. myFeeds에서도 업데이트 (실제 피드 데이터에 반영)
      this.updateMyFeedStatus(feedId, newStatus);

      console.log(`✅ 피드 ${feedId} 상태 변경 완료: ${newStatus}`);
      return true;
    } catch (error) {
      console.error('피드 상태 업데이트 실패:', error);
      return false;
    }
  }

  /**
   * 피드의 현재 여행 상태 가져오기
   */
  getFeedStatus(feedId: number): TravelStatus {
    try {
      const feedStatuses = this.getAllFeedStatuses();
      const statusData = feedStatuses[feedId];

      if (statusData) {
        return statusData.status;
      }

      // 기본 상태는 모집중
      return 'recruiting';
    } catch (error) {
      console.warn('피드 상태 조회 실패:', error);
      return 'recruiting';
    }
  }

  /**
   * 모든 피드 상태 데이터 가져오기
   */
  getAllFeedStatuses(): Record<
    number,
    { status: TravelStatus; updatedAt: string; note?: string }
  > {
    try {
      const statusesStr = localStorage.getItem(this.statusStorageKey);
      return statusesStr ? JSON.parse(statusesStr) : {};
    } catch (error) {
      console.warn('피드 상태 데이터 로드 실패:', error);
      return {};
    }
  }

  /**
   * 상태 변경 히스토리에 기록
   */
  private addStatusHistory(
    feedId: number,
    status: TravelStatus,
    note?: string,
  ): void {
    try {
      const historyStr = localStorage.getItem(this.historyStorageKey);
      const history: TravelStatusHistory[] = historyStr
        ? JSON.parse(historyStr)
        : [];

      history.push({
        feedId,
        status,
        updatedAt: new Date().toISOString(),
        ...(note && { note }),
      });

      localStorage.setItem(this.historyStorageKey, JSON.stringify(history));
    } catch (error) {
      console.warn('상태 히스토리 저장 실패:', error);
    }
  }

  /**
   * myFeeds의 실제 피드 데이터에 상태 업데이트 반영
   */
  private updateMyFeedStatus(feedId: number, newStatus: TravelStatus): void {
    try {
      const myFeedsStr = localStorage.getItem('myFeeds');
      if (myFeedsStr) {
        const myFeeds = JSON.parse(myFeedsStr);
        const feedIndex = myFeeds.findIndex((feed: any) => feed.id === feedId);

        if (feedIndex !== -1) {
          myFeeds[feedIndex].travelStatus = newStatus;
          myFeeds[feedIndex].statusUpdatedAt = new Date().toISOString();

          // 완료 상태일 때 완료 날짜 기록
          if (newStatus === 'completed') {
            myFeeds[feedIndex].completedDate = new Date().toISOString();
          }

          localStorage.setItem('myFeeds', JSON.stringify(myFeeds));
          console.log(`✅ myFeeds에서 피드 ${feedId} 상태 업데이트 완료`);
        }
      }
    } catch (error) {
      console.warn('myFeeds 상태 업데이트 실패:', error);
    }
  }

  /**
   * 피드에 여행 상태 정보 추가
   */
  enrichFeedWithStatus(feed: any): FeedWithTravelStatus {
    console.log(`🔍 피드 ${feed.id} 상태 추가 중...`);

    const travelStatus = this.getFeedStatus(feed.id);
    console.log(`📋 피드 ${feed.id} 상태: ${travelStatus}`);

    // ✅ 올바른 상태 값인지 확인
    const validStatuses: TravelStatus[] = [
      'recruiting',
      'traveling',
      'completed',
    ];
    const finalStatus = validStatuses.includes(travelStatus)
      ? travelStatus
      : 'recruiting';

    if (travelStatus !== finalStatus) {
      console.warn(
        `⚠️ 피드 ${feed.id} 잘못된 상태 ${travelStatus} → ${finalStatus}로 수정`,
      );
    }

    const enrichedFeed = {
      ...feed,
      travelStatus: finalStatus,
      reviewWritten: this.hasReviewWritten(feed.id),
      statusUpdatedAt: new Date().toISOString(), // 상태 업데이트 시간 추가
    };

    console.log(`✅ 피드 ${feed.id} 상태 추가 완료:`, {
      id: enrichedFeed.id,
      travelStatus: enrichedFeed.travelStatus,
      travelType: enrichedFeed.travelType,
    });

    return enrichedFeed;
  }

  /**
   * 여러 피드에 상태 정보 추가
   */
  enrichFeedsWithStatus(feeds: any[]): FeedWithTravelStatus[] {
    return feeds.map((feed) => this.enrichFeedWithStatus(feed));
  }

  /**
   * 상태별 피드 필터링
   */
  filterFeedsByStatus(
    feeds: FeedWithTravelStatus[],
    status?: TravelStatus,
  ): FeedWithTravelStatus[] {
    if (!status) return feeds;
    return feeds.filter((feed) => feed.travelStatus === status);
  }

  /**
   * 후기 작성 완료 표시
   */
  markReviewCompleted(feedId: number): void {
    try {
      const reviewsStr = localStorage.getItem('feedReviews');
      const reviews = reviewsStr ? JSON.parse(reviewsStr) : {};

      reviews[feedId] = {
        completed: true,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem('feedReviews', JSON.stringify(reviews));
      console.log(`✅ 피드 ${feedId} 후기 작성 완료 표시`);
    } catch (error) {
      console.warn('후기 완료 표시 실패:', error);
    }
  }

  /**
   * 후기 작성 여부 확인
   */
  hasReviewWritten(feedId: number): boolean {
    try {
      const reviewsStr = localStorage.getItem('feedReviews');
      if (reviewsStr) {
        const reviews = JSON.parse(reviewsStr);
        return reviews[feedId]?.completed || false;
      }
      return false;
    } catch (error) {
      console.warn('후기 작성 여부 확인 실패:', error);
      return false;
    }
  }

  /**
   * 날짜 기반 자동 상태 업데이트
   */
  autoUpdateStatusByDate(feed: FeedWithTravelStatus): TravelStatus {
    if (!feed.startDate || !feed.endDate) {
      return feed.travelStatus;
    }

    const now = new Date();
    const startDate = new Date(feed.startDate);
    const endDate = new Date(feed.endDate);

    if (now < startDate) {
      return 'recruiting';
    } else if (now >= startDate && now <= endDate) {
      return 'traveling';
    } else {
      return 'completed';
    }
  }
}

// 싱글톤 인스턴스 생성
const feedStatusService = new FeedStatusService();

export default feedStatusService;
export { FeedStatusService };
