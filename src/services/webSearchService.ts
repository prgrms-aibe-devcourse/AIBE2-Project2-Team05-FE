// 웹 검색을 통한 실제 장소 조사 서비스
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface PlaceInfo {
  name: string;
  description: string;
  address?: string;
  category: string;
  verified: boolean;
  source: string;
}

class WebSearchService {
  private apiKey: string;
  private searchEngine: string;

  constructor() {
    // 구글 Custom Search API 키 (실제 서비스에서 사용)
    this.apiKey = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY || '';
    this.searchEngine = process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID || '';
  }

  /**
   * 특정 목적지 근처의 실제 장소들을 웹 검색으로 조사
   */
  async searchNearbyPlaces(
    destination: string,
    category: '맛집' | '액티비티' | '관광명소',
    visitedPlaces: string[] = [],
  ): Promise<PlaceInfo[]> {
    try {
      const searchQueries = this.generateSearchQueries(
        destination,
        category,
        visitedPlaces,
      );
      const allResults: PlaceInfo[] = [];

      // 각 검색어에 대해 병렬 검색 실행
      const searchPromises = searchQueries.map((query) =>
        this.performWebSearch(query, category),
      );

      const searchResults = await Promise.all(searchPromises);

      // 모든 결과 합치기
      searchResults.forEach((results) => {
        allResults.push(...results);
      });

      // 중복 제거 및 검증된 장소만 반환
      const uniquePlaces = this.removeDuplicates(allResults);
      return uniquePlaces.slice(0, 10); // 최대 10개 반환
    } catch (error) {
      console.error('웹 검색 중 오류 발생:', error);
      return this.getFallbackPlaces(destination, category);
    }
  }

  /**
   * 카테고리별 검색어 생성 - 구체적인 장소명을 찾도록 개선
   */
  private generateSearchQueries(
    destination: string,
    category: string,
    visitedPlaces: string[],
  ): string[] {
    const baseQueries: { [key: string]: string[] } = {
      맛집: [
        `${destination} 유명 맛집 이름 리스트`,
        `${destination} 현지 맛집 상호명`,
        `${destination} 대표 음식점 이름`,
        `${destination} 맛집 가게명 추천`,
        `${destination} 로컬 맛집 업체명`,
      ],
      액티비티: [
        `${destination} 체험 업체 이름`,
        `${destination} 액티비티 센터 상호`,
        `${destination} 투어 업체명 리스트`,
        `${destination} 레저 시설 이름`,
        `${destination} 체험 프로그램 업체`,
      ],
      관광명소: [
        `${destination} 관광지 명칭 리스트`,
        `${destination} 유명 명소 이름`,
        `${destination} 대표 관광지명`,
        `${destination} 가볼만한곳 명칭`,
        `${destination} 랜드마크 이름`,
      ],
    };

    let queries = baseQueries[category] || [];

    // 방문 예정 장소들 주변 검색어 추가
    if (visitedPlaces.length > 0) {
      visitedPlaces.forEach((place) => {
        queries.push(`${place} 주변 ${category} 업체명`);
        queries.push(`${place} 근처 ${category} 이름`);
      });
    }

    return queries;
  }

