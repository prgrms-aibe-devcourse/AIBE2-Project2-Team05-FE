import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PlaceSearchInput from '../components/PlaceSearchInput';
import * as S from './PlanWritePage.style';
import PlaceMap from '../components/PlaceMap';
import openaiService from '../services/openaiApi';
import matePostService from '../services/matePostService';
import travelPlanApiService, {
  TravelPlanData,
} from '../services/travelPlanApi'; // 백엔드 여행 계획 API
import { getDestinationRepresentativeImage } from '../services/backendPlacesApi'; // 백엔드 구글 플레이스 API 추가
import {
  TravelPlan,
  TravelDay,
  TravelEvent,
  Author,
  MatchingInfo,
  RecommendedPlace,
  AIRecommendationData,
} from '../types/plan';

// 일정 항목 타입 정의
interface ScheduleItem {
  id: string;
  time: string;
  place: string;
  activity: string;
  memo: string;
  cost: number;
}

// 폼 데이터 타입 정의
interface FormData {
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  budget: number;
  people: number;
  styles: string[];
  schedules: { [dayKey: string]: ScheduleItem[] };
  matchingEnabled: boolean;
  preferredGender: string;
  preferredAge: string;
  preferredLanguage: string;
  matchingMemo: string;
  accommodation: string;
  transportation: string;
  extraMemo: string;
}

const PlanWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // 현재 활성 탭
  const [activeTab, setActiveTab] = useState('day1');
  const [isLoading, setIsLoading] = useState(false);

  // 여행 기간에 따라 동적으로 days 생성하는 함수
  const calculateDaysArray = (
    startDate?: string,
    endDate?: string,
  ): string[] => {
    if (!startDate || !endDate) {
      return ['day1']; // 기본값
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return Array.from({ length: diffDays }, (_, i) => `day${i + 1}`);
  };

  // 폼 데이터 상태
  const [formData, setFormData] = useState<FormData>({
    title: '',
    startDate: '',
    endDate: '',
    destination: '',
    budget: 0,
    people: 1,
    styles: [],
    schedules: {
      day1: [],
      day2: [],
      day3: [],
    },
    matchingEnabled: true, // 기본값을 true로 설정
    preferredGender: '',
    preferredAge: '',
    preferredLanguage: 'korean',
    matchingMemo: '',
    accommodation: '',
    transportation: '',
    extraMemo: '',
  });

  // 수동으로 관리하는 days 배열 상태 (초기값: day1만)
  const [days, setDays] = useState<string[]>(['day1']);

  // Day 추가 함수
  const addDay = () => {
    const nextDayNumber = days.length + 1;
    const nextDay = `day${nextDayNumber}`;

    setDays((prev) => [...prev, nextDay]);

    // 새로운 day에 빈 스케줄 배열 추가
    setFormData((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [nextDay]: [],
      },
    }));

    // 새로 추가된 day로 탭 이동
    setActiveTab(nextDay);
  };

  // Day 삭제 함수 (day1은 삭제 불가)
  const removeDay = (dayToRemove: string) => {
    if (dayToRemove === 'day1' || days.length <= 1) {
      return; // day1이거나 마지막 하나 남은 day는 삭제 불가
    }

    setDays((prev) => prev.filter((day) => day !== dayToRemove));

    // 스케줄에서도 해당 day 제거
    setFormData((prev) => {
      const newSchedules = { ...prev.schedules };
      delete newSchedules[dayToRemove];
      return {
        ...prev,
        schedules: newSchedules,
      };
    });

    // 삭제된 day가 현재 활성 탭이면 day1로 이동
    if (activeTab === dayToRemove) {
      setActiveTab('day1');
    }
  };

  // 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'trip-style') {
        setFormData((prev) => ({
          ...prev,
          styles: checkbox.checked
            ? [...prev.styles, value]
            : prev.styles.filter((style) => style !== value),
        }));
      } else if (name === 'matching-option') {
        setFormData((prev) => ({
          ...prev,
          matchingEnabled: checkbox.checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  // 일정 추가
  const addScheduleItem = (day: string) => {
    const newItem: ScheduleItem = {
      id: `${day}-${Date.now()}`,
      time: '',
      place: '',
      activity: '',
      memo: '',
      cost: 0,
    };

    setFormData((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: [...prev.schedules[day], newItem],
      },
    }));
  };

  // 일정 삭제
  const removeScheduleItem = (day: string, itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: prev.schedules[day].filter((item) => item.id !== itemId),
      },
    }));
  };

  // 일정 업데이트
  const updateScheduleItem = (
    day: string,
    itemId: string,
    field: keyof ScheduleItem,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: prev.schedules[day].map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  // 원래 여행지 구글 API
  const [initialPlace, setInitialPlace] = useState(null);

  // 여행 스타일 값을 사용자 친화적인 라벨로 변환
  const getStyleLabels = (styleValues: string[]): string[] => {
    const styleMap: { [key: string]: string } = {
      planned: '계획적',
      spontaneous: '즉흥적',
      tourism: '관광 중심',
      relaxation: '휴식 중심',
      food: '맛집 탐방',
      nature: '자연 체험',
      culture: '문화 체험',
      shopping: '쇼핑',
    };

    return styleValues.map((value) => styleMap[value] || value);
  };

  // 폼 저장 처리
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const planId = Date.now().toString();
      const currentUserId = 'current-user'; // 실제론 AuthContext에서 가져올 것

      // 저장된 프로필 정보 불러오기
      let userProfile = null;
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          userProfile = JSON.parse(savedProfile);
        }
      } catch (error) {
        console.error('프로필 정보 로드 실패:', error);
      }

      // 작성자 정보 설정 (프로필 정보가 있으면 사용, 없으면 기본값)
      const authorInfo = {
        id: currentUserId,
        name: userProfile?.nickname || userProfile?.name || '나',
        profileImage: userProfile?.profileImage || '👤',
      };

      // 현재 계획을 PlanPage에서 사용할 형식으로 변환
      const planData: any = {
        id: planId,
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination,
        budget: `${formData.budget}만원`,
        people: `${formData.people}명`,
        period: calculateDays(formData.startDate, formData.endDate),
        days: convertSchedulesToDays(),
        likes: 0,
        likedUsers: [],
        isLiked: false,
        author: authorInfo,
        // 여행 스타일 정보 추가 (라벨과 값 모두 저장)
        styles: formData.styles,
        styleLabels: getStyleLabels(formData.styles),
        // 매칭 정보
        matchingInfo: {
          preferredGender: formData.preferredGender,
          preferredAge: formData.preferredAge,
          preferredLanguage: formData.preferredLanguage,
          matchingMemo: formData.matchingMemo,
        },
        // 추가 정보
        accommodation: formData.accommodation,
        transportation: formData.transportation,
        extraMemo: formData.extraMemo,
        createdAt: new Date().toISOString(),
      };

      // OpenAI 서비스를 통해 해시태그와 근처 관광지 추천 받기
      toast.loading('AI로 여행 계획을 분석하여 맞춤 추천을 생성하는 중...', {
        id: 'ai-analysis',
      });

      try {
        // 🛡️ 안전한 순차 처리로 변경 (병렬 처리 시 오류 발생 가능성 낮춤)
        console.log('🤖 AI 해시태그 생성 시작...');
        let aiHashtags: string[] = [];
        let nearbyRecommendations: any[] = [];

        try {
          aiHashtags = await openaiService.generateHashtags({
            title: formData.title,
            destination: formData.destination,
            days: Object.values(formData.schedules).map(
              (daySchedule, index) => ({
                events: daySchedule.map((item) => ({
                  time: item.time,
                  place: item.place,
                  activity: item.activity,
                  memo: item.memo,
                })),
              }),
            ),
            styles: getStyleLabels(formData.styles),
          });
          console.log('✅ AI 해시태그 생성 성공:', aiHashtags.length, '개');
        } catch (hashError) {
          console.error('⚠️ AI 해시태그 생성 실패:', hashError);
          aiHashtags = [
            `#${formData.destination}여행`,
            `#${getStyleLabels(formData.styles)[0] || '여행'}`,
          ];
        }

        console.log('🤖 AI 추천 장소 생성 시작...');
        try {
          nearbyRecommendations =
            await openaiService.generateNearbyRecommendations(
              formData.destination,
              getStyleLabels(formData.styles),
              {
                days: Object.values(formData.schedules).map(
                  (daySchedule, index) => ({
                    events: daySchedule.map((item) => ({
                      time: item.time,
                      place: item.place,
                      activity: item.activity,
                      memo: item.memo,
                    })),
                  }),
                ),
              },
            );
          console.log(
            '✅ AI 추천 장소 생성 성공:',
            nearbyRecommendations.length,
            '개',
          );
        } catch (recommendError) {
          console.error('⚠️ AI 추천 장소 생성 실패:', recommendError);
          // 🔄 기본 추천 데이터 제공
          nearbyRecommendations = [
            {
              name: `${formData.destination} 관광명소`,
              description: `${formData.destination}의 유명한 관광지입니다.`,
              category: '관광명소',
              distance: '정보 없음',
              verified: false,
            },
            {
              name: `${formData.destination} 맛집`,
              description: `${formData.destination}의 현지 맛집을 추천합니다.`,
              category: '맛집',
              distance: '정보 없음',
              verified: false,
            },
          ];
        }

        // AI 추천 결과를 planData에 추가
        planData.aiHashtags = aiHashtags;
        planData.nearbyRecommendations = nearbyRecommendations;

        toast.success(
          `AI 분석 완료! 해시태그 ${aiHashtags.length}개와 추천 장소 ${nearbyRecommendations.length}개를 생성했습니다.`,
          { id: 'ai-analysis' },
        );
      } catch (error) {
        console.error('AI 분석 중 전체 오류:', error);
        toast.dismiss('ai-analysis');
        toast.error('AI 분석에 실패했지만 기본 데이터로 저장합니다.');

        // 🛡️ 완전 실패 시 기본 데이터 제공
        planData.aiHashtags = [`#${formData.destination}여행`];
        planData.nearbyRecommendations = [
          {
            name: `${formData.destination} 여행지`,
            description: '추후 더 자세한 정보를 제공할 예정입니다.',
            category: '관광명소',
            distance: '정보 없음',
            verified: false,
          },
        ];
      }

      // AI 추천 장소 생성 (한 번만 생성하여 저장)
      toast.loading('AI 맞춤 추천 장소를 생성하는 중...', {
        id: 'ai-recommendations',
      });

      try {
        console.log(
          '🤖 여행 플랜용 AI 추천 장소 생성 시작:',
          formData.destination,
        );

        // 방문 예정 장소 추출
        const visitedPlaces = Object.values(formData.schedules)
          .flat()
          .map((item) => item.place)
          .filter((place) => place && place.trim() !== '');

        if (visitedPlaces.length > 0) {
          // 간단한 여행 계획 객체 구성
          const simplePlan = {
            days: [
              {
                events: visitedPlaces.map((place, index) => ({
                  id: index + 1,
                  location: place,
                  startTime: '09:00',
                  endTime: '12:00',
                })),
              },
            ],
          };

          const aiRecommendations =
            await openaiService.generateNearbyRecommendations(
              formData.destination,
              formData.styles || ['관광'],
              simplePlan,
            );

          // AI 추천 데이터를 planData에 저장
          const aiRecommendationData: AIRecommendationData = {
            recommendations: aiRecommendations,
            generatedAt: new Date().toISOString(),
            destination: formData.destination,
            visitedPlaces: visitedPlaces,
            travelStyles: formData.styles || ['관광'],
          };

          planData.nearbyRecommendations = aiRecommendations;

          toast.success(
            `✅ AI 추천 완료! ${aiRecommendations.length}개의 맞춤 장소를 추천받았습니다.`,
            { id: 'ai-recommendations' },
          );
          console.log(
            '🎉 AI 추천 장소 생성 완료:',
            aiRecommendations.length,
            '개',
          );
        } else {
          console.warn('⚠️ 방문 예정 장소가 없어 AI 추천을 생성하지 않습니다.');
          toast.dismiss('ai-recommendations');
        }
      } catch (error) {
        console.error('AI 추천 장소 생성 중 오류:', error);
        toast.dismiss('ai-recommendations');
        toast.error('AI 추천 생성에 실패했습니다. 나중에 다시 시도해주세요.');
        // AI 추천 실패해도 여행 계획 저장은 진행
      }

      // 구글 플레이스 API를 통해 대표 이미지 가져오기 (필수)
      toast.loading('여행지 대표 이미지를 불러오는 중...', {
        id: 'place-image',
      });

      let destinationImageUrl = '';

      try {
        console.log(
          `🔍 구글 플레이스 API로 이미지 검색: ${formData.destination}`,
        );

        const imageUrl = await getDestinationRepresentativeImage(
          formData.destination,
        );

        if (imageUrl && imageUrl !== 'NO_IMAGE') {
          destinationImageUrl = imageUrl;
          planData.imageUrl = imageUrl;

          toast.success('✅ 구글 플레이스에서 대표 이미지를 가져왔습니다!', {
            id: 'place-image',
          });
          console.log(
            `✅ 구글 플레이스 이미지 성공: ${formData.destination} -> ${imageUrl}`,
          );
        } else {
          // 구글 플레이스에서 이미지를 찾지 못한 경우
          destinationImageUrl = getPlaceholderImageUrl(formData.destination);
          planData.imageUrl = destinationImageUrl;

          toast.success('기본 이미지로 설정되었습니다.', {
            id: 'place-image',
          });
          console.warn(
            `⚠️ 구글 플레이스에서 이미지 없음, placeholder 사용: ${formData.destination}`,
          );
        }
      } catch (error) {
        console.error('구글 플레이스 API 오류:', error);

        // API 실패시 placeholder 이미지 사용
        destinationImageUrl = getPlaceholderImageUrl(formData.destination);
        planData.imageUrl = destinationImageUrl;

        toast.dismiss('place-image');
        toast.error(
          '구글 플레이스 API 오류가 발생했습니다. 기본 이미지를 사용합니다.',
        );
        console.error(
          `❌ 구글 플레이스 API 실패, placeholder 사용: ${formData.destination} -> ${destinationImageUrl}`,
        );
      }

      // 🚀 백엔드 API에 여행 계획 저장 (우선)
      console.log('💾 백엔드에 여행 계획 저장 시작...');

      try {
        // 백엔드 API 형식으로 데이터 변환
        const travelPlanData: TravelPlanData = {
          planId: planId,
          userId: currentUserId,
          title: formData.title,
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          period: calculateDays(
            formData.startDate,
            formData.endDate,
          ).toString(),
          budget: `${formData.budget}`,
          people: `${formData.people}`,
          styles: formData.styles,
          styleLabels: getStyleLabels(formData.styles),
          matchingInfo: formData.matchingEnabled
            ? {
                preferredGender: formData.preferredGender,
                preferredAge: formData.preferredAge,
                preferredLanguage: formData.preferredLanguage,
                matchingMemo: formData.matchingMemo,
              }
            : undefined,
          author: authorInfo,
          schedules: formData.schedules,
          aiHashtags: planData.aiHashtags,
          nearbyRecommendations: planData.nearbyRecommendations,
          imageUrl: destinationImageUrl,
          accommodationInfo: formData.accommodation,
          transportationInfo: formData.transportation,
        };

        // 백엔드 API 호출
        const savedPlan =
          await travelPlanApiService.saveTravelPlan(travelPlanData);
        console.log('✅ 백엔드 저장 성공:', savedPlan.planId);

        // 성공 시 localStorage에도 저장 (동기화)
        localStorage.setItem(
          'currentTravelPlan',
          JSON.stringify({
            ...planData,
            planId: savedPlan.planId, // 백엔드에서 받은 실제 ID 사용
          }),
        );

        console.log('🎉 백엔드와 로컬스토리지 모두 저장 완료');

        // 저장 성공 후 프로필 페이지로 이동하여 새로운 피드 확인
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } catch (backendError) {
        console.error('❌ 백엔드 저장 실패, 로컬스토리지 폴백:', backendError);

        // 백엔드 실패 시 로컬스토리지에만 저장
        localStorage.setItem('currentTravelPlan', JSON.stringify(planData));
        console.log('💾 로컬스토리지 폴백 저장 완료');
      }

      // 1. 프로필 피드 데이터 생성
      const profileFeedData = {
        id: parseInt(planId),
        author: authorInfo.name,
        avatar: authorInfo.profileImage,
        image: destinationImageUrl, // 구글 플레이스 API 또는 placeholder 이미지 사용
        likes: 0,
        caption: `${planData.destination} ${planData.period} 여행 계획을 세웠어요! 🏖️\n${planData.title}\n📅 ${planData.startDate} ~ ${planData.endDate}\n💰 예산: ${planData.budget}\n👥 인원: ${planData.people}`,
        type: 'travel-plan',
        planId: planData.id,
        createdAt: planData.createdAt,
      };

      // 2. 프로필 피드에 저장 (현재 사용자)
      const existingFeeds = JSON.parse(localStorage.getItem('myFeeds') || '[]');
      const updatedFeeds = [profileFeedData, ...existingFeeds];
      localStorage.setItem('myFeeds', JSON.stringify(updatedFeeds));

      // 3. 여행메이트 찾기 자동 등록/해제 (새로운 서비스 사용)
      try {
        console.log('🎯 여행메이트 등록 시도:', {
          matchingEnabled: formData.matchingEnabled,
          planId: planId,
          planTitle: planData.title,
          planDestination: planData.destination,
        });

        const mateRegistrationSuccess = matePostService.autoRegisterMatePost(
          planData,
          formData.matchingEnabled,
        );

        if (mateRegistrationSuccess && formData.matchingEnabled) {
          console.log('✅ 여행메이트 찾기에 성공적으로 등록되었습니다.');

          // 등록 확인
          const allMatePosts = matePostService.getAllMatePosts();
          console.log(
            '📋 현재 등록된 여행메이트 포스트 수:',
            allMatePosts.length,
          );

          const myMatePost = allMatePosts.find(
            (post) => post.planId === planId,
          );
          if (myMatePost) {
            console.log('🎉 방금 등록한 포스트 확인됨:', myMatePost);
          } else {
            console.warn('⚠️ 등록한 포스트를 찾을 수 없습니다.');
          }
        } else if (mateRegistrationSuccess && !formData.matchingEnabled) {
          console.log('🚫 여행메이트 찾기 등록이 해제되었습니다.');
        } else {
          console.warn('❌ 여행메이트 등록에 실패했습니다.');
        }
      } catch (error) {
        console.error('여행메이트 등록 처리 중 오류:', error);
        // 메이트 등록 실패해도 계획 저장은 진행
      }

      // 4. 개별 계획 저장 (다른 사용자가 참조할 수 있도록)
      localStorage.setItem(`plan_${planId}`, JSON.stringify(planData));

      // 성공 메시지 생성
      const successMessage = isEditMode
        ? '여행 계획이 수정되었습니다!'
        : formData.matchingEnabled
          ? '여행 계획이 작성되었습니다! 🎉\n✅ 프로필에 추가됨\n✅ 메이트 찾기에 등록됨'
          : '여행 계획이 작성되었습니다! 🎉\n✅ 프로필에 추가됨';

      toast.success(successMessage);

      // 계획 보기 페이지로 이동
      navigate('/plan');
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜 차이 계산 함수
  const calculateDays = (start: string, end: string): string => {
    if (!start || !end) return '';

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return `${diffDays}일`;
  };

  // 스케줄을 PlanPage 형식으로 변환
  const convertSchedulesToDays = () => {
    const planDays: any[] = [];
    let dayIndex = 1;

    days.forEach((dayKey) => {
      const scheduleItems = formData.schedules[dayKey];
      if (scheduleItems && scheduleItems.length > 0) {
        const events = scheduleItems.map((item, index) => ({
          id: `${dayKey}-${index}`,
          time: item.time,
          title: item.activity || item.place,
          location: item.place,
          description: item.memo,
          imageUrl: '', // 이미지는 추후 추가 가능
          tags: formData.styles.slice(0, 3), // 여행 스타일에서 일부 태그 사용
          price: item.cost ? `${item.cost}만원` : '무료',
          category: getEventCategory(item.activity),
        }));

        planDays.push({
          id: dayKey,
          dayNumber: dayIndex,
          date: calculateDateForDay(dayIndex),
          events: events,
        });

        dayIndex++;
      }
    });

    return planDays;
  };

  // 활동에 따른 카테고리 분류
  const getEventCategory = (activity: string): string => {
    if (!activity) return 'general';

    const activityLower = activity.toLowerCase();
    if (
      activityLower.includes('식사') ||
      activityLower.includes('맛집') ||
      activityLower.includes('음식')
    )
      return 'food';
    if (
      activityLower.includes('관광') ||
      activityLower.includes('구경') ||
      activityLower.includes('투어')
    )
      return 'tourism';
    if (activityLower.includes('쇼핑') || activityLower.includes('구매'))
      return 'shopping';
    if (
      activityLower.includes('휴식') ||
      activityLower.includes('호텔') ||
      activityLower.includes('카페')
    )
      return 'rest';

    return 'activity';
  };

  // 각 날짜 계산
  const calculateDateForDay = (dayNumber: number): string => {
    if (!formData.startDate) return '';

    const startDate = new Date(formData.startDate);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayNumber - 1);

    return targetDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/plan');
  };

  // 삭제 핸들러 (수정 모드에서만)
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 여행 계획을 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이
      toast.success('여행 계획이 삭제되었습니다.');
      navigate('/plan');
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 탭 제목 반환
  const getTabTitle = (day: string) => {
    const dayNumber = day.replace('day', '');
    return `Day ${dayNumber}`;
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (
      !formData.title ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.destination
    ) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return false;
    }
    return true;
  };

  // 여행지별 placeholder 이미지 반환 함수 (구글 플레이스 API 실패 시 사용)
  const getPlaceholderImageUrl = (destination: string): string => {
    // 목적지별 placeholder 이미지 맵핑
    const placeholderImageMap: { [key: string]: string } = {
      // 국내 도시들
      제주도: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Jeju',
      제주: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Jeju',
      부산: 'https://via.placeholder.com/800x600/2ECC71/FFFFFF?text=Busan',
      서울: 'https://via.placeholder.com/800x600/E74C3C/FFFFFF?text=Seoul',
      강릉: 'https://via.placeholder.com/800x600/3498DB/FFFFFF?text=Gangneung',
      전주: 'https://via.placeholder.com/800x600/F39C12/FFFFFF?text=Jeonju',
      여수: 'https://via.placeholder.com/800x600/1ABC9C/FFFFFF?text=Yeosu',
      경주: 'https://via.placeholder.com/800x600/8E44AD/FFFFFF?text=Gyeongju',
      인천: 'https://via.placeholder.com/800x600/16A085/FFFFFF?text=Incheon',
      대구: 'https://via.placeholder.com/800x600/F1C40F/FFFFFF?text=Daegu',
      광주: 'https://via.placeholder.com/800x600/E67E22/FFFFFF?text=Gwangju',
      울산: 'https://via.placeholder.com/800x600/2980B9/FFFFFF?text=Ulsan',
      춘천: 'https://via.placeholder.com/800x600/27AE60/FFFFFF?text=Chuncheon',
      속초: 'https://via.placeholder.com/800x600/D35400/FFFFFF?text=Sokcho',

      // 해외 지역들
      일본: 'https://via.placeholder.com/800x600/9B59B6/FFFFFF?text=Japan',
      도쿄: 'https://via.placeholder.com/800x600/9B59B6/FFFFFF?text=Tokyo',
      오사카: 'https://via.placeholder.com/800x600/8E44AD/FFFFFF?text=Osaka',
      교토: 'https://via.placeholder.com/800x600/9B59B6/FFFFFF?text=Kyoto',

      유럽: 'https://via.placeholder.com/800x600/34495E/FFFFFF?text=Europe',
      파리: 'https://via.placeholder.com/800x600/34495E/FFFFFF?text=Paris',
      런던: 'https://via.placeholder.com/800x600/2C3E50/FFFFFF?text=London',
      로마: 'https://via.placeholder.com/800x600/7F8C8D/FFFFFF?text=Rome',
      바르셀로나:
        'https://via.placeholder.com/800x600/95A5A6/FFFFFF?text=Barcelona',
      암스테르담:
        'https://via.placeholder.com/800x600/34495E/FFFFFF?text=Amsterdam',

      미국: 'https://via.placeholder.com/800x600/C0392B/FFFFFF?text=USA',
      뉴욕: 'https://via.placeholder.com/800x600/C0392B/FFFFFF?text=NewYork',
      로스앤젤레스: 'https://via.placeholder.com/800x600/E74C3C/FFFFFF?text=LA',
      샌프란시스코: 'https://via.placeholder.com/800x600/EC7063/FFFFFF?text=SF',
      라스베이거스:
        'https://via.placeholder.com/800x600/F1948A/FFFFFF?text=Vegas',

      중국: 'https://via.placeholder.com/800x600/A93226/FFFFFF?text=China',
      베이징: 'https://via.placeholder.com/800x600/A93226/FFFFFF?text=Beijing',
      상하이: 'https://via.placeholder.com/800x600/CB4335/FFFFFF?text=Shanghai',
      홍콩: 'https://via.placeholder.com/800x600/D5DBDB/FFFFFF?text=HongKong',

      동남아시아:
        'https://via.placeholder.com/800x600/229954/FFFFFF?text=SEAsia',
      태국: 'https://via.placeholder.com/800x600/229954/FFFFFF?text=Thailand',
      방콕: 'https://via.placeholder.com/800x600/27AE60/FFFFFF?text=Bangkok',
      싱가포르:
        'https://via.placeholder.com/800x600/2ECC71/FFFFFF?text=Singapore',
      베트남: 'https://via.placeholder.com/800x600/58D68D/FFFFFF?text=Vietnam',
      하노이: 'https://via.placeholder.com/800x600/58D68D/FFFFFF?text=Hanoi',
      호치민:
        'https://via.placeholder.com/800x600/7DCEA0/FFFFFF?text=HoChiMinh',

      호주: 'https://via.placeholder.com/800x600/148F77/FFFFFF?text=Australia',
      시드니: 'https://via.placeholder.com/800x600/148F77/FFFFFF?text=Sydney',
      멜버른:
        'https://via.placeholder.com/800x600/1ABC9C/FFFFFF?text=Melbourne',
    };

    // 기본 이미지
    return (
      placeholderImageMap[destination] ||
      'https://via.placeholder.com/800x600/95A5A6/FFFFFF?text=Travel'
    );
  };

  // 태그 생성 함수
  const generateTags = (destination: string, styles: string[]): string[] => {
    const tags = [`#${destination}`];

    // 여행 스타일을 태그로 변환
    styles.forEach((style) => {
      if (style.includes('맛집')) tags.push('#맛집탐방');
      if (style.includes('휴양')) tags.push('#휴양');
      if (style.includes('액티비티')) tags.push('#액티비티');
      if (style.includes('관광')) tags.push('#관광');
      if (style.includes('쇼핑')) tags.push('#쇼핑');
      if (style.includes('문화')) tags.push('#문화체험');
    });

    // 기본 태그들
    tags.push('#여행메이트', '#함께여행');

    return Array.from(new Set(tags)); // 중복 제거
  };

  return (
    <S.Container>
      {/* 메인 콘텐츠 */}
      <S.MainContent>
        <S.PageTitle>
          <i className="ri-edit-box-line"></i>
          {isEditMode ? '여행 계획 수정' : '여행 계획 작성'}
        </S.PageTitle>

        {/* 기본 정보 섹션 */}
        <S.Section>
          <S.SectionTitle>📋 기본 정보</S.SectionTitle>
          <S.FormRow>
            <S.FormCol $span={12}>
              <S.FormGroup>
                <S.Label htmlFor="title">
                  <S.LabelIcon>✈️</S.LabelIcon>
                  여행 제목
                </S.Label>
                <S.Input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="여행 제목을 입력하세요"
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={12}>
              <S.FormGroup>
                <S.Label htmlFor="extraMemo">
                  <S.LabelIcon>📖</S.LabelIcon>
                  소개글
                </S.Label>
                <S.Textarea
                  id="extraMemo"
                  name="extraMemo"
                  value={formData.extraMemo}
                  onChange={handleInputChange}
                  placeholder="여행 계획에 대한 소개글을 작성해주세요"
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={6}>
              <S.FormGroup>
                <S.Label htmlFor="startDate">
                  <S.LabelIcon>📅</S.LabelIcon>
                  여행 시작일
                </S.Label>
                <S.Input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={6}>
              <S.FormGroup>
                <S.Label htmlFor="endDate">
                  <S.LabelIcon>🏁</S.LabelIcon>
                  여행 종료일
                </S.Label>
                <S.Input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={6}>
              <S.FormGroup>
                <S.Label htmlFor="destination">
                  <S.LabelIcon>📍</S.LabelIcon>
                  여행지
                </S.Label>
                <S.Input
                  id="destination"
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="여행지를 입력하세요"
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={3}>
              <S.FormGroup>
                <S.Label htmlFor="budget">
                  <S.LabelIcon>💰</S.LabelIcon>
                  예산 (만원)
                </S.Label>
                <S.Input
                  id="budget"
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  onFocus={(e) => {
                    // 값이 0일 때 포커스 시 빈 문자열로 변경
                    if (formData.budget === 0) {
                      setFormData((prev) => ({ ...prev, budget: '' as any }));
                    }
                  }}
                  onBlur={(e) => {
                    // 빈 값일 때 블러 시 0으로 변경
                    if (e.target.value === '' || e.target.value === '0') {
                      setFormData((prev) => ({ ...prev, budget: 0 }));
                    }
                  }}
                  placeholder="0"
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={3}>
              <S.FormGroup>
                <S.Label htmlFor="people">
                  <S.LabelIcon>👥</S.LabelIcon>
                  인원 수
                </S.Label>
                <S.Input
                  id="people"
                  type="number"
                  name="people"
                  value={formData.people}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="1"
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={12}>
              <S.FormGroup>
                <S.Label>
                  <S.LabelIcon>🎨</S.LabelIcon>
                  여행 스타일
                </S.Label>
                <S.CheckboxGroup>
                  {[
                    { value: 'planned', label: '계획적', icon: '📋' },
                    { value: 'spontaneous', label: '즉흥적', icon: '🎲' },
                    { value: 'tourism', label: '관광 중심', icon: '🏛️' },
                    { value: 'relaxation', label: '휴식 중심', icon: '🧘‍♀️' },
                    { value: 'food', label: '맛집 탐방', icon: '🍴' },
                    { value: 'nature', label: '자연 체험', icon: '🌿' },
                    { value: 'culture', label: '문화 체험', icon: '🎭' },
                    { value: 'shopping', label: '쇼핑', icon: '🛍️' },
                  ].map((style) => (
                    <S.CheckboxItem key={style.value}>
                      <S.StyledCheckbox
                        type="checkbox"
                        name="trip-style"
                        value={style.value}
                        checked={formData.styles.includes(style.value)}
                        onChange={handleInputChange}
                      />
                      <S.CheckboxLabel
                        $checked={formData.styles.includes(style.value)}
                      >
                        <S.CheckboxIcon className="checkbox-icon">
                          {style.icon}
                        </S.CheckboxIcon>
                        {style.label}
                      </S.CheckboxLabel>
                    </S.CheckboxItem>
                  ))}
                </S.CheckboxGroup>
              </S.FormGroup>
            </S.FormCol>
          </S.FormRow>
        </S.Section>

        {/* 세부 일정 섹션 */}
        <S.Section>
          <S.SectionTitle>📝 세부 일정</S.SectionTitle>
          <S.Tabs>
            {days.map((day) => (
              <S.Tab
                key={day}
                $active={activeTab === day}
                onClick={() => setActiveTab(day)}
              >
                <span>{getTabTitle(day)}</span>
                {day !== 'day1' && days.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // 탭 클릭 이벤트 방지
                      removeDay(day);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      fontSize: '12px',
                      marginLeft: '8px',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </S.Tab>
            ))}
            <S.Tab onClick={addDay}>
              <i className="ri-add-line"></i>
            </S.Tab>
          </S.Tabs>

          {days.map((day) => (
            <S.TabContent key={day} $active={activeTab === day}>
              {formData.schedules[day].map((item) => (
                <S.ScheduleItem key={item.id}>
                  <S.ScheduleItemHeader>
                    <h4>일정 #{formData.schedules[day].indexOf(item) + 1}</h4>
                    <S.RemoveItem
                      onClick={() => removeScheduleItem(day, item.id)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </S.RemoveItem>
                  </S.ScheduleItemHeader>
                  <S.FormRow>
                    <S.FormCol $span={3}>
                      <S.FormGroup>
                        <S.Label>
                          <S.LabelIcon>⏰</S.LabelIcon>
                          시간
                        </S.Label>
                        <S.Input
                          type="time"
                          value={item.time}
                          onChange={(e) =>
                            updateScheduleItem(
                              day,
                              item.id,
                              'time',
                              e.target.value,
                            )
                          }
                        />
                      </S.FormGroup>
                    </S.FormCol>
                    <S.FormCol $span={9}>
                      <S.FormGroup>
                        <S.Label>
                          <S.LabelIcon>📍</S.LabelIcon>
                          장소
                        </S.Label>
                        <PlaceSearchInput
                          value={item.place}
                          onChange={(placeName, placeInfo) => {
                            updateScheduleItem(
                              day,
                              item.id,
                              'place',
                              placeName,
                            );
                            // 장소 정보가 있으면 추가 데이터도 저장할 수 있음
                            if (placeInfo) {
                              // 나중에 장소 상세 정보 저장 기능 추가 가능
                              console.log('선택된 장소 정보:', placeInfo);
                            }
                          }}
                          placeholder="장소를 검색하세요"
                          onPlaceSelect={(place) => {
                            // 장소 선택 시 추가 작업 수행 가능
                            console.log('장소 선택됨:', place);
                          }}
                        />
                      </S.FormGroup>
                    </S.FormCol>
                    <S.FormCol $span={12}>
                      <S.FormGroup>
                        <S.Label>
                          <S.LabelIcon>🎯</S.LabelIcon>
                          활동
                        </S.Label>
                        <S.Input
                          type="text"
                          value={item.activity}
                          onChange={(e) =>
                            updateScheduleItem(
                              day,
                              item.id,
                              'activity',
                              e.target.value,
                            )
                          }
                          placeholder="활동을 입력하세요"
                        />
                      </S.FormGroup>
                    </S.FormCol>
                    <S.FormCol $span={9}>
                      <S.FormGroup>
                        <S.Label>
                          <S.LabelIcon>📝</S.LabelIcon>
                          메모
                        </S.Label>
                        <S.Textarea
                          value={item.memo}
                          onChange={(e) =>
                            updateScheduleItem(
                              day,
                              item.id,
                              'memo',
                              e.target.value,
                            )
                          }
                          placeholder="메모를 입력하세요"
                        />
                      </S.FormGroup>
                    </S.FormCol>
                    <S.FormCol $span={3}>
                      <S.FormGroup>
                        <S.Label>
                          <S.LabelIcon>💰</S.LabelIcon>
                          비용 (만원)
                        </S.Label>
                        <S.Input
                          type="number"
                          value={item.cost}
                          onChange={(e) =>
                            updateScheduleItem(
                              day,
                              item.id,
                              'cost',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          onFocus={(e) => {
                            // 값이 0일 때 포커스 시 빈 문자열로 변경
                            if (item.cost === 0) {
                              updateScheduleItem(
                                day,
                                item.id,
                                'cost',
                                '' as any,
                              );
                            }
                          }}
                          onBlur={(e) => {
                            // 빈 값일 때 블러 시 0으로 변경
                            if (
                              e.target.value === '' ||
                              e.target.value === '0'
                            ) {
                              updateScheduleItem(day, item.id, 'cost', 0);
                            }
                          }}
                          placeholder="0"
                        />
                      </S.FormGroup>
                    </S.FormCol>
                  </S.FormRow>
                </S.ScheduleItem>
              ))}

              <S.AddScheduleBtn onClick={() => addScheduleItem(day)}>
                <i className="ri-add-line"></i> 일정 추가하기
              </S.AddScheduleBtn>
            </S.TabContent>
          ))}
        </S.Section>

        {/* 매칭 옵션 섹션 */}
        <S.Section>
          <S.SectionTitle>🤝 매칭 옵션</S.SectionTitle>
          <S.FormRow>
            <S.FormCol $span={4}>
              <S.FormGroup>
                <S.Label htmlFor="preferredGender">
                  <S.LabelIcon>👫</S.LabelIcon>
                  선호 성별
                </S.Label>
                <S.Select
                  id="preferredGender"
                  name="preferredGender"
                  value={formData.preferredGender}
                  onChange={handleInputChange}
                >
                  <option value="">🚫 상관없음</option>
                  <option value="male">👨 남성</option>
                  <option value="female">👩 여성</option>
                </S.Select>
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={4}>
              <S.FormGroup>
                <S.Label htmlFor="preferredAge">
                  <S.LabelIcon>🎂</S.LabelIcon>
                  선호 나이대
                </S.Label>
                <S.Select
                  id="preferredAge"
                  name="preferredAge"
                  value={formData.preferredAge}
                  onChange={handleInputChange}
                >
                  <option value="">🚫 상관없음</option>
                  <option value="20s">🌱 20대</option>
                  <option value="30s">🌳 30대</option>
                  <option value="40s">🌲 40대</option>
                  <option value="50s">🌰 50대 이상</option>
                </S.Select>
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={4}>
              <S.FormGroup>
                <S.Label htmlFor="preferredLanguage">
                  <S.LabelIcon>🗣️</S.LabelIcon>
                  선호 언어
                </S.Label>
                <S.Select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                >
                  <option value="korean">🇰🇷 한국어</option>
                  <option value="english">🇺🇸 영어</option>
                  <option value="japanese">🇯🇵 일본어</option>
                  <option value="chinese">🇨🇳 중국어</option>
                  <option value="other">🌍 기타</option>
                </S.Select>
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={12}>
              <S.FormGroup>
                <S.Label htmlFor="matchingMemo">
                  <S.LabelIcon>💬</S.LabelIcon>
                  매칭 관련 추가 요청사항
                </S.Label>
                <S.Textarea
                  id="matchingMemo"
                  name="matchingMemo"
                  value={formData.matchingMemo}
                  onChange={handleInputChange}
                  placeholder="매칭 관련 추가 요청사항을 입력하세요"
                />
              </S.FormGroup>
            </S.FormCol>
          </S.FormRow>
        </S.Section>

        {/* 추가 정보 섹션 */}
        <S.Section>
          <S.SectionTitle>📄 추가 정보</S.SectionTitle>
          <S.FormRow>
            <S.FormCol $span={6}>
              <S.FormGroup>
                <S.Label htmlFor="accommodation">
                  <S.LabelIcon>🏨</S.LabelIcon>
                  숙소 정보
                </S.Label>
                <S.Textarea
                  id="accommodation"
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                  placeholder="숙소 정보를 입력하세요"
                />
              </S.FormGroup>
            </S.FormCol>
            <S.FormCol $span={6}>
              <S.FormGroup>
                <S.Label htmlFor="transportation">
                  <S.LabelIcon>🚗</S.LabelIcon>
                  교통수단
                </S.Label>
                <S.Textarea
                  id="transportation"
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleInputChange}
                  placeholder="교통수단 정보를 입력하세요"
                />
              </S.FormGroup>
            </S.FormCol>
          </S.FormRow>
        </S.Section>

        {/* 버튼 섹션 */}
        <S.BtnSection>
          <S.Btn $variant="outline" onClick={handleCancel}>
            취소
          </S.Btn>
          {isEditMode && (
            <S.Btn
              $variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              삭제
            </S.Btn>
          )}
          <S.Btn $variant="secondary" disabled={isLoading}>
            임시저장
          </S.Btn>
          <S.Btn $variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </S.Btn>
        </S.BtnSection>
      </S.MainContent>

      {/* 푸터 */}
      <S.Footer>
        <S.FooterContent>
          <S.FooterLogo>트립매치</S.FooterLogo>
          <S.FooterLinks>
            <a href="#">서비스 소개</a>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">고객센터</a>
          </S.FooterLinks>
        </S.FooterContent>
        <S.FooterCopyright>
          © 2023 트립매치. All rights reserved.
        </S.FooterCopyright>
      </S.Footer>
    </S.Container>
  );
};

export default PlanWritePage;
