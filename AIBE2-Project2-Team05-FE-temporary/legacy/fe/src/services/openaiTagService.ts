/**
 * OpenAI를 사용한 여행 목적지 카테고리 태그 생성 서비스
 */

interface EventTagAnalysis {
  title: string;
  location: string;
  description: string;
}

interface TagResponse {
  tags: string[];
  category: string;
  confidence: number;
}

class OpenAITagService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // 환경변수에서 API 키 가져오기 (개발용)
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  }

  /**
   * 여행 이벤트 정보를 분석하여 적절한 태그들을 생성합니다
   * @param eventInfo 이벤트 정보 (제목, 위치, 설명)
   * @returns Promise<TagResponse> 생성된 태그와 메인 카테고리
   */
  async generateEventTags(eventInfo: EventTagAnalysis): Promise<TagResponse> {
    const prompt = `
다음 여행 일정을 분석하고 적절한 카테고리 태그 3-4개를 한국어로 생성해주세요:

제목: ${eventInfo.title}
위치: ${eventInfo.location}
설명: ${eventInfo.description}

요구사항:
1. 해당 활동의 성격을 잘 나타내는 태그 3-4개 (최대 4개)
2. 태그는 2-4글자의 간단한 한국어 단어
3. 메인 카테고리 1개 (교통, 관광, 맛집, 액티비티, 숙박, 문화, 자연, 쇼핑, 휴식 중 하나)
4. 신뢰도 점수 (1-100)

다음 JSON 형식으로만 응답해주세요:
{
  "tags": ["태그1", "태그2", "태그3"],
  "category": "메인카테고리", 
  "confidence": 95
}

예시:
- "부산역 집결" → {"tags": ["교통", "만남", "시작"], "category": "교통", "confidence": 90}
- "해동 용궁사 탐방" → {"tags": ["문화", "사찰", "관광", "역사"], "category": "문화", "confidence": 95}
- "자갈치 시장 맛집" → {"tags": ["맛집", "시장", "해산물"], "category": "맛집", "confidence": 92}
`;

    try {
      const response = await fetch(this.apiUrl, {
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
              content:
                '당신은 여행 전문가로서 여행 일정을 분석하고 적절한 카테고리 태그를 생성하는 역할을 합니다. 항상 정확한 JSON 형식으로만 응답하세요.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.3, // 일관성을 위해 낮은 temperature
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI 응답이 비어있습니다');
      }

      // JSON 파싱
      try {
        const parsedResponse = JSON.parse(content);

        // 응답 검증
        if (!parsedResponse.tags || !Array.isArray(parsedResponse.tags)) {
          throw new Error('잘못된 태그 형식');
        }

        return {
          tags: parsedResponse.tags.slice(0, 4), // 최대 4개로 제한
          category: parsedResponse.category || '기타',
          confidence: parsedResponse.confidence || 70,
        };
      } catch (parseError) {
        console.error('OpenAI 응답 파싱 실패:', parseError);
        throw new Error('OpenAI 응답을 파싱할 수 없습니다');
      }
    } catch (error) {
      console.error('OpenAI 태그 생성 실패:', error);

      // 폴백: 기본 태그 생성
      return this.generateFallbackTags(eventInfo);
    }
  }

  /**
   * OpenAI 실패시 폴백으로 사용할 기본 태그 생성
   * @param eventInfo 이벤트 정보
   * @returns 기본 태그
   */
  private generateFallbackTags(eventInfo: EventTagAnalysis): TagResponse {
    const { title, location, description } = eventInfo;
    const text = `${title} ${location} ${description}`.toLowerCase();

    // 키워드 기반 간단한 분류
    let tags: string[] = [];
    let category = '기타';

    if (
      text.includes('역') ||
      text.includes('공항') ||
      text.includes('터미널') ||
      text.includes('집결')
    ) {
      tags = ['교통', '이동', '만남'];
      category = '교통';
    } else if (
      text.includes('맛집') ||
      text.includes('음식') ||
      text.includes('카페') ||
      text.includes('식당')
    ) {
      tags = ['맛집', '음식', '미식'];
      category = '맛집';
    } else if (
      text.includes('사찰') ||
      text.includes('궁') ||
      text.includes('박물관') ||
      text.includes('문화')
    ) {
      tags = ['문화', '역사', '관광'];
      category = '문화';
    } else if (
      text.includes('해변') ||
      text.includes('산') ||
      text.includes('공원') ||
      text.includes('자연')
    ) {
      tags = ['자연', '힐링', '경관'];
      category = '자연';
    } else if (
      text.includes('쇼핑') ||
      text.includes('시장') ||
      text.includes('몰')
    ) {
      tags = ['쇼핑', '구매', '체험'];
      category = '쇼핑';
    } else {
      tags = ['관광', '체험', '여행'];
      category = '관광';
    }

    return {
      tags,
      category,
      confidence: 60, // 폴백이므로 낮은 신뢰도
    };
  }

  /**
   * 여러 이벤트를 배치로 처리합니다
   * @param events 이벤트 배열
   * @returns Promise<TagResponse[]> 태그 응답 배열
   */
  async generateBatchTags(events: EventTagAnalysis[]): Promise<TagResponse[]> {
    const results = await Promise.allSettled(
      events.map((event) => this.generateEventTags(event)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`이벤트 ${index} 태그 생성 실패:`, result.reason);
        return this.generateFallbackTags(events[index]);
      }
    });
  }
}

export const openaiTagService = new OpenAITagService();
export type { EventTagAnalysis, TagResponse };