  /**
   * 실제 웹 검색 실행
   */
  private async performWebSearch(
    query: string,
    category: string,
  ): Promise<PlaceInfo[]> {
    // API 키가 없는 경우 Mock 데이터 사용 (개발환경)
    if (!this.apiKey) {
      return this.getMockSearchResults(query, category);
    }

    try {
      // Google Custom Search API 호출
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngine}&q=${encodeURIComponent(query)}&num=5`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!data.items) {
        return [];
      }

      // 검색 결과를 PlaceInfo 형태로 변환
      return data.items.map((item: any) => ({
        name: this.extractPlaceName(item.title),
        description: this.generateDescription(item.snippet, category),
        category: category,
        verified: true,
        source: item.link,
        address: this.extractAddress(item.snippet),
      }));
    } catch (error) {
      console.error('Google Search API 오류:', error);
      return this.getMockSearchResults(query, category);
    }
  }

  /**
   * Mock 검색 결과 확장 - 더 많은 실제 장소명 추가
   */
  private getMockSearchResults(query: string, category: string): PlaceInfo[] {
    const destination = query.split(' ')[0];

    const mockData: { [key: string]: { [key: string]: PlaceInfo[] } } = {
      제주도: {
        맛집: [
          {
            name: '올레국수',
            description:
              '제주도 대표 향토음식 고기국수 전문점으로 현지인들이 인정한 맛집',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '제주시 구좌읍',
          },
          {
            name: '성산포오일장 해물탕',
            description:
              '신선한 제주 바다 해산물로 끓인 해물탕이 유명한 성산포 현지 맛집',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '서귀포시 성산읍',
          },
          {
            name: '제주흑돼지 본가',
            description:
              '제주 특산품 흑돼지 구이 전문점, 숯불에 구운 고기가 일품',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '제주시 애월읍',
          },
          {
            name: '돈사돈',
            description: '제주 흑돼지 전문점으로 현지인들이 즐겨 찾는 고기집',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '제주시 연동',
          },
          {
            name: '몽상드애월',
            description:
              '애월 해안가에 위치한 디저트 카페로 아름다운 바다 전망이 일품',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '제주시 애월읍',
          },
        ],
        액티비티: [
          {
            name: '제주 승마공원',
            description:
              '아름다운 제주 자연 속에서 승마를 체험할 수 있는 승마장',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '제주시 한림읍',
          },
          {
            name: '협재해수욕장 스쿠버다이빙',
            description: '맑고 깨끗한 협재 바다에서 스쿠버다이빙 체험 프로그램',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '제주시 한림읍',
          },
          {
            name: '한라산 등반 가이드 투어',
            description:
              '전문 가이드와 함께하는 한라산 등반 및 자연 해설 프로그램',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '제주시 아라동',
          },
          {
            name: '제주 ATV 체험장',
            description: '오름과 들판을 달리는 사륜바이크 체험 프로그램',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '제주시 조천읍',
          },
          {
            name: '우도 해양레저',
            description: '우도 주변에서 즐기는 카약과 스노클링 해양 액티비티',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '제주시 우도면',
          },
        ],
        관광명소: [
          {
            name: '성산일출봉',
            description: '유네스코 세계자연유산으로 지정된 제주 대표 관광명소',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '서귀포시 성산읍',
          },
          {
            name: '만장굴',
            description:
              '세계 최대 용암동굴 중 하나로 자연의 신비를 체험할 수 있는 곳',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '제주시 구좌읍',
          },
          {
            name: '우도',
            description:
              '제주도 옆 작은 섬으로 아름다운 해변과 자연경관을 자랑',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '제주시 우도면',
          },
          {
            name: '천지연폭포',
            description:
              '서귀포의 대표적인 폭포로 울창한 숲과 함께 절경을 이루는 곳',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '서귀포시 색달동',
          },
          {
            name: '한라봉체험농장',
            description:
              '제주 특산물 한라봉을 직접 따보고 맛볼 수 있는 체험농장',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '서귀포시 남원읍',
          },
        ],
      },
      부산: {
        맛집: [
          {
            name: '자갈치시장 할매집',
            description: '부산 대표 수산시장에서 50년 전통의 회와 해물 전문점',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '부산 중구 자갈치해안로',
          },
          {
            name: '해운대 민락수변공원 회센터',
            description:
              '해운대 바다를 바라보며 신선한 회를 즐길 수 있는 회센터',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '부산 수영구 민락동',
          },
          {
            name: '부산대학교 앞 돼지국밥골목',
            description:
              '부산 대표 서민음식 돼지국밥의 원조 맛집들이 모인 골목',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '부산 금정구 장전동',
          },
          {
            name: '밀면집 춘하추동',
            description: '부산 대표 향토음식 밀면 전문점으로 50년 전통의 맛',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '부산 동래구 수민동',
          },
          {
            name: '광안리 꼼장어골목',
            description:
              '광안대교를 바라보며 즐기는 부산 대표 꼼장어 맛집 거리',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '부산 수영구 광안2동',
          },
        ],
        액티비티: [
          {
            name: '해운대 서핑스쿨',
            description: '부산 대표 해수욕장에서 전문강사와 함께하는 서핑 레슨',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '부산 해운대구 해운대해변로',
          },
          {
            name: '부산항 크루즈',
            description:
              '부산 앞바다를 둘러보는 크루즈 관광으로 부산의 야경 감상',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '부산 중구 중앙동',
          },
          {
            name: '태종대 해안트레킹',
            description: '부산의 절경 태종대 해안 절벽을 따라 걷는 트레킹 코스',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '부산 영도구 전망로',
          },
          {
            name: '송도 스카이워크',
            description: '바다 위를 걷는 듯한 경험을 할 수 있는 투명 유리 다리',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '부산 서구 송도해변로',
          },
          {
            name: '광안리 SUP체험',
            description: '광안대교를 배경으로 하는 서핑보드 체험 프로그램',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '부산 수영구 광안해변로',
          },
        ],
        관광명소: [
          {
            name: '감천문화마을',
            description:
              '알록달록한 계단식 마을로 부산의 산토리니라 불리는 관광명소',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '부산 사하구 감내2로',
          },
          {
            name: '해운대 해수욕장',
            description:
              '부산 대표 해수욕장으로 다양한 해양 액티비티와 축제가 열리는 곳',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '부산 해운대구 해운대해변로',
          },
          {
            name: '용두산공원 부산타워',
            description:
              '부산 시내를 한눈에 내려다볼 수 있는 부산의 대표 전망대',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '부산 중구 용두산길',
          },
          {
            name: '광안대교',
            description: '부산의 랜드마크로 야경이 아름다운 현수교',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '부산 수영구 광안동',
          },
          {
            name: '동백섬',
            description:
              '해운대와 연결된 작은 섬으로 누리마루와 함께 유명한 산책로',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '부산 해운대구 우동',
          },
        ],
      },
      강릉: {
        맛집: [
          {
            name: '교동반점',
            description: '강릉 대표 짬뽕 맛집으로 50년 전통의 깊은 맛',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 교동',
          },
          {
            name: '안목커피거리',
            description: '바다를 바라보며 즐기는 커피 맛집들이 모인 거리',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 견소동',
          },
          {
            name: '강문해변 회센터',
            description: '강릉 동해안 신선한 해산물을 즐길 수 있는 대표 회센터',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 강문동',
          },
          {
            name: '순두부촌',
            description: '강릉 대표 향토음식 순두부 전문 맛집 단지',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 초당동',
          },
        ],
        액티비티: [
          {
            name: '강릉 서퍼비치',
            description:
              '동해안 최고의 서핑 스팟으로 서핑 강습과 장비 대여 가능',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 사천면',
          },
          {
            name: '정동진 레일바이크',
            description: '바다를 따라 달리는 레일바이크로 동해의 절경 감상',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 강동면',
          },
          {
            name: '강릉 스카이다이빙',
            description: '하늘에서 내려다보는 동해안의 아름다운 전경',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 성산면',
          },
          {
            name: '오죽헌 전통체험',
            description: '율곡 이이와 신사임당의 생가에서 전통문화 체험',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 죽헌동',
          },
        ],
        관광명소: [
          {
            name: '정동진역',
            description: '바다와 가장 가까운 기차역으로 일출 명소',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 강동면',
          },
          {
            name: '경포대',
            description: '강릉의 대표 관광지로 경포호와 동해를 동시에 감상',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 운정동',
          },
          {
            name: '선교장',
            description: '조선시대 상류층 가옥을 그대로 보존한 중요민속문화재',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 운정동',
          },
          {
            name: '참소리축음기박물관',
            description: '세계 각국의 축음기와 음반을 전시한 독특한 박물관',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '강릉시 경포로',
          },
        ],
      },
      서울: {
        맛집: [
          {
            name: '광장시장 빈대떡',
            description: '서울 대표 전통시장의 유명한 빈대떡과 마약김밥 맛집',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '서울 종로구 종로5가',
          },
          {
            name: '명동교자',
            description: '서울 명동의 대표 만두 전문점으로 50년 전통',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '서울 중구 명동2가',
          },
          {
            name: '이태원 맛집거리',
            description: '세계 각국의 음식을 맛볼 수 있는 다국적 음식 거리',
            category: '맛집',
            verified: true,
            source: 'https://example.com',
            address: '서울 용산구 이태원동',
          },
        ],
        액티비티: [
          {
            name: '한강 자전거투어',
            description: '한강을 따라 자전거로 서울의 명소들을 둘러보는 투어',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '서울 영등포구 여의도동',
          },
          {
            name: '롯데월드타워 스카이데크',
            description: '서울 최고층에서 즐기는 도시 전망과 스릴 체험',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '서울 송파구 신천동',
          },
          {
            name: '북촌한옥마을 투어',
            description: '전통 한옥과 현대가 어우러진 서울의 대표 문화 체험',
            category: '액티비티',
            verified: true,
            source: 'https://example.com',
            address: '서울 종로구 계동',
          },
        ],
        관광명소: [
          {
            name: '경복궁',
            description: '조선왕조의 정궁으로 서울 대표 고궁',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '서울 종로구 세종로',
          },
          {
            name: 'N서울타워',
            description: '서울의 랜드마크 타워로 야경이 아름다운 전망대',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '서울 용산구 용산동2가',
          },
          {
            name: '동대문디자인플라자',
            description: '자하 하디드가 설계한 현대적 디자인의 복합문화공간',
            category: '관광명소',
            verified: true,
            source: 'https://example.com',
            address: '서울 중구 을지로7가',
          },
        ],
      },
    };

    // 목적지별 데이터 반환
    for (const [key, data] of Object.entries(mockData)) {
      if (destination.includes(key)) {
        return data[category] || [];
      }
    }

    // 대체 데이터로 더 구체적인 이름 생성
    const specificNames = this.generateSpecificFallbackNames(
      destination,
      category,
    );
    return specificNames;
  }

  /**
   * 중복 장소 제거
   */
  private removeDuplicates(places: PlaceInfo[]): PlaceInfo[] {
    const seen = new Set<string>();
    return places.filter((place) => {
      const key = place.name.toLowerCase().replace(/\s+/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * 제목에서 장소명 추출 - 개선된 로직
   */
  private extractPlaceName(title: string): string {
    // 다양한 패턴으로 실제 장소명 추출
    let placeName = title;

    // 일반적인 패턴 제거
    placeName = placeName.split(' - ')[0];
    placeName = placeName.split(' | ')[0];
    placeName = placeName.split('::')[0];
    placeName = placeName.split('【')[0];
    placeName = placeName.split('[')[0];
    placeName = placeName.split('(')[0];

    // 불필요한 단어 제거
    const removeWords = [
      '추천',
      '맛집',
      '관광지',
      '액티비티',
      '체험',
      '투어',
      '여행',
    ];
    removeWords.forEach((word) => {
      const regex = new RegExp(`\\s*${word}\\s*`, 'g');
      placeName = placeName.replace(regex, ' ');
    });

    return placeName.trim();
  }

  /**
   * 스니펫에서 주소 추출
   */
  private extractAddress(snippet: string): string {
    // 더 정확한 주소 패턴 매칭
    const patterns = [
      /[가-힣]+시\s+[가-힣]+구\s+[가-힣]+동/g,
      /[가-힣]+도\s+[가-힣]+시\s+[가-힣]+읍/g,
      /[가-힣]+구\s+[가-힣]+동/g,
    ];

    for (const pattern of patterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '';
  }

  /**
   * 검색 결과로부터 설명 생성
   */
  private generateDescription(snippet: string, category: string): string {
    // 스니펫에서 유용한 정보 추출하여 설명 생성
    let description = snippet.substring(0, 100);

    // 카테고리별 키워드 강조
    const keywords = {
      맛집: ['맛있는', '유명한', '전통', '현지', '인기'],
      액티비티: ['체험', '즐길', '재미있는', '흥미로운', '특별한'],
      관광명소: ['아름다운', '유명한', '역사적', '문화적', '볼거리'],
    };

    return description + '...';
  }

  /**
   * 구체적인 대체 장소명 생성
   */
  private generateSpecificFallbackNames(
    destination: string,
    category: string,
  ): PlaceInfo[] {
    const fallbackPatterns: { [key: string]: string[] } = {
      맛집: [
        `${destination} 향토음식점`,
        `${destination} 전통맛집`,
        `${destination} 현지식당`,
      ],
      액티비티: [
        `${destination} 체험센터`,
        `${destination} 레저시설`,
        `${destination} 투어프로그램`,
      ],
      관광명소: [
        `${destination} 문화유적지`,
        `${destination} 자연명소`,
        `${destination} 역사유적`,
      ],
    };

    const patterns = fallbackPatterns[category] || [
      `${destination} ${category}`,
    ];

    return patterns.map((name: string, index: number) => ({
      name: name,
      description: `${destination}에서 인기 있는 ${category} 중 하나입니다. 현지에서 정확한 정보를 확인해보세요.`,
      category: category,
      verified: false,
      source: 'fallback',
      address: destination,
    }));
  }

  /**
   * 대체 장소 정보 (검색 실패시) - 개선된 버전
   */
  private getFallbackPlaces(
    destination: string,
    category: string,
  ): PlaceInfo[] {
    return this.generateSpecificFallbackNames(destination, category);
  }
}

// 싱글톤 인스턴스 생성
const webSearchService = new WebSearchService();

export default webSearchService;
