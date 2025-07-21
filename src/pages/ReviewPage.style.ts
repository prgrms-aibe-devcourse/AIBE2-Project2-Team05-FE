import styled from 'styled-components';

export const ReviewContainer = styled.div`
  padding: 40px;
  max-width: 1920px;
  margin: 0 auto;
`;

export const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #1e293b;
`;

export const Tabs = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #e2e8f0;
`;

export const Tab = styled.div`
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  &.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }
`;

export const TabContent = styled.div``;

// --- 리뷰 작성 탭 스타일 ---
export const ReviewTargetSection = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1e293b;
`;

export const UserList = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 0;
`;

export const UserCard = styled.div`
  min-width: 200px;
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  &.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
`;

export const UserAvatar = styled.div`
  width: 70px;
  height: 70px;
  background-color: #e2e8f0;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const UserName = styled.div`
  font-weight: 600;
  text-align: center;
  margin-bottom: 5px;
`;

export const UserTrip = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
`;

export const ReviewFormSection = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
`;

export const SubmitButton = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
`;

// --- 받은 리뷰 탭 스타일 ---
export const ReviewStats = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 40px;
`;

export const AverageRating = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 40px;
  border-right: 1px solid #e2e8f0;
`;

export const RatingNumber = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #1e293b;
`;

export const RatingStars = styled.div`
  display: flex;
  gap: 5px;
  color: #f59e0b;
`;

// 별점 아이콘 스타일
export const Star = styled.i`
  font-size: 24px; // 아이콘 크기 통일
  color: #cbd5e1; // 비활성화 상태 색상
  cursor: pointer;
  transition: color 0.2s;

  &.active {
    color: #f59e0b; // 활성화 상태 색상
  }
`;

export const RatingCount = styled.div`
  color: #64748b;
  font-size: 14px;
`;

export const CategoryStats = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const CategoryStat = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const CategoryLabel = styled.div`
  width: 100px;
  font-weight: 500;
`;

export const ProgressBar = styled.div`
  flex: 1;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
`;

export const Progress = styled.div<{ width: string }>`
  height: 100%;
  background-color: #3b82f6;
  border-radius: 5px;
  width: ${(props) => props.width};
`;

export const CategoryValue = styled.div`
  width: 40px;
  text-align: right;
  font-weight: 500;
`;

export const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const FilterOptions = styled.div`
  display: flex;
  gap: 15px;
`;

export const FilterOption = styled.div`
  padding: 8px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  &.active {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
`;

export const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ReviewCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const Reviewer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const ReviewerAvatar = styled.div`
  width: 50px;
  height: 50px;
  background-color: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ReviewerInfo = styled.div``;

export const ReviewerName = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
`;

export const ReviewDate = styled.div`
  font-size: 14px;
  color: #64748b;
`;

export const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #f59e0b;
`;

export const ReviewTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
`;

export const ReviewContent = styled.p`
  margin-bottom: 20px;
  line-height: 1.6;
`;

export const ReviewActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  background-color: #f1f5f9;
  color: #475569;
`; 