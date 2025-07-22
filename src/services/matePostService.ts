// 여행 메이트 찾기 자동 포스팅 서비스
interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  budget: string;
  people: string;
  period: string;
  styles: string[];
  styleLabels: string[];
  matchingInfo: {
    preferredGender: string;
    preferredAge: string;
    preferredLanguage: string;
    matchingMemo: string;
  };
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  createdAt: string;
  days: any[];
}

interface MatePost {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  period: string;
  budget: string;
  currentPeople: number;
  maxPeople: number;
  preferences: {
    gender: string;
    age: string;
    language: string;
    memo: string;
  };
  styles: string[];
  image: string;
  likes: number;
  views: number;
  status: string;
  createdAt: string;
  tags: string[];
  planId?: string; // 연결된 여행계획 ID
}

class MatePostService {
  private storageKey = 'matePosts'; // 기존 MatchPage와 호환성 유지

  /**
   * 여행 계획을 여행메이트 찾기 포스트로 변환
   */
  convertPlanToMatePost(plan: TravelPlan): MatePost {
    // 예산에서 숫자만 추출
    const budgetNumber = parseInt(plan.budget.replace(/[^0-9]/g, ''));
    const budgetRange = this.getBudgetRange(budgetNumber);

    // 인원수에서 숫자만 추출
    const peopleNumber = parseInt(plan.people.replace(/[^0-9]/g, ''));

    // 여행 기간 계산
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const daysDiff =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    // 성별 변환
    const genderMap: { [key: string]: string } = {
      male: '남성',
      female: '여성',
      any: '무관',
      '': '무관',
    };

    // 연령대 변환
    const ageMap: { [key: string]: string } = {
      '20s': '20대',
      '30s': '30대',
      '40s': '40대',
      '50s': '50대+',
      '': '무관',
    };

    // 언어 변환
    const languageMap: { [key: string]: string } = {
      korean: '한국어',
      english: '영어',
      any: '무관',
      '': '한국어',
    };

    // 이미지 선택 (목적지 기반)
    const destinationImages: { [key: string]: string } = {
      제주도: 'https://source.unsplash.com/800x600/?jeju,korea',
      부산: 'https://source.unsplash.com/800x600/?busan,korea',
      강릉: 'https://source.unsplash.com/800x600/?gangneung,korea',
      서울: 'https://source.unsplash.com/800x600/?seoul,korea',
      경주: 'https://source.unsplash.com/800x600/?gyeongju,korea',
      여수: 'https://source.unsplash.com/800x600/?yeosu,korea',
    };

    const defaultImage = 'https://source.unsplash.com/800x600/?travel,korea';
    const destinationImage =
      destinationImages[plan.destination] || defaultImage;

    return {
      id: parseInt(plan.id),
      userId: plan.author.id,
      userName: plan.author.name,
      userAvatar: plan.author.profileImage,
      title: `${plan.title} (메이트 모집)`,
      destination: plan.destination,
      startDate: plan.startDate,
      endDate: plan.endDate,
      period: `${daysDiff}일`,
      budget: budgetRange,
      currentPeople: 1, // 작성자 본인
      maxPeople: peopleNumber,
      preferences: {
        gender: genderMap[plan.matchingInfo.preferredGender] || '무관',
        age: ageMap[plan.matchingInfo.preferredAge] || '무관',
        language: languageMap[plan.matchingInfo.preferredLanguage] || '한국어',
        memo:
          plan.matchingInfo.matchingMemo ||
          `${plan.destination} 여행을 함께할 메이트를 찾습니다!`,
      },
      styles: plan.styleLabels || plan.styles || [],
      image: destinationImage,
      likes: 0,
      views: 0,
      status: 'recruiting', // 모집중
      createdAt: plan.createdAt,
      tags: [
        `#${plan.destination}`,
        `#${daysDiff}일`,
        `#${plan.people}`,
        ...plan.styleLabels.map((style) => `#${style}`),
      ],
      planId: plan.id, // 원본 여행계획과 연결
    };
  }

  /**
   * 예산 범위 변환
   */
  private getBudgetRange(budget: number): string {
    if (budget < 10) return '10만원 미만';
    if (budget < 30) return '10-30만원';
    if (budget < 50) return '30-50만원';
    if (budget < 100) return '50-100만원';
    return '100만원 이상';
  }

