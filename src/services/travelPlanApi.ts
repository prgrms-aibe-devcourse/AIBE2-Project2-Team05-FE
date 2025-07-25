import {
  CreateTravelPlanRequest,
  TravelPlanResponse,
  TravelPlanFormData,
} from '../types/plan';

// 백엔드 API 기본 URL - 환경변수로 관리
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// API 헤더 설정
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // 인증 토큰이 필요한 경우 추가
  // 'Authorization': `Bearer ${getToken()}`,
});

// FormData를 API 요청 형태로 변환하는 함수
export const transformFormDataToRequest = (
  formData: TravelPlanFormData,
): CreateTravelPlanRequest => {
  return {
    title: formData.title,
    destination: formData.destination,
    startDate: formData.startDate,
    endDate: formData.endDate,
    budget: formData.budget,
    peopleCount: formData.peopleCount,
    travelStyles: formData.travelStyles,
    dayPlans: formData.dayPlans.map((day) => ({
      dayNumber: day.dayNumber,
      date: day.date,
      scheduleItems: day.scheduleItems.map((item) => ({
        time: item.time,
        place: item.place,
        activity: item.activity,
        memo: item.memo,
        cost: item.cost,
      })),
    })),
    isMatchingEnabled: formData.isMatchingEnabled,
    matchingSettings: formData.isMatchingEnabled
      ? {
          ageRange: formData.matchingAgeRange,
          gender: formData.matchingGender,
          language: formData.matchingLanguage,
          memo: formData.matchingMemo,
        }
      : undefined,
    additionalInfo: {
      accommodation: formData.accommodation,
      transportation: formData.transportation,
      memo: formData.extraMemo,
    },
  };
};

