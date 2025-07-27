// 카카오맵 API 키워드 검색 서비스
interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  category_name: string;
  phone: string;
  place_url: string;
  distance?: string;
}

interface CategorySearchResult {
  category: 'restaurant' | 'activity' | 'attraction';
  places: KakaoPlace[];
}

class KakaoMapService {
  /**
   * 목적지 기반 카테고리별 키워드 검색
   * @param destination 목적지명 (예: "제주도", "부산", "강릉")
   * @param categories 검색할 카테고리 배열
   * @returns 카테고리별 장소 검색 결과
   */
  async searchPlacesByCategory(
    destination: string,
    categories: ('restaurant' | 'activity' | 'attraction')[] = [
      'restaurant',
      'activity',
      'attraction',
    ],
  ): Promise<CategorySearchResult[]> {
    if (!window.kakao) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.');
      return [];
    }

    const results: CategorySearchResult[] = [];

    // 카테고리별 키워드 매핑
    const categoryKeywords = this.getCategoryKeywords(destination);

    for (const category of categories) {
      try {
        const keywords = categoryKeywords[category];
        const places = await this.searchMultipleKeywords(keywords);

        results.push({
          category,
          places: places.slice(0, 15), // 각 카테고리당 최대 15개로 제한
        });

        console.log(`📍 ${category} 검색 완료: ${places.length}개 장소 발견`);
      } catch (error) {
        console.error(`❌ ${category} 검색 실패:`, error);
        results.push({ category, places: [] });
      }
    }

