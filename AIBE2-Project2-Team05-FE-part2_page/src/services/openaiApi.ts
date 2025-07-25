// OpenAI API 연동 서비스
class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    // 환경변수에서 API 키를 가져옴 (개발 환경에서는 .env 파일 사용)
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
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
   * 여행지 근처 가볼만한 곳 추천
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
    }>
  > {
    try {
      if (!this.apiKey) {
        console.warn(
          'OpenAI API 키가 설정되지 않았습니다. 기본 추천지를 반환합니다.',
        );
        return this.getDefaultRecommendations(destination);
      }

      const styleText = travelStyle.join(', ');
      const visitedPlaces = this.extractPlacesFromPlan({
        destination,
        days: travelPlan.days,
      });

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
              content: `당신은 현지 여행 가이드 전문가입니다. 주어진 여행 목적지와 실제 방문 예정 장소들을 분석해서, 그 근처에 있는 실제 존재하는 가볼만한 곳을 카테고리별로 정확히 9개 추천해주세요.

              추천 기준:
              1. 실제 방문 예정 장소들과 가까운 거리에 위치
              2. 현지에서 실제로 운영되고 있는 검증된 장소들만 추천
              3. 온라인에서 찾을 수 있고 실제 방문 가능한 곳들
              4. 여행 스타일과 일정에 맞는 장소들 우선 선택

              카테고리별 추천 개수:
              - 맛집: 3개 (현지 특산 음식, 유명 맛집, 카페/디저트)
              - 액티비티: 3개 (체험 프로그램, 스포츠, 레저 활동)
              - 관광명소: 3개 (유명 명소, 문화재, 자연 경관)

              다음 형식으로 JSON 배열로 응답해주세요:
              [
                {
                  "name": "실제 장소명 (정확한 이름)",
                  "description": "간단한 설명 (1-2문장, 왜 추천하는지 포함)",
                  "category": "맛집|액티비티|관광명소",
                  "distance": "방문 예정지로부터의 거리 (예: 도보 10분, 차량 30분)"
                }
              ]

              주의사항:
              - 반드시 실제 존재하는 장소만 추천
              - 가상의 장소나 일반적인 설명은 금지
              - 장소명은 정확하고 구체적으로 작성
              - 각 카테고리마다 정확히 3개씩 총 9개
              - 방문 예정 장소들과의 접근성 고려

              정확히 9개의 장소만 JSON 형태로 반환하고, 다른 설명은 하지 마세요.`,
            },
            {
              role: 'user',
              content: `주요 목적지: ${destination}
              실제 방문 예정 장소들: ${visitedPlaces.join(', ')}
              여행 스타일: ${styleText}
              
              위 정보를 바탕으로 방문 예정 장소들 근처의 실제 존재하는 맛집 3개, 액티비티 3개, 관광명소 3개를 추천해주세요.`,
            },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 에러: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      try {
        // JSON 파싱 시도
        const recommendations = JSON.parse(content);
        return Array.isArray(recommendations)
          ? recommendations
          : this.getDefaultRecommendations(destination);
      } catch {
        // JSON 파싱 실패시 기본 추천지 반환
        return this.getDefaultRecommendations(destination);
      }
    } catch (error) {
      console.error('근처 장소 추천 중 오류:', error);
      return this.getDefaultRecommendations(destination);
    }
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
        },
        {
          name: '오설록 티 뮤지엄 카페',
          description:
            '제주 녹차를 이용한 다양한 음료와 디저트를 즐길 수 있습니다.',
          category: '맛집',
          distance: '차량 20분',
        },
        {
          name: '제주 해물찜 맛집',
          description: '신선한 제주 바다의 해산물로 만든 해물찜 전문점입니다.',
          category: '맛집',
          distance: '차량 10분',
        },
        // 액티비티 3개
        {
          name: '한라산 등반',
          description:
            '제주도의 상징 한라산을 등반하며 자연을 만끽할 수 있습니다.',
          category: '액티비티',
          distance: '차량 40분',
        },
        {
          name: '바다 스쿠버다이빙',
          description: '제주 맑은 바다에서 스쿠버다이빙을 체험할 수 있습니다.',
          category: '액티비티',
          distance: '차량 25분',
        },
        {
          name: '승마체험장',
          description: '제주 초원에서 승마를 배우고 체험할 수 있는 곳입니다.',
          category: '액티비티',
          distance: '차량 30분',
        },
        // 관광명소 3개
        {
          name: '성산일출봉',
          description: '일출 명소로 유명한 유네스코 세계자연유산입니다.',
          category: '관광명소',
          distance: '차량 30분',
        },
        {
          name: '중문관광단지',
          description: '다양한 관광 시설과 아름다운 해변이 있는 곳입니다.',
          category: '관광명소',
          distance: '차량 25분',
        },
        {
          name: '비자림',
          description:
            '천년의 역사를 가진 비자나무 군락지로 산림욕을 즐길 수 있습니다.',
          category: '관광명소',
          distance: '차량 35분',
        },
      ],
      부산: [
        // 맛집 3개
        {
          name: '자갈치시장 회센터',
          description: '부산 대표 수산시장에서 신선한 회를 맛볼 수 있습니다.',
          category: '맛집',
          distance: '지하철 15분',
        },
        {
          name: '광안리 맛집거리',
          description:
            '해변 뷰와 함께 다양한 음식을 즐길 수 있는 맛집 거리입니다.',
          category: '맛집',
          distance: '지하철 20분',
        },
        {
          name: '부산 돼지국밥 골목',
          description:
            '부산의 대표 음식인 돼지국밥을 맛볼 수 있는 전통 골목입니다.',
          category: '맛집',
          distance: '도보 10분',
        },
        // 액티비티 3개
        {
          name: '해운대 서핑',
          description: '부산 대표 해수욕장에서 서핑을 배우고 즐길 수 있습니다.',
          category: '액티비티',
          distance: '지하철 25분',
        },
        {
          name: '태종대 해안산책',
          description: '절벽과 바다가 어우러진 해안 둘레길을 걸을 수 있습니다.',
          category: '액티비티',
          distance: '버스 40분',
        },
        {
          name: '부산항 요트투어',
          description: '부산 앞바다를 요트로 둘러보는 특별한 체험입니다.',
          category: '액티비티',
          distance: '지하철 15분',
        },
        // 관광명소 3개
        {
          name: '해운대해수욕장',
          description:
            '부산 대표 해수욕장으로 다양한 액티비티를 즐길 수 있습니다.',
          category: '관광명소',
          distance: '지하철 20분',
        },
        {
          name: '감천문화마을',
          description: '알록달록한 벽화와 독특한 건축물이 매력적인 마을입니다.',
          category: '관광명소',
          distance: '버스 30분',
        },
        {
          name: '부산타워',
          description: '부산 시내를 한눈에 내려다볼 수 있는 전망대입니다.',
          category: '관광명소',
          distance: '지하철 25분',
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
      },
      {
        name: '로컬 카페',
        description: '현지인들이 자주 찾는 분위기 좋은 카페입니다.',
        category: '맛집',
        distance: '도보 5분',
      },
      {
        name: '전통 시장 먹거리',
        description: '전통 시장에서 맛볼 수 있는 다양한 길거리 음식입니다.',
        category: '맛집',
        distance: '도보 15분',
      },
      // 액티비티 3개
      {
        name: '자전거 투어',
        description:
          '지역을 자전거로 둘러보며 자연과 문화를 체험할 수 있습니다.',
        category: '액티비티',
        distance: '도보 5분',
      },
      {
        name: '트레킹 코스',
        description:
          '현지의 아름다운 자연을 걸으며 감상할 수 있는 산책로입니다.',
        category: '액티비티',
        distance: '차량 15분',
      },
      {
        name: '문화 체험 프로그램',
        description: '지역 전통 문화를 직접 체험해볼 수 있는 프로그램입니다.',
        category: '액티비티',
        distance: '차량 20분',
      },
      // 관광명소 3개
      {
        name: '역사 박물관',
        description: '지역의 역사와 문화를 배울 수 있는 교육적인 장소입니다.',
        category: '관광명소',
        distance: '차량 20분',
      },
      {
        name: '전통 건축물',
        description: '지역의 전통 건축 양식을 감상할 수 있는 문화재입니다.',
        category: '관광명소',
        distance: '도보 20분',
      },
      {
        name: '자연 공원',
        description:
          '아름다운 자연 경관을 즐기며 휴식을 취할 수 있는 공원입니다.',
        category: '관광명소',
        distance: '차량 25분',
      },
    ];
  }
}

// 싱글톤 인스턴스 생성
const openaiService = new OpenAIService();

export default openaiService;