  /**
   * 여행메이트 포스트를 로컬스토리지에 저장
   */
  saveMatePost(matePost: MatePost): boolean {
    try {
      const existingPosts = this.getMatePostList();

      // 동일한 planId를 가진 포스트가 이미 있는지 확인
      const duplicateIndex = existingPosts.findIndex(
        (post) => post.planId === matePost.planId,
      );

      if (duplicateIndex !== -1) {
        // 기존 포스트 업데이트
        existingPosts[duplicateIndex] = matePost;
        console.log('📝 기존 여행메이트 포스트가 업데이트되었습니다.');
      } else {
        // 새 포스트 추가
        existingPosts.unshift(matePost); // 최신순으로 앞에 추가
        console.log('✅ 새로운 여행메이트 포스트가 등록되었습니다.');
      }

      localStorage.setItem(this.storageKey, JSON.stringify(existingPosts));
      return true;
    } catch (error) {
      console.error('여행메이트 포스트 저장 실패:', error);
      return false;
    }
  }

  /**
   * 로컬스토리지에서 여행메이트 포스트 목록 가져오기
   */
  private getMatePostList(): MatePost[] {
    try {
      const savedPosts = localStorage.getItem(this.storageKey);
      if (savedPosts) {
        return JSON.parse(savedPosts);
      }
      return [];
    } catch (error) {
      console.error('여행메이트 포스트 목록 불러오기 실패:', error);
      return [];
    }
  }

  /**
   * 여행메이트 포스트 목록 가져오기 (외부 접근용)
   */
  getAllMatePosts(): MatePost[] {
    return this.getMatePostList();
  }

