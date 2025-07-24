import webSearchService from './webSearchService';
import kakaoMapService from './kakaoMapService';
import type { KakaoPlace, CategorySearchResult } from './kakaoMapService';

// OpenAI API 연동 서비스
class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    // 환경변수에서 API 키를 가져옴 (개발 환경에서는 .env 파일 사용)
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';

    // 디버깅용 로그 (보안상 키의 처음 몇 글자만 표시)
    if (this.apiKey) {
      console.log(
        '🔑 OpenAI API 키 로드됨:',
        this.apiKey.substring(0, 7) + '...',
      );
      if (!this.apiKey.startsWith('sk-')) {
        console.warn('⚠️ OpenAI API 키 형식 오류: sk-로 시작해야 합니다');
      }
    } else {
      console.warn(
        '⚠️ OpenAI API 키가 없습니다. REACT_APP_OPENAI_API_KEY 환경변수를 확인하세요',
      );
    }
  }

  /**
   * 여행 계획을 분석해서 해시태그 5개 추천
   */
  async generateHashtags(travelPlan: {
    title: string;
    destination: string;
    days: any[];
    styles: string[];
  }): Promise<string[]> {
    try {
      if (!this.apiKey) {
        console.warn(
          'OpenAI API 키가 설정되지 않았습니다. 기본 해시태그를 반환합니다.',
        );
        return this.getDefaultHashtags(travelPlan);
      }

      // 여행 계획 정보를 텍스트로 변환
      const planText = this.formatPlanForAnalysis(travelPlan);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `당신은 여행 SNS 해시태그 전문가입니다. 주어진 여행 계획의 목적지와 실제 방문 예정 장소들을 분석해서 구체적이고 매력적인 해시태그 정확히 5개를 추천해주세요.

              분석 방법:
              1. 주요 목적지와 실제 방문 예정 장소들을 파악
              2. 장소의 특성과 매력 포인트 분석
              3. 계획된 활동과 여행 스타일 고려
              4. SNS에서 실제 검색되고 사용되는 키워드 조합

              해시태그 조건:
              - # 기호 포함
              - 한국어로 작성
              - 실제 방문 장소나 지역 기반으로 구체적으로 작성
              - 각각 다른 관점을 다룰 것 (지역+활동, 장소+경험, 스타일+감정 등)
              - SNS에서 검색량이 많고 트렌디한 키워드 사용
              - 너무 일반적이지 않고 구체적일 것

              좋은 예시: 
              - #제주한라산등반, #부산감천문화마을투어, #서울홍대맛집탐방
              - #경주불국사역사여행, #강릉정동진해변힐링, #전주한옥마을체험
              
              피해야 할 예시: #여행, #힐링, #맛집 (너무 일반적)

              정확히 5개의 해시태그만 반환하고, 다른 설명은 하지 마세요.`,
            },
            {
              role: 'user',
              content: planText,
            },
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 에러: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      // 응답에서 해시태그 추출
      const hashtags = this.extractHashtags(content);

      return hashtags.length >= 5
        ? hashtags
        : this.getDefaultHashtags(travelPlan);
    } catch (error) {
      console.error('해시태그 생성 중 오류:', error);
      return this.getDefaultHashtags(travelPlan);
    }
  }

  /**
   * 여행지 근처 가볼만한 곳 추천 (카카오맵 검색 + AI 판단)
   * 1. 목적지 근처에서 카테고리별로 카카오맵 API 키워드검색 실시
   * 2. 리스트업 하고 OpenAI가 판단해서 적당한거 3개로 추림
   */
  async generateNearbyRecommendations(
    destination: string,
    travelStyle: string[],
    travelPlan: { days: any[] },
  ): Promise<
    Array<{
      name: string;
      description: string;
      category: string;
      distance: string;
      verified: boolean;
      source?: string;
    }>
  > {
    try {
      console.log('🔍 카카오맵 검색 + AI 분석을 통한 실제 장소 추천 시작...');
      console.log(`📍 목적지: ${destination}`);
      console.log(`🎯 여행 스타일: ${travelStyle.join(', ')}`);

      // 여행 계획에서 방문 예정 장소들 추출
      const visitedPlaces = this.extractPlacesFromPlan({
        destination,
        days: travelPlan.days,
      });

      console.log(`🗺️ 방문 예정 장소들: ${visitedPlaces.join(', ')}`);

      // 1단계: 카카오맵 API로 카테고리별 키워드 검색
      console.log('🔍 카카오맵 키워드 검색 시작...');

      const searchResults = await kakaoMapService.searchPlacesByCategory(
        destination,
        ['restaurant', 'activity', 'attraction'],
      );

      // 검색 결과 로깅
      searchResults.forEach((result) => {
        console.log(
          `📍 ${result.category}: ${result.places.length}개 장소 발견`,
        );
      });

      // 검색 결과가 충분하지 않은 경우 기본 추천 사용
      const totalPlaces = searchResults.reduce(
        (sum, result) => sum + result.places.length,
        0,
      );

      if (totalPlaces === 0) {
        console.warn('⚠️ 카카오맵 검색 결과가 없어 기본 추천을 사용합니다.');
        return this.getDefaultRecommendations(destination);
      }

      // 2단계: OpenAI가 각 카테고리에서 최적의 3개씩 선별
      console.log('🤖 OpenAI 장소 선별 분석 시작...');

      const selectedRecommendations = await this.selectBestPlacesWithAI(
        searchResults,
        destination,
        travelStyle,
        visitedPlaces,
      );

      if (selectedRecommendations.length > 0) {
        console.log(
          `✅ AI 분석 완료, ${selectedRecommendations.length}개의 최적화된 추천 생성됨`,
        );
        return selectedRecommendations;
      } else {
        console.warn('⚠️ AI 선별 결과가 없어 기본 추천을 사용합니다.');
        return this.getDefaultRecommendations(destination);
      }
    } catch (error) {
      console.error('🚨 근처 장소 추천 중 오류:', error);

      // 에러 타입에 따른 처리
      if (error instanceof Error) {
        if (error.message.includes('카카오맵')) {
          console.error('카카오맵 API 오류:', error.message);
        } else if (error.message.includes('OpenAI')) {
          console.error('OpenAI API 오류:', error.message);
        }
      }

      // 항상 기본 추천을 반환하여 사용자 경험 유지
      console.log('🛡️ 기본 추천으로 대체합니다.');
      return this.getDefaultRecommendations(destination);
    }
  }

  /**
   * OpenAI가 카카오맵 검색 결과에서 최적의 장소들을 선별
   */
  private async selectBestPlacesWithAI(
    searchResults: CategorySearchResult[],
    destination: string,
    travelStyle: string[],
    visitedPlaces: string[],
  ): Promise<
    Array<{
      name: string;
      description: string;
      category: string;
      distance: string;
      verified: boolean;
      source: string;
    }>
  > {
    if (!this.apiKey) {
      console.warn('OpenAI API 키가 없어 첫 번째 결과들을 반환합니다.');
      return this.formatKakaoSearchResults(searchResults);
    }

    try {
      // 검색 결과를 AI 분석용 텍스트로 포맷
      const searchResultsText = this.formatKakaoResultsForAI(searchResults);
      const styleText =
        travelStyle.length > 0 ? travelStyle.join(', ') : '일반 관광';

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // 더 정확한 판단을 위해 GPT-4 사용
          messages: [
            {
              role: 'system',
              content: `당신은 여행 추천 전문가입니다. 카카오맵에서 검색된 실제 존재하는 장소들을 분석해서, 주어진 여행 계획과 스타일에 가장 적합한 장소들을 카테고리별로 정확히 3개씩 선별해주세요.

⚠️ 중요한 원칙:
1. 반드시 제공된 카카오맵 검색 결과에서만 선별할 것
2. 각 장소의 실제 이름을 정확히 그대로 사용할 것
3. 카테고리별로 정확히 3개씩 선별 (총 9개)
4. 여행 스타일과 방문 예정 장소와의 연관성 고려

선별 기준:
1. 방문 예정 장소들과의 접근성 및 연관성
2. 여행 스타일과의 부합성 (${styleText})
3. 장소의 인기도 및 특별함
4. 여행 일정과의 조화

카테고리별 선별:
- 맛집(restaurant): 3개 선별 
- 액티비티(activity): 3개 선별
- 관광명소(attraction): 3개 선별

다음 형식으로 JSON 배열로 응답해주세요:
[
  {
    "name": "카카오맵에서 검색된 실제 장소명",
    "description": "이 장소의 특징과 추천 이유 (50자 내외)",
    "category": "restaurant|activity|attraction",
    "distance": "예상 접근성 (도보 10분, 차량 15분 등)",
    "verified": true,
    "source": "kakao_map"
  }
]`,
            },
            {
              role: 'user',
              content: `목적지: ${destination}
여행 스타일: ${styleText}
방문 예정 장소들: ${visitedPlaces.join(', ')}

카카오맵 검색 결과:
${searchResultsText}

📝 요청사항:
위 카카오맵 검색 결과에서 여행 계획에 가장 적합한 장소들을 카테고리별로 3개씩 선별해주세요.
반드시 검색 결과에 있는 실제 장소명을 그대로 사용하고, 총 9개를 선별해주세요.`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3, // 일관성있는 선별을 위해 낮은 temperature
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🚨 OpenAI API 오류 (${response.status}):`, errorText);

        // API 키 문제인 경우 자세한 안내
        if (response.status === 401) {
          console.error('❌ OpenAI API 인증 실패. API 키를 확인하세요.');
          console.error('💡 해결 방법:');
          console.error(
            '   1. .env 파일에 REACT_APP_OPENAI_API_KEY=sk-xxx 형식으로 추가',
          );
          console.error('   2. API 키가 유효하고 크레딧이 남아있는지 확인');
          console.error('   3. 앱을 다시 시작 (npm start)');
        }

        // fallback: 기본 추천 결과 반환
        console.log('🔄 OpenAI API 실패로 인해 기본 추천 결과를 반환합니다');
        return this.getFallbackRecommendations(searchResults, destination);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI 응답이 비어있습니다');
      }

      console.log('🤖 OpenAI 선별 결과:', content);

      try {
        const response = JSON.parse(content);
        let recommendations = [];

        // 응답 형식 처리 (배열 또는 객체)
        if (Array.isArray(response)) {
          recommendations = response;
        } else if (
          response.recommendations &&
          Array.isArray(response.recommendations)
        ) {
          recommendations = response.recommendations;
        } else if (response.places && Array.isArray(response.places)) {
          recommendations = response.places;
        } else {
          throw new Error('응답 형식이 올바르지 않습니다');
        }

        // 유효성 검증
        const validRecommendations = recommendations.filter(
          (rec: any) =>
            rec &&
            typeof rec.name === 'string' &&
            rec.name.trim().length > 0 &&
            typeof rec.category === 'string' &&
            ['restaurant', 'activity', 'attraction'].includes(rec.category),
        );

        console.log(
          `✅ OpenAI 선별 완료: ${validRecommendations.length}개 장소 선정`,
        );

        return validRecommendations;
      } catch (parseError) {
        console.error('🚨 OpenAI 응답 파싱 실패:', parseError);
        throw new Error('OpenAI 응답 파싱 실패');
      }
    } catch (error) {
      console.error('🚨 OpenAI 선별 중 오류:', error);

      // AI 선별 실패 시 카카오맵 결과를 직접 포맷해서 반환
      console.log('📋 카카오맵 검색 결과를 직접 사용합니다.');
      return this.formatKakaoSearchResults(searchResults);
    }
  }

  /**
   * 카카오맵 검색 결과를 AI 분석용 텍스트로 포맷
   */
  private formatKakaoResultsForAI(
    searchResults: CategorySearchResult[],
  ): string {
    let resultText = '';

    searchResults.forEach((categoryResult) => {
      const categoryName =
        {
          restaurant: '맛집',
          activity: '액티비티',
          attraction: '관광명소',
        }[categoryResult.category] || categoryResult.category;

      resultText += `\n=== ${categoryName} ===\n`;

      categoryResult.places.forEach((place, index) => {
        resultText += `${index + 1}. ${place.place_name}\n`;
        resultText += `   - 주소: ${place.address_name}\n`;
        resultText += `   - 카테고리: ${place.category_name}\n`;
        if (place.phone) {
          resultText += `   - 전화: ${place.phone}\n`;
        }
        resultText += '\n';
      });
    });

    return resultText;
  }

  /**
   * 카카오맵 검색 결과를 추천 형식으로 포맷 (AI 분석 실패시 사용)
   */
  private formatKakaoSearchResults(
    searchResults: CategorySearchResult[],
  ): Array<{
    name: string;
    description: string;
    category: string;
    distance: string;
    verified: boolean;
    source: string;
  }> {
    const formatted: Array<{
      name: string;
      description: string;
      category: string;
      distance: string;
      verified: boolean;
      source: string;
    }> = [];

    searchResults.forEach((categoryResult) => {
      // 각 카테고리에서 최대 3개씩 선택
      const topPlaces = categoryResult.places.slice(0, 3);

      topPlaces.forEach((place) => {
        formatted.push({
          name: place.place_name,
          description: `${place.category_name} - ${place.address_name}`,
          category: this.mapCategoryToRecommendationType(
            categoryResult.category,
          ),
          distance: place.distance || '정보 없음',
          verified: true,
          source: 'kakao_map',
        });
      });
    });

    return formatted;
  }

  /**
   * 카카오맵 카테고리를 추천 타입으로 매핑
   */
  private mapCategoryToRecommendationType(
    category: 'restaurant' | 'activity' | 'attraction',
  ): string {
    const mapping = {
      restaurant: '맛집',
      activity: '액티비티',
      attraction: '관광명소',
    };
    return mapping[category] || category;
  }

  /**
   * 여행 계획을 AI 분석용 텍스트로 변환
   */
  private formatPlanForAnalysis(travelPlan: {
    title: string;
    destination: string;
    days: any[];
    styles: string[];
  }): string {
    let planText = `여행 제목: ${travelPlan.title}\n`;
    planText += `주요 목적지: ${travelPlan.destination}\n`;
    planText += `여행 스타일: ${travelPlan.styles.join(', ')}\n\n`;

    // 실제 방문 장소들과 활동들 추출
    const visitedPlaces: string[] = [];
    const plannedActivities: string[] = [];

    planText += `상세 일정:\n`;
    travelPlan.days.forEach((day, index) => {
      if (day.events && day.events.length > 0) {
        planText += `${index + 1}일차:\n`;
        day.events.forEach((event: any) => {
          if (event.place) {
            planText += `- ${event.time || ''} ${event.place}`;
            visitedPlaces.push(event.place);

            if (event.activity) {
              planText += ` (${event.activity})`;
              plannedActivities.push(event.activity);
            }
            planText += `\n`;
          }
        });
        planText += `\n`;
      }
    });

    // 방문 장소와 활동 요약 추가
    if (visitedPlaces.length > 0) {
      planText += `\n방문 예정 장소들: ${visitedPlaces.join(', ')}\n`;
    }
    if (plannedActivities.length > 0) {
      planText += `계획된 활동들: ${plannedActivities.join(', ')}\n`;
    }

    return planText;
  }

  /**
   * 실제 방문 장소들을 추출하는 함수
   */
  private extractPlacesFromPlan(travelPlan: {
    destination: string;
    days: any[];
  }): string[] {
    const places = [travelPlan.destination]; // 주요 목적지 포함

    travelPlan.days.forEach((day) => {
      if (day.events && day.events.length > 0) {
        day.events.forEach((event: any) => {
          if (event.place && event.place.trim()) {
            places.push(event.place.trim());
          }
        });
      }
    });

    // 중복 제거 및 빈 문자열 제거
    return Array.from(new Set(places)).filter((place) => place.length > 0);
  }

  /**
   * 응답에서 해시태그 추출
   */
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w가-힣]+/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.slice(0, 5);
  }

  /**
   * 기본 해시태그 생성 (API 호출 실패시)
   */
  private getDefaultHashtags(plan: any): string[] {
    const tags = [`#${plan.destination}`];

    // 여행 스타일 기반 해시태그
    const styleMap: { [key: string]: string } = {
      planned: '#계획여행',
      spontaneous: '#즉흥여행',
      tourism: '#관광투어',
      relaxation: '#힐링여행',
      food: '#맛집탐방',
      nature: '#자연체험',
      culture: '#문화여행',
      shopping: '#쇼핑여행',
    };

    plan.styles.forEach((style: string) => {
      if (styleMap[style]) {
        tags.push(styleMap[style]);
      }
    });

    // 기본 태그 추가
    tags.push('#여행스타그램', '#인생여행');

    return tags.slice(0, 5);
  }

  /**
   * 여행지의 가장 대표적인 랜드마크를 분석합니다
   */
  async analyzeRepresentativeLandmark(destination: string): Promise<string> {
    try {
      if (!this.apiKey) {
        console.warn(
          'OpenAI API 키가 설정되지 않았습니다. 원본 목적지를 반환합니다.',
        );
        return destination;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `당신은 여행지 전문가입니다. 주어진 여행 목적지의 가장 대표적이고 상징적인 랜드마크 또는 장소 1개를 정확한 명칭으로 추천해주세요.

              분석 기준:
              1. 해당 지역을 가장 잘 나타내는 상징적인 장소
              2. 관광객들이 가장 많이 찾는 유명한 명소
              3. 그 지역 하면 가장 먼저 떠오르는 대표 장소
              4. 사진으로 찍었을 때 그 지역임을 바로 알 수 있는 곳
              5. 실제 존재하는 정확한 장소명

              좋은 예시:
              - 제주도 → "한라산" 또는 "성산일출봉"
              - 부산 → "해운대해수욕장" 또는 "감천문화마을"
              - 서울 → "남산서울타워" 또는 "경복궁"
              - 경주 → "불국사" 또는 "첨성대"

              주의사항:
              - 정확한 공식 명칭 사용
              - 1개만 추천
              - 다른 설명 없이 장소명만 반환
              - 존재하지 않는 가상의 장소 금지

              장소명만 간단히 답변해주세요.`,
            },
            {
              role: 'user',
              content: `다음 여행지의 가장 대표적인 랜드마크나 상징적인 장소 1개를 정확한 명칭으로 추천해주세요: ${destination}`,
            },
          ],
          max_tokens: 50,
          temperature: 0.3, // 일관된 결과를 위해 낮은 temperature
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 에러: ${response.status}`);
      }

      const data = await response.json();
      const landmark = data.choices[0]?.message?.content?.trim();

      if (landmark && landmark.length > 0) {
        console.log(`${destination}의 대표 랜드마크 분석 결과: ${landmark}`);
        return landmark;
      }

      return destination; // 분석 실패시 원본 목적지 반환
    } catch (error) {
      console.error('대표 랜드마크 분석 중 오류:', error);
      return destination; // 오류 발생시 원본 목적지 반환
    }
  }

  /**
   * 기본 추천지 생성 (API 호출 실패시)
   */
  private getDefaultRecommendations(destination: string): Array<{
    name: string;
    description: string;
    category: string;
    distance: string;
    verified: boolean;
    source?: string;
  }> {
    // 주요 여행지별 기본 추천지
    const defaultPlaces: { [key: string]: any[] } = {
      제주도: [
        // 맛집 3개
        {
          name: '제주 흑돼지 맛집',
          description:
            '제주 특산품인 흑돼지를 맛볼 수 있는 현지 인기 맛집입니다.',
          category: '맛집',
          distance: '차량 15분',
          verified: false,
          source: 'default',
        },
        {
          name: '오설록 티 뮤지엄 카페',
          description:
            '제주 녹차를 이용한 다양한 음료와 디저트를 즐길 수 있습니다.',
          category: '맛집',
          distance: '차량 20분',
          verified: false,
          source: 'default',
        },
        {
          name: '제주 해물찜 맛집',
          description: '신선한 제주 바다의 해산물로 만든 해물찜 전문점입니다.',
          category: '맛집',
          distance: '차량 10분',
          verified: false,
          source: 'default',
        },
        // 액티비티 3개
        {
          name: '한라산 등반',
          description:
            '제주도의 상징 한라산을 등반하며 자연을 만끽할 수 있습니다.',
          category: '액티비티',
          distance: '차량 40분',
          verified: false,
          source: 'default',
        },
        {
          name: '바다 스쿠버다이빙',
          description: '제주 맑은 바다에서 스쿠버다이빙을 체험할 수 있습니다.',
          category: '액티비티',
          distance: '차량 25분',
          verified: false,
          source: 'default',
        },
        {
          name: '승마체험장',
          description: '제주 초원에서 승마를 배우고 체험할 수 있는 곳입니다.',
          category: '액티비티',
          distance: '차량 30분',
          verified: false,
          source: 'default',
        },
        // 관광명소 3개
        {
          name: '성산일출봉',
          description: '일출 명소로 유명한 유네스코 세계자연유산입니다.',
          category: '관광명소',
          distance: '차량 30분',
          verified: false,
          source: 'default',
        },
        {
          name: '중문관광단지',
          description: '다양한 관광 시설과 아름다운 해변이 있는 곳입니다.',
          category: '관광명소',
          distance: '차량 25분',
          verified: false,
          source: 'default',
        },
        {
          name: '비자림',
          description:
            '천년의 역사를 가진 비자나무 군락지로 산림욕을 즐길 수 있습니다.',
          category: '관광명소',
          distance: '차량 35분',
          verified: false,
          source: 'default',
        },
      ],
      부산: [
        // 맛집 3개
        {
          name: '자갈치시장 회센터',
          description: '부산 대표 수산시장에서 신선한 회를 맛볼 수 있습니다.',
          category: '맛집',
          distance: '지하철 15분',
          verified: false,
          source: 'default',
        },
        {
          name: '광안리 맛집거리',
          description:
            '해변 뷰와 함께 다양한 음식을 즐길 수 있는 맛집 거리입니다.',
          category: '맛집',
          distance: '지하철 20분',
          verified: false,
          source: 'default',
        },
        {
          name: '부산 돼지국밥 골목',
          description:
            '부산의 대표 음식인 돼지국밥을 맛볼 수 있는 전통 골목입니다.',
          category: '맛집',
          distance: '도보 10분',
          verified: false,
          source: 'default',
        },
        // 액티비티 3개
        {
          name: '해운대 서핑',
          description: '부산 대표 해수욕장에서 서핑을 배우고 즐길 수 있습니다.',
          category: '액티비티',
          distance: '지하철 25분',
          verified: false,
          source: 'default',
        },
        {
          name: '태종대 해안산책',
          description: '절벽과 바다가 어우러진 해안 둘레길을 걸을 수 있습니다.',
          category: '액티비티',
          distance: '버스 40분',
          verified: false,
          source: 'default',
        },
        {
          name: '부산항 요트투어',
          description: '부산 앞바다를 요트로 둘러보는 특별한 체험입니다.',
          category: '액티비티',
          distance: '지하철 15분',
          verified: false,
          source: 'default',
        },
        // 관광명소 3개
        {
          name: '해운대해수욕장',
          description:
            '부산 대표 해수욕장으로 다양한 액티비티를 즐길 수 있습니다.',
          category: '관광명소',
          distance: '지하철 20분',
          verified: false,
          source: 'default',
        },
        {
          name: '감천문화마을',
          description: '알록달록한 벽화와 독특한 건축물이 매력적인 마을입니다.',
          category: '관광명소',
          distance: '버스 30분',
          verified: false,
          source: 'default',
        },
        {
          name: '부산타워',
          description: '부산 시내를 한눈에 내려다볼 수 있는 전망대입니다.',
          category: '관광명소',
          distance: '지하철 25분',
          verified: false,
          source: 'default',
        },
      ],
    };

    // 목적지에 맞는 추천지가 있으면 반환, 없으면 일반적인 추천지 반환
    for (const [key, places] of Object.entries(defaultPlaces)) {
      if (destination.includes(key)) {
        return places;
      }
    }

    // 기본 추천지 (9개)
    return [
      // 맛집 3개
      {
        name: '현지 특산 맛집',
        description: '지역 특산물과 전통 음식을 맛볼 수 있는 현지 맛집입니다.',
        category: '맛집',
        distance: '도보 10분',
        verified: false,
        source: 'default',
      },
      {
        name: '로컬 카페',
        description: '현지인들이 자주 찾는 분위기 좋은 카페입니다.',
        category: '맛집',
        distance: '도보 5분',
        verified: false,
        source: 'default',
      },
      {
        name: '전통 시장 먹거리',
        description: '전통 시장에서 맛볼 수 있는 다양한 길거리 음식입니다.',
        category: '맛집',
        distance: '도보 15분',
        verified: false,
        source: 'default',
      },
      // 액티비티 3개
      {
        name: '자전거 투어',
        description:
          '지역을 자전거로 둘러보며 자연과 문화를 체험할 수 있습니다.',
        category: '액티비티',
        distance: '도보 5분',
        verified: false,
        source: 'default',
      },
      {
        name: '트레킹 코스',
        description:
          '현지의 아름다운 자연을 걸으며 감상할 수 있는 산책로입니다.',
        category: '액티비티',
        distance: '차량 15분',
        verified: false,
        source: 'default',
      },
      {
        name: '문화 체험 프로그램',
        description: '지역 전통 문화를 직접 체험해볼 수 있는 프로그램입니다.',
        category: '액티비티',
        distance: '차량 20분',
        verified: false,
        source: 'default',
      },
      // 관광명소 3개
      {
        name: '역사 박물관',
        description: '지역의 역사와 문화를 배울 수 있는 교육적인 장소입니다.',
        category: '관광명소',
        distance: '차량 20분',
        verified: false,
        source: 'default',
      },
      {
        name: '전통 건축물',
        description: '지역의 전통 건축 양식을 감상할 수 있는 문화재입니다.',
        category: '관광명소',
        distance: '도보 20분',
        verified: false,
        source: 'default',
      },
      {
        name: '자연 공원',
        description:
          '아름다운 자연 경관을 즐기며 휴식을 취할 수 있는 공원입니다.',
        category: '관광명소',
        distance: '차량 25분',
        verified: false,
        source: 'default',
      },
    ];
  }

  /**
   * 카카오맵 검색 결과를 추천 형식으로 포맷 (AI 분석 실패시 사용)
   */
  private getFallbackRecommendations(
    searchResults: CategorySearchResult[],
    destination: string,
  ): Array<{
    name: string;
    description: string;
    category: string;
    distance: string;
    verified: boolean;
    source: string;
  }> {
    const fallbackRecommendations: Array<{
      name: string;
      description: string;
      category: string;
      distance: string;
      verified: boolean;
      source: string;
    }> = [];

    searchResults.forEach((categoryResult) => {
      // 각 카테고리에서 최대 3개씩 선택
      const topPlaces = categoryResult.places.slice(0, 3);

      topPlaces.forEach((place) => {
        fallbackRecommendations.push({
          name: place.place_name,
          description: `${place.category_name} - ${place.address_name}`,
          category: this.mapCategoryToRecommendationType(
            categoryResult.category,
          ),
          distance: place.distance || '정보 없음',
          verified: true,
          source: 'kakao_map',
        });
      });
    });

    return fallbackRecommendations;
  }

  /**
   * 목적지의 카테고리를 분류하는 메서드
   */
  async classifyDestinationCategory(destination: string): Promise<{
    category: string;
    icon: string;
    background: string;
    textColor: string;
    borderColor: string;
  }> {
    try {
      if (!this.apiKey) {
        console.warn(
          'OpenAI API 키가 설정되지 않았습니다. 기본 카테고리를 반환합니다.',
        );
        return this.getDefaultDestinationCategory(destination);
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `당신은 여행 목적지 분류 전문가입니다. 주어진 목적지의 주요 특성을 파악하여 가장 적합한 카테고리로 분류해주세요.

사용 가능한 카테고리:
- 자연: 산, 바다, 호수, 국립공원, 자연명소 등
- 도시: 대도시, 시내, 번화가, 도심지 등  
- 문화: 역사적 장소, 박물관, 전통 마을, 문화재 등
- 휴양: 리조트, 온천, 해변, 휴양지 등
- 모험: 등산, 트레킹, 익스트림 스포츠 지역 등
- 쇼핑: 쇼핑몰, 시장, 명동 등 쇼핑 중심지
- 엔터: 테마파크, 놀이공원, 유흥가 등

응답 형식 (JSON):
{
  "category": "카테고리명",
  "reasoning": "분류 근거"
}`,
            },
            {
              role: 'user',
              content: `다음 여행 목적지를 분석하여 가장 적합한 카테고리로 분류해주세요: "${destination}"`,
            },
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API 오류:', response.status, response.statusText);
        return this.getDefaultDestinationCategory(destination);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        console.warn('OpenAI API 응답이 비어있습니다.');
        return this.getDefaultDestinationCategory(destination);
      }

      // JSON 파싱 시도
      try {
        const result = JSON.parse(content);
        const category = result.category;

        // 카테고리에 따른 스타일 반환
        return this.getCategoryStyle(category);
      } catch (parseError) {
        console.error('JSON 파싱 실패:', parseError);
        return this.getDefaultDestinationCategory(destination);
      }
    } catch (error) {
      console.error('목적지 카테고리 분류 중 오류:', error);
      return this.getDefaultDestinationCategory(destination);
    }
  }

  /**
   * 카테고리에 따른 스타일 반환
   */
  private getCategoryStyle(category: string): {
    category: string;
    icon: string;
    background: string;
    textColor: string;
    borderColor: string;
  } {
    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('자연') || categoryLower.includes('nature')) {
      return {
        category: '자연',
        icon: '🌲',
        background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
        textColor: '#FFFFFF',
        borderColor: '#27AE60',
      };
    }
    if (categoryLower.includes('도시') || categoryLower.includes('city')) {
      return {
        category: '도시',
        icon: '🏙️',
        background: 'linear-gradient(135deg, #34495E, #2C3E50)',
        textColor: '#FFFFFF',
        borderColor: '#34495E',
      };
    }
    if (categoryLower.includes('문화') || categoryLower.includes('culture')) {
      return {
        category: '문화',
        icon: '🏛️',
        background: 'linear-gradient(135deg, #F39C12, #E67E22)',
        textColor: '#FFFFFF',
        borderColor: '#F39C12',
      };
    }
    if (categoryLower.includes('휴양') || categoryLower.includes('resort')) {
      return {
        category: '휴양',
        icon: '🏖️',
        background: 'linear-gradient(135deg, #3498DB, #2980B9)',
        textColor: '#FFFFFF',
        borderColor: '#3498DB',
      };
    }
    if (categoryLower.includes('모험') || categoryLower.includes('adventure')) {
      return {
        category: '모험',
        icon: '⛰️',
        background: 'linear-gradient(135deg, #E74C3C, #C0392B)',
        textColor: '#FFFFFF',
        borderColor: '#E74C3C',
      };
    }
    if (categoryLower.includes('쇼핑') || categoryLower.includes('shopping')) {
      return {
        category: '쇼핑',
        icon: '🛍️',
        background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
        textColor: '#FFFFFF',
        borderColor: '#9B59B6',
      };
    }
    if (
      categoryLower.includes('엔터') ||
      categoryLower.includes('entertainment')
    ) {
      return {
        category: '엔터',
        icon: '🎢',
        background: 'linear-gradient(135deg, #E91E63, #F06292)',
        textColor: '#FFFFFF',
        borderColor: '#E91E63',
      };
    }

    // 기본값
    return {
      category: '관광',
      icon: '📍',
      background: 'linear-gradient(135deg, #45B7D1, #3682F8)',
      textColor: '#FFFFFF',
      borderColor: '#45B7D1',
    };
  }

  /**
   * 기본 목적지 카테고리 (API 실패 시)
   */
  private getDefaultDestinationCategory(destination: string): {
    category: string;
    icon: string;
    background: string;
    textColor: string;
    borderColor: string;
  } {
    const destLower = destination.toLowerCase();

    // 간단한 키워드 기반 분류
    if (
      destLower.includes('산') ||
      destLower.includes('국립공원') ||
      destLower.includes('자연')
    ) {
      return this.getCategoryStyle('자연');
    }
    if (
      destLower.includes('서울') ||
      destLower.includes('부산') ||
      destLower.includes('도시')
    ) {
      return this.getCategoryStyle('도시');
    }
    if (
      destLower.includes('해변') ||
      destLower.includes('바다') ||
      destLower.includes('제주')
    ) {
      return this.getCategoryStyle('휴양');
    }
    if (
      destLower.includes('박물관') ||
      destLower.includes('궁') ||
      destLower.includes('문화')
    ) {
      return this.getCategoryStyle('문화');
    }

    return this.getCategoryStyle('관광');
  }
}

// 싱글톤 인스턴스 생성
const openaiService = new OpenAIService();

export default openaiService;