    return results;
  }

  /**
   * 목적지와 카테고리에 따른 검색 키워드 생성
   */
  private getCategoryKeywords(
    destination: string,
  ): Record<'restaurant' | 'activity' | 'attraction', string[]> {
    const baseKeywords = {
      restaurant: [
        `${destination} 맛집`,
        `${destination} 음식점`,
        `${destination} 현지맛집`,
        `${destination} 카페`,
        `${destination} 맛있는집`,
      ],
      activity: [
        `${destination} 체험`,
        `${destination} 액티비티`,
        `${destination} 놀거리`,
        `${destination} 투어`,
        `${destination} 레저`,
      ],
      attraction: [
        `${destination} 관광지`,
        `${destination} 명소`,
        `${destination} 볼거리`,
        `${destination} 여행지`,
        `${destination} 랜드마크`,
      ],
    };

    // 지역별 특화 키워드 추가
    const specializedKeywords = this.getSpecializedKeywords(destination);

    return {
      restaurant: [
        ...baseKeywords.restaurant,
        ...specializedKeywords.restaurant,
      ],
      activity: [...baseKeywords.activity, ...specializedKeywords.activity],
      attraction: [
        ...baseKeywords.attraction,
        ...specializedKeywords.attraction,
      ],
    };
  }

  /**
   * 지역별 특화 키워드
   */
  private getSpecializedKeywords(
    destination: string,
  ): Record<'restaurant' | 'activity' | 'attraction', string[]> {
    const specialKeys: Record<string, any> = {
      제주도: {
        restaurant: [
          '제주 흑돼지',
          '제주 해산물',
          '제주 오메기떡',
          '제주 감귤',
        ],
        activity: [
          '제주 승마',
          '제주 다이빙',
          '제주 패러글라이딩',
          '제주 올레길',
        ],
        attraction: ['성산일출봉', '한라산', '우도', '섭지코지'],
      },
      제주: {
        restaurant: [
          '제주 흑돼지',
          '제주 해산물',
          '제주 오메기떡',
          '제주 감귤',
        ],
        activity: [
          '제주 승마',
          '제주 다이빙',
          '제주 패러글라이딩',
          '제주 올레길',
        ],
        attraction: ['성산일출봉', '한라산', '우도', '섭지코지'],
      },
      부산: {
        restaurant: ['부산 회', '부산 밀면', '부산 씨앗호떡', '광안리 맛집'],
        activity: ['부산 해수욕', '부산 크루즈', '부산 온천', '부산 야경투어'],
        attraction: ['광안대교', '해운대', '감천문화마을', '태종대'],
      },
      서울: {
        restaurant: ['서울 한정식', '홍대 맛집', '강남 맛집', '명동 맛집'],
        activity: ['서울 한강', '서울 쇼핑', '서울 야경', '서울 궁궐투어'],
        attraction: ['경복궁', 'N서울타워', '명동', '동대문'],
      },
      강릉: {
        restaurant: [
          '강릉 회',
          '강릉 초당두부',
          '강릉 커피',
          '강릉 감자옹심이',
        ],
        activity: ['강릉 해수욕', '강릉 바이크', '강릉 바다낚시', '강릉 서핑'],
        attraction: ['경포대', '정동진', '오죽헌', '안반데기'],
      },
      전주: {
        restaurant: [
          '전주 비빔밥',
          '전주 한정식',
          '전주 콩나물국밥',
          '전주 막걸리',
        ],
        activity: [
          '전주 한복체험',
          '전주 한옥마을',
          '전주 전통공예',
          '전주 문화체험',
        ],
        attraction: ['전주 한옥마을', '경기전', '오목대', '한국전통문화전당'],
      },
      // 해외 지역
      일본: {
        restaurant: [
          '일본 라멘',
          '일본 스시',
          '일본 이자카야',
          '일본 현지맛집',
        ],
        activity: ['일본 온천', '일본 쇼핑', '일본 테마파크', '일본 문화체험'],
        attraction: ['일본 신사', '일본 성', '일본 정원', '일본 박물관'],
      },
      도쿄: {
        restaurant: ['도쿄 라멘', '도쿄 스시', '시부야 맛집', '하라주쿠 맛집'],
        activity: [
          '도쿄 쇼핑',
          '도쿄 디즈니랜드',
          '도쿄 온천',
          '도쿄 야경투어',
        ],
        attraction: ['도쿄 스카이트리', '아사쿠사', '시부야', '메이지 신궁'],
      },
    };

    return (
      specialKeys[destination] || {
        restaurant: [],
        activity: [],
        attraction: [],
      }
    );
  }

  /**
   * 여러 키워드로 동시 검색하고 결과 통합
   */
  private async searchMultipleKeywords(
    keywords: string[],
  ): Promise<KakaoPlace[]> {
    const allPlaces: KakaoPlace[] = [];
    const uniquePlaces = new Map<string, KakaoPlace>();

    for (const keyword of keywords) {
      try {
        const places = await this.searchKeyword(keyword);
        places.forEach((place) => {
          // 중복 제거 (place_name과 address로 판단)
          const key = `${place.place_name}_${place.address_name}`;
          if (!uniquePlaces.has(key)) {
            uniquePlaces.set(key, place);
          }
        });
      } catch (error) {
        console.warn(`키워드 "${keyword}" 검색 실패:`, error);
      }
    }

    return Array.from(uniquePlaces.values());
  }

  /**
   * 단일 키워드로 장소 검색
   */
  private searchKeyword(keyword: string): Promise<KakaoPlace[]> {
    return new Promise((resolve, reject) => {
      if (!window.kakao) {
        reject(new Error('카카오맵 SDK가 로드되지 않았습니다.'));
        return;
      }

      const { kakao } = window;
      const ps = new kakao.maps.services.Places();

      ps.keywordSearch(keyword, (data: any[], status: any, pagination: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const places: KakaoPlace[] = data.map((place: any) => ({
            id: place.id,
            place_name: place.place_name,
            address_name: place.address_name,
            road_address_name: place.road_address_name || place.address_name,
            x: place.x,
            y: place.y,
            category_name: place.category_name,
            phone: place.phone || '',
            place_url: place.place_url || '',
            distance: place.distance || '',
          }));

          resolve(places);
        } else {
          resolve([]); // 검색 결과가 없어도 빈 배열 반환
        }
      });
    });
  }

  /**
   * 좌표 기반 반경 검색 (향후 확장용)
   */
  async searchNearbyPlaces(
    lat: number,
    lng: number,
    radius: number = 5000,
    category: string,
  ): Promise<KakaoPlace[]> {
    return new Promise((resolve, reject) => {
      if (!window.kakao) {
        reject(new Error('카카오맵 SDK가 로드되지 않았습니다.'));
        return;
      }

      const { kakao } = window;
      const ps = new kakao.maps.services.Places();
      const location = new kakao.maps.LatLng(lat, lng);

      // 카테고리 코드 매핑
      const categoryCode = this.getCategoryCode(category);

      ps.categorySearch(
        categoryCode,
        (data: any[], status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const places: KakaoPlace[] = data.map((place: any) => ({
              id: place.id,
              place_name: place.place_name,
              address_name: place.address_name,
              road_address_name: place.road_address_name || place.address_name,
              x: place.x,
              y: place.y,
              category_name: place.category_name,
              phone: place.phone || '',
              place_url: place.place_url || '',
              distance: place.distance || '',
            }));

            resolve(places);
          } else {
            resolve([]);
          }
        },
        {
          location: location,
          radius: radius,
        },
      );
    });
  }

  /**
   * 카테고리명을 카카오맵 카테고리 코드로 변환
   */
  private getCategoryCode(category: string): string {
    const codes: Record<string, string> = {
      restaurant: 'FD6', // 음식점
      cafe: 'CE7', // 카페
      attraction: 'AT4', // 관광명소
      activity: 'CT1', // 문화시설
      hotel: 'AD5', // 숙박
      shopping: 'MT1', // 대형마트
    };

    return codes[category] || 'FD6';
  }
}

// 싱글톤 인스턴스 생성
const kakaoMapService = new KakaoMapService();

export default kakaoMapService;
export type { KakaoPlace, CategorySearchResult };
