import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as S from './PlanWritePage.style';

// 여행 계획 작성 페이지 컴포넌트
const PlanWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // 기본 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    destination: '',
    description: '',
    maxParticipants: 4,
    estimatedCost: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  // 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 저장 핸들러
  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.destination
    ) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이
      toast.success(
        isEditMode
          ? '여행 계획이 수정되었습니다!'
          : '여행 계획이 생성되었습니다!',
      );
      navigate('/plan');
    } catch (error) {
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <S.PlanWriteContainer>
      <S.PageHeader>
        <S.PageTitle>
          {isEditMode ? '여행 계획 수정' : '새 여행 계획 작성'}
        </S.PageTitle>
        <S.PageSubtitle>
          {isEditMode
            ? '기존 여행 계획을 수정하고 저장하세요'
            : '새로운 여행 계획을 작성하고 공유하세요'}
        </S.PageSubtitle>
      </S.PageHeader>

      <S.FormContainer>
        {/* 기본 정보 섹션 */}
        <S.Section>
          <S.SectionTitle>기본 정보</S.SectionTitle>

          <S.FormGroup>
            <S.Label htmlFor="title">여행 제목 *</S.Label>
            <S.Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="여행 제목을 입력하세요"
            />
          </S.FormGroup>

          <S.FormRow>
            <S.FormGroup>
              <S.Label htmlFor="startDate">출발일 *</S.Label>
              <S.Input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label htmlFor="endDate">종료일 *</S.Label>
              <S.Input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </S.FormGroup>
          </S.FormRow>

          <S.FormGroup>
            <S.Label htmlFor="destination">목적지 *</S.Label>
            <S.Input
              id="destination"
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="목적지를 입력하세요"
            />
          </S.FormGroup>

          <S.FormRow>
            <S.FormGroup>
              <S.Label htmlFor="maxParticipants">최대 참여 인원</S.Label>
              <S.Input
                id="maxParticipants"
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                max="10"
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label htmlFor="estimatedCost">예상 비용 (1인당)</S.Label>
              <S.Input
                id="estimatedCost"
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleInputChange}
                placeholder="원"
              />
            </S.FormGroup>
          </S.FormRow>

          <S.FormGroup>
            <S.Label htmlFor="description">여행 설명</S.Label>
            <S.Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="이번 여행에 대해 간단히 설명해주세요..."
              rows={4}
            />
          </S.FormGroup>
        </S.Section>

        {/* 버튼 섹션 */}
        <S.ButtonSection>
          <S.Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/plan')}
          >
            취소
          </S.Button>

          <S.Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </S.Button>
        </S.ButtonSection>
      </S.FormContainer>
    </S.PlanWriteContainer>
  );
};

export default PlanWritePage;
