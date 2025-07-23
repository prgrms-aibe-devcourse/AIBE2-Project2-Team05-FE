import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewData } from '../../types/feed';
import feedStatusService from '../../services/feedStatusService';

interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedId: number;
  planId: string;
  destination: string;
  onReviewSubmit: (review: ReviewData) => void;
}

const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({
  isOpen,
  onClose,
  feedId,
  planId,
  destination,
  onReviewSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    '힐링',
    '맛집',
    '자연',
    '문화',
    '액티비티',
    '사진맛집',
    '가성비',
    '럭셔리',
    '현지인추천',
    '재방문의사',
    '커플여행',
    '친구여행',
    '가족여행',
    '혼행',
    '교통편리',
    '숙박만족',
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: ReviewData = {
        feedId,
        planId,
        rating,
        title: title.trim(),
        content: content.trim(),
        images: [], // 이미지 업로드 기능은 추후 구현
        tags: selectedTags,
        createdAt: new Date().toISOString(),
        destination,
      };

      // 리뷰 데이터를 localStorage에 저장
      const existingReviewsStr = localStorage.getItem('travelReviews');
      const existingReviews = existingReviewsStr
        ? JSON.parse(existingReviewsStr)
        : [];

      existingReviews.push(reviewData);
      localStorage.setItem('travelReviews', JSON.stringify(existingReviews));

      // 피드에 후기 작성 완료 표시
      feedStatusService.markReviewCompleted(feedId);

      // 부모 컴포넌트에 알림
      onReviewSubmit(reviewData);

      console.log(`✅ 피드 ${feedId} 후기 작성 완료`);

      // 모달 닫기
      onClose();

      // 성공 메시지
      alert('후기가 성공적으로 작성되었습니다! 🎉');
    } catch (error) {
      console.error('후기 작성 실패:', error);
      alert('후기 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title || content || selectedTags.length > 0) {
      const confirmed = window.confirm(
        '작성 중인 내용이 있습니다. 정말 닫으시겠습니까?',
      );
      if (!confirmed) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <ModalContent
          as={motion.div}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>🌟 여행 후기 작성</ModalTitle>
            <CloseButton onClick={handleClose}>×</CloseButton>
          </ModalHeader>

          <ModalBody>
            {/* 목적지 정보 */}
            <DestinationInfo>
              📍 <strong>{destination}</strong> 여행은 어떠셨나요?
            </DestinationInfo>

            {/* 별점 */}
            <RatingSection>
              <SectionTitle>전체적인 만족도</SectionTitle>
              <StarRating>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    active={star <= rating}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </Star>
                ))}
                <RatingText>({rating}/5)</RatingText>
              </StarRating>
            </RatingSection>

            {/* 제목 */}
            <InputSection>
              <SectionTitle>후기 제목</SectionTitle>
              <TitleInput
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="여행 후기의 제목을 작성해주세요"
                maxLength={50}
              />
              <CharCount>{title.length}/50</CharCount>
            </InputSection>

            {/* 내용 */}
            <InputSection>
              <SectionTitle>후기 내용</SectionTitle>
              <ContentTextarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="여행에서 느낀 점, 추천 포인트, 아쉬웠던 점 등을 자유롭게 작성해주세요"
                maxLength={500}
              />
              <CharCount>{content.length}/500</CharCount>
            </InputSection>

            {/* 태그 */}
            <TagSection>
              <SectionTitle>여행 태그 (선택)</SectionTitle>
              <TagGrid>
                {availableTags.map((tag) => (
                  <TagButton
                    key={tag}
                    selected={selectedTags.includes(tag)}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </TagButton>
                ))}
              </TagGrid>
            </TagSection>
          </ModalBody>

          <ModalFooter>
            <CancelButton onClick={handleClose}>취소</CancelButton>
            <SubmitButton
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? '작성 중...' : '후기 작성 완료'}
            </SubmitButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #999;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
`;

const DestinationInfo = styled.div`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 16px;
  color: #495057;
`;

const RatingSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Star = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  opacity: ${(props) => (props.active ? 1 : 0.3)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const RatingText = styled.span`
  margin-left: 8px;
  font-weight: 600;
  color: #495057;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ContentTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const TagSection = styled.div`
  margin-bottom: 24px;
`;

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
`;

const TagButton = styled.button<{ selected: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${(props) => (props.selected ? '#3b82f6' : '#ddd')};
  background-color: ${(props) => (props.selected ? '#3b82f6' : 'white')};
  color: ${(props) => (props.selected ? 'white' : '#333')};
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3b82f6;
    background-color: ${(props) => (props.selected ? '#2563eb' : '#f0f7ff')};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

export default ReviewWriteModal;