  /**
   * 특정 계획 ID로 여행메이트 포스트 삭제
   */
  deleteMatePostByPlanId(planId: string): boolean {
    try {
      const existingPosts = this.getMatePostList();
      const filteredPosts = existingPosts.filter(
        (post) => post.planId !== planId,
      );

      localStorage.setItem(this.storageKey, JSON.stringify(filteredPosts));
      console.log('🗑️ 연결된 여행메이트 포스트가 삭제되었습니다.');
      return true;
    } catch (error) {
      console.error('여행메이트 포스트 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 여행계획이 메이트 찾기에 등록되어 있는지 확인
   */
  isMatePostExists(planId: string): boolean {
    const existingPosts = this.getMatePostList();
    return existingPosts.some((post) => post.planId === planId);
  }

  /**
   * 여행계획을 여행메이트 찾기에 자동 등록
   *
   * @param plan 여행 계획 데이터
   * @param matchingEnabled 메이트 찾기 활성화 여부
   * @returns 성공 여부
   */
  autoRegisterMatePost(plan: TravelPlan, matchingEnabled: boolean): boolean {
    try {
      if (!matchingEnabled) {
        // 메이트 찾기가 비활성화된 경우, 기존 포스트 삭제
        if (this.isMatePostExists(plan.id)) {
          this.deleteMatePostByPlanId(plan.id);
        }
        return true;
      }

      // 메이트 찾기가 활성화된 경우, 포스트 생성/업데이트
      const matePost = this.convertPlanToMatePost(plan);
      return this.saveMatePost(matePost);
    } catch (error) {
      console.error('여행메이트 자동 등록 실패:', error);
      return false;
    }
  }

  /**
   * Mock 여행 계획들을 매칭 포스트로 변환하여 추가
   */
  initializeFromMockPlans(mockPlans: any[]): void {
    console.log('🔄 Mock 여행 계획들을 매칭에 반영 시작...');

    let addedCount = 0;

    mockPlans.forEach((mockPlan) => {
      try {
        // Mock 계획을 TravelPlan 형식으로 변환
        const travelPlan: TravelPlan = {
          id: mockPlan.id,
          title: mockPlan.title,
          startDate: mockPlan.startDate,
          endDate: mockPlan.endDate,
          destination: mockPlan.destination,
          budget: mockPlan.budget,
          people: mockPlan.people,
          period: mockPlan.period,
          styles: mockPlan.styles || [],
          styleLabels: mockPlan.styleLabels || [],
          matchingInfo: mockPlan.matchingInfo || {
            preferredGender: 'any',
            preferredAge: '',
            preferredLanguage: 'korean',
            matchingMemo: '',
          },
          author: mockPlan.author,
          createdAt: new Date().toISOString(),
          days: mockPlan.days || [],
        };

        // 매칭 정보가 있는 경우에만 매칭에 추가
        // matchingInfo가 없는 경우 기본값으로 생성하여 더 많은 데이터 제공
        const matchingInfo = mockPlan.matchingInfo || {
          preferredGender: 'any',
          preferredAge: '20-40',
          preferredLanguage: 'korean',
          matchingMemo: `${mockPlan.destination} 여행을 함께 할 메이트를 찾습니다!`,
        };

        const travelPlanWithMatching: TravelPlan = {
          ...travelPlan,
          matchingInfo: matchingInfo,
        };

        const matePost = this.convertPlanToMatePost(travelPlanWithMatching);

        // 기존에 동일한 계획의 매칭 포스트가 없는 경우에만 추가
        if (!this.isMatePostExists(mockPlan.id)) {
          if (this.saveMatePost(matePost)) {
            addedCount++;
            console.log(
              `✅ Mock 계획 "${mockPlan.title}" 매칭에 추가됨 ${mockPlan.matchingInfo ? '(기존 매칭정보)' : '(기본 매칭정보)'}`,
            );
          }
        }
      } catch (error) {
        console.warn(`⚠️ Mock 계획 "${mockPlan.title}" 매칭 변환 실패:`, error);
      }
    });

    console.log(`🎉 총 ${addedCount}개의 Mock 계획이 매칭에 반영되었습니다.`);
  }

  /**
   * 기존 mock 유저들의 계획을 매칭에 반영 (Profile 데이터 기반)
   */
  initializeFromProfileData(profileFeeds: any[]): void {
    console.log('🔄 프로필 피드들을 매칭에 반영 시작...');

    let addedCount = 0;

    profileFeeds.forEach((feed) => {
      try {
        if (feed.type === 'travel-plan' && feed.travelType && feed.planId) {
          console.log(
            `🔍 프로필 피드 처리 중: ${feed.planId} (${feed.travelType})`,
          );

          // localStorage에서 계획 데이터 가져오기
          const planDataStr = localStorage.getItem(`plan_${feed.planId}`);

          if (planDataStr) {
            const planData = JSON.parse(planDataStr);
            console.log(
              `📋 계획 데이터 로드: ${planData.title || '제목 없음'}`,
              planData,
            );

            // matchingInfo가 있거나 기본 매칭 정보를 생성
            const matchingInfo = planData.matchingInfo || {
              preferredGender: 'any',
              preferredAge: '20-40',
              preferredLanguage: 'korean',
              matchingMemo: `${planData.destination || '여행지'} 여행을 함께 할 메이트를 찾습니다!`,
            };

            // matchingEnabled 체크를 완화 (false로 명시적으로 비활성화된 경우만 제외)
            if (planData.matchingEnabled !== false) {
              console.log(`💫 매칭 활성화 확인됨: ${planData.title}`);

              const travelPlan: TravelPlan = {
                id: feed.planId,
                title:
                  planData.title || feed.caption?.split('\n')[0] || '여행 계획',
                startDate: planData.startDate || '2024-01-01',
                endDate: planData.endDate || '2024-01-03',
                destination: planData.destination || '여행지',
                budget: planData.budget || '50만원',
                people: planData.people || '2명',
                period: planData.period || '2박 3일',
                styles: planData.styles || ['관광'],
                styleLabels: planData.styleLabels || ['관광'],
                matchingInfo: matchingInfo,
                author: {
                  id: feed.author || 'user_default',
                  name: feed.author || '사용자',
                  profileImage: feed.avatar || '👤',
                },
                createdAt: feed.createdAt || new Date().toISOString(),
                days: planData.days || [],
              };

              const matePost = this.convertPlanToMatePost(travelPlan);

              if (!this.isMatePostExists(feed.planId)) {
                if (this.saveMatePost(matePost)) {
                  addedCount++;
                  console.log(
                    `✅ 프로필 계획 "${travelPlan.title}" 매칭에 추가됨 ${planData.matchingInfo ? '(기존 매칭정보)' : '(기본 매칭정보)'}`,
                  );
                }
              } else {
                console.log(`⏭️ 이미 존재하는 매칭 포스트: ${feed.planId}`);
              }
            } else {
              console.log(`⏸️ 매칭 비활성화됨: ${planData.title}`);
            }
          } else {
            console.log(`❌ 계획 데이터 없음: plan_${feed.planId}`);
          }
        } else {
          console.log(
            `⏭️ 여행 계획이 아님: ${feed.type}, planId: ${feed.planId}`,
          );
        }
      } catch (error) {
        console.warn(`⚠️ 프로필 피드 매칭 변환 실패:`, error);
      }
    });

    console.log(`🎉 총 ${addedCount}개의 프로필 계획이 매칭에 반영되었습니다.`);
  }
}

// 싱글톤 인스턴스 생성
const matePostService = new MatePostService();

export default matePostService;
export type { TravelPlan, MatePost };