// 여행 계획 생성
export const createTravelPlan = async (
  formData: TravelPlanFormData,
): Promise<TravelPlanResponse> => {
  const requestData = transformFormDataToRequest(formData);

  try {
    // TODO: 백엔드 API 연결 시 실제 구현
    const response = await fetch(`${API_BASE_URL}/api/travel-plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: TravelPlanResponse = await response.json();
    return data;
  } catch (error) {
    console.error('여행 계획 생성 실패:', error);

    // 현재는 모킹된 응답 반환 (백엔드 연결 전까지)
    return mockCreateTravelPlan(requestData);
  }
};

// 여행 계획 수정
export const updateTravelPlan = async (
  id: string,
  formData: TravelPlanFormData,
): Promise<TravelPlanResponse> => {
  const requestData = transformFormDataToRequest(formData);

  try {
    // TODO: 백엔드 API 연결 시 실제 구현
    const response = await fetch(`${API_BASE_URL}/api/travel-plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: TravelPlanResponse = await response.json();
    return data;
  } catch (error) {
    console.error('여행 계획 수정 실패:', error);

    // 현재는 모킹된 응답 반환 (백엔드 연결 전까지)
    return mockUpdateTravelPlan(id, requestData);
  }
};

// 여행 계획 삭제
export const deleteTravelPlan = async (id: string): Promise<void> => {
  try {
    // TODO: 백엔드 API 연결 시 실제 구현
    const response = await fetch(`${API_BASE_URL}/api/travel-plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
  } catch (error) {
    console.error('여행 계획 삭제 실패:', error);

    // 현재는 모킹된 응답 (백엔드 연결 전까지)
    console.log('모킹된 삭제 완료');
  }
};

// 여행 계획 조회
export const getTravelPlan = async (
  id: string,
): Promise<TravelPlanResponse> => {
  try {
    // TODO: 백엔드 API 연결 시 실제 구현
    const response = await fetch(`${API_BASE_URL}/api/travel-plans/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: TravelPlanResponse = await response.json();
    return data;
  } catch (error) {
    console.error('여행 계획 조회 실패:', error);

    // 현재는 모킹된 응답 반환 (백엔드 연결 전까지)
    return mockGetTravelPlan(id);
  }
};

// 임시 저장
export const saveTravelPlanDraft = async (
  formData: TravelPlanFormData,
): Promise<{ id: string }> => {
  try {
    // TODO: 백엔드 API 연결 시 실제 구현
    const response = await fetch(`${API_BASE_URL}/api/travel-plans/draft`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('임시 저장 실패:', error);

    // 현재는 모킹된 응답 반환 (백엔드 연결 전까지)
    return { id: 'draft_' + Date.now() };
  }
};

// === 모킹 함수들 (백엔드 연결 전까지 사용) ===

const mockCreateTravelPlan = async (
  requestData: CreateTravelPlanRequest,
): Promise<TravelPlanResponse> => {
  // 실제 백엔드 연결 전까지 사용할 모킹 함수
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션

  return {
    id: 'plan_' + Date.now(),
    ...requestData,
    dayPlans: requestData.dayPlans.map((day, index) => ({
      id: `day_${index}_${Date.now()}`,
      ...day,
      scheduleItems: day.scheduleItems.map((item, itemIndex) => ({
        id: `item_${index}_${itemIndex}_${Date.now()}`,
        ...item,
      })),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'current_user_id', // 실제로는 인증된 사용자 ID
  };
};

const mockUpdateTravelPlan = async (
  id: string,
  requestData: CreateTravelPlanRequest,
): Promise<TravelPlanResponse> => {
  // 실제 백엔드 연결 전까지 사용할 모킹 함수
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션

  return {
    id,
    ...requestData,
    dayPlans: requestData.dayPlans.map((day, index) => ({
      id: `day_${index}_${Date.now()}`,
      ...day,
      scheduleItems: day.scheduleItems.map((item, itemIndex) => ({
        id: `item_${index}_${itemIndex}_${Date.now()}`,
        ...item,
      })),
    })),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 하루 전
    updatedAt: new Date().toISOString(),
    authorId: 'current_user_id',
  };
};

const mockGetTravelPlan = async (id: string): Promise<TravelPlanResponse> => {
  // 실제 백엔드 연결 전까지 사용할 모킹 함수
  await new Promise((resolve) => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션

  return {
    id,
    title: '제주도 힐링 여행',
    destination: '제주도',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    budget: 500000,
    peopleCount: 2,
    travelStyles: ['relaxation', 'nature', 'food'],
    dayPlans: [
      {
        id: 'day_1',
        dayNumber: 1,
        date: '2024-03-15',
        scheduleItems: [
          {
            id: 'item_1_1',
            time: '09:00',
            place: '제주공항',
            activity: '항공편 도착',
            memo: '렌터카 픽업',
            cost: 0,
          },
        ],
      },
    ],
    isMatchingEnabled: true,
    matchingSettings: {
      ageRange: '20-30',
      gender: 'any',
      language: 'korean',
      memo: '함께 여행할 동반자를 찾습니다.',
    },
    additionalInfo: {
      accommodation: '제주 리조트 호텔',
      transportation: '렌터카',
      memo: '맛집 위주로 여행하고 싶어요.',
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'current_user_id',
  };
};

// 폼 유효성 검증 함수
export const validateTravelPlanForm = (
  formData: TravelPlanFormData,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // 필수 필드 검증
  if (!formData.title.trim()) {
    errors.title = '여행 제목을 입력해주세요.';
  }

  if (!formData.destination.trim()) {
    errors.destination = '여행지를 입력해주세요.';
  }

  if (!formData.startDate) {
    errors.startDate = '여행 시작일을 선택해주세요.';
  }

  if (!formData.endDate) {
    errors.endDate = '여행 종료일을 선택해주세요.';
  }

  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      errors.endDate = '종료일은 시작일보다 늦어야 합니다.';
    }
  }

  if (formData.budget < 0) {
    errors.budget = '예산은 0원 이상이어야 합니다.';
  }

  if (formData.peopleCount < 1) {
    errors.peopleCount = '인원 수는 1명 이상이어야 합니다.';
  }

  if (formData.travelStyles.length === 0) {
    errors.travelStyles = '여행 스타일을 하나 이상 선택해주세요.';
  }

  if (formData.dayPlans.length === 0) {
    errors.dayPlans = '최소 하나의 일정을 추가해주세요.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
