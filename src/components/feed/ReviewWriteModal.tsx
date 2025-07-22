import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Feed, ReviewFormData, TravelReview } from '../../types/feed';

interface ReviewWriteModalProps {
  feed: Feed;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: ReviewFormData) => Promise<void>;
}

const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({
  feed,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    images: [],
    imageUrls: [],
    rating: 5,
    highlights: [''],
    recommendations: [''],
    expenses: {
      accommodation: '',
      food: '',
      transportation: '',
      activities: '',
      shopping: '',
      etc: '',
    },
  });

  // 모달이 열리지 않았으면 렌더링하지 않음
  if (!isOpen) return null;

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof ReviewFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 하이라이트 추가/삭제
  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData((prev) => ({ ...prev, highlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ''],
    }));
  };

  const removeHighlight = (index: number) => {
    if (formData.highlights.length > 1) {
      const newHighlights = formData.highlights.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, highlights: newHighlights }));
    }
  };

  // 추천사항 추가/삭제
  const handleRecommendationChange = (index: number, value: string) => {
    const newRecommendations = [...formData.recommendations];
    newRecommendations[index] = value;
    setFormData((prev) => ({ ...prev, recommendations: newRecommendations }));
  };

  const addRecommendation = () => {
    setFormData((prev) => ({
      ...prev,
      recommendations: [...prev.recommendations, ''],
    }));
  };

  const removeRecommendation = (index: number) => {
    if (formData.recommendations.length > 1) {
      const newRecommendations = formData.recommendations.filter(
        (_, i) => i !== index,
      );
      setFormData((prev) => ({ ...prev, recommendations: newRecommendations }));
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // 이미지 파일만 필터링
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    // 미리보기 URL 생성
    const newImageUrls = imageFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
      imageUrls: [...prev.imageUrls, ...newImageUrls],
    }));
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    // URL 해제
    URL.revokeObjectURL(formData.imageUrls[index]);

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // 별점 변경
  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  // 지출 내역 변경
  const handleExpenseChange = (
    field: keyof ReviewFormData['expenses'],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [field]: value,
      },
    }));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('후기 작성 실패:', error);
      alert('후기 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>✈️ 여행 후기 작성</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <TripInfo>
          <TripTitle>{feed.caption}</TripTitle>
          <TripMeta>작성자: {feed.author}</TripMeta>
        </TripInfo>

        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>📝 후기 제목</SectionTitle>
            <Input
              type="text"
              placeholder="이번 여행을 한 줄로 표현해보세요"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </FormSection>

          <FormSection>
            <SectionTitle>⭐ 전체 만족도</SectionTitle>
            <StarRating>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  $filled={star <= formData.rating}
                  onClick={() => handleRatingChange(star)}
                >
                  ★
                </Star>
              ))}
              <RatingText>({formData.rating}/5)</RatingText>
            </StarRating>
          </FormSection>

          <FormSection>
            <SectionTitle>📸 여행 사진</SectionTitle>
            <ImageUploadArea>
              <UploadButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                📷 사진 추가
              </UploadButton>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </ImageUploadArea>

            {formData.imageUrls.length > 0 && (
              <ImagePreviewGrid>
                {formData.imageUrls.map((url, index) => (
                  <ImagePreview key={index}>
                    <PreviewImage src={url} alt={`미리보기 ${index + 1}`} />
                    <RemoveImageButton onClick={() => removeImage(index)}>
                      ✕
                    </RemoveImageButton>
                  </ImagePreview>
                ))}
              </ImagePreviewGrid>
            )}
          </FormSection>

          <FormSection>
            <SectionTitle>✨ 여행 하이라이트</SectionTitle>
            <HelperText>
              이번 여행에서 가장 기억에 남는 순간들을 알려주세요
            </HelperText>
            {formData.highlights.map((highlight, index) => (
              <HighlightItem key={index}>
                <Input
                  type="text"
                  placeholder={`하이라이트 ${index + 1}`}
                  value={highlight}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                />
                {formData.highlights.length > 1 && (
                  <RemoveButton
                    type="button"
                    onClick={() => removeHighlight(index)}
                  >
                    ✕
                  </RemoveButton>
                )}
              </HighlightItem>
            ))}
            <AddButton type="button" onClick={addHighlight}>
              + 하이라이트 추가
            </AddButton>
          </FormSection>

          <FormSection>
            <SectionTitle>💡 추천사항</SectionTitle>
            <HelperText>
              다른 여행자들에게 추천하고 싶은 것들을 적어보세요
            </HelperText>
            {formData.recommendations.map((recommendation, index) => (
              <HighlightItem key={index}>
                <Input
                  type="text"
                  placeholder={`추천사항 ${index + 1}`}
                  value={recommendation}
                  onChange={(e) =>
                    handleRecommendationChange(index, e.target.value)
                  }
                />
                {formData.recommendations.length > 1 && (
                  <RemoveButton
                    type="button"
                    onClick={() => removeRecommendation(index)}
                  >
                    ✕
                  </RemoveButton>
                )}
              </HighlightItem>
            ))}
            <AddButton type="button" onClick={addRecommendation}>
              + 추천사항 추가
            </AddButton>
          </FormSection>

          <FormSection>
            <SectionTitle>📝 상세 후기</SectionTitle>
            <Textarea
              placeholder="여행의 자세한 경험과 느낌을 공유해주세요..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              required
            />
          </FormSection>

          <FormSection>
            <SectionTitle>💰 실제 지출 내역 (선택사항)</SectionTitle>
            <ExpenseGrid>
              <ExpenseItem>
                <ExpenseLabel>숙박비</ExpenseLabel>
                <ExpenseInput
                  type="number"
                  placeholder="0"
                  value={formData.expenses.accommodation}
                  onChange={(e) =>
                    handleExpenseChange('accommodation', e.target.value)
                  }
                />
              </ExpenseItem>
              <ExpenseItem>
                <ExpenseLabel>식비</ExpenseLabel>
                <ExpenseInput
                  type="number"
                  placeholder="0"
                  value={formData.expenses.food}
                  onChange={(e) => handleExpenseChange('food', e.target.value)}
                />
              </ExpenseItem>
              <ExpenseItem>
                <ExpenseLabel>교통비</ExpenseLabel>
                <ExpenseInput
                  type="number"
                  placeholder="0"
                  value={formData.expenses.transportation}
                  onChange={(e) =>
                    handleExpenseChange('transportation', e.target.value)
                  }
                />
              </ExpenseItem>
              <ExpenseItem>
                <ExpenseLabel>액티비티</ExpenseLabel>
                <ExpenseInput
                  type="number"
                  placeholder="0"
                  value={formData.expenses.activities}
                  onChange={(e) =>
                    handleExpenseChange('activities', e.target.value)
                  }
                />
              </ExpenseItem>
              <ExpenseItem>
                <ExpenseLabel>쇼핑</ExpenseLabel>
                <ExpenseInput
                  type="number"
                  placeholder="0"
                  value={formData.expenses.shopping}
                  onChange={(e) =>
                    handleExpenseChange('shopping', e.target.value)
                  }
                />
              </ExpenseItem>
              <ExpenseItem>
                <ExpenseLabel>기타</ExpenseLabel>
                <ExpenseInput
                  type="number"
                  placeholder="0"
                  value={formData.expenses.etc}
                  onChange={(e) => handleExpenseChange('etc', e.target.value)}
                />
              </ExpenseItem>
            </ExpenseGrid>
          </FormSection>

          <ButtonContainer>
            <CancelButton
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '작성 중...' : '후기 작성 완료'}
            </SubmitButton>
          </ButtonContainer>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ReviewWriteModal;

// 스타일 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;

  &:hover {
    color: #333;
  }
`;

const TripInfo = styled.div`
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TripTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const TripMeta = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const FormSection = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f4;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const HelperText = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3682f8;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3682f8;
  }
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Star = styled.span<{ $filled: boolean }>`
  font-size: 24px;
  color: ${({ $filled }) => ($filled ? '#FFD700' : '#ddd')};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #ffd700;
  }
`;

const RatingText = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #666;
`;

const ImageUploadArea = styled.div`
  margin-bottom: 16px;
`;

const UploadButton = styled.button`
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3682f8;
    color: #3682f8;
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const HighlightItem = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #dc2626;
  }
`;

const AddButton = styled.button`
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #2563eb;
  }
`;

const ExpenseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const ExpenseItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ExpenseLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ExpenseInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3682f8;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #e9ecef;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
