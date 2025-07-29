import React from 'react';
import styled from 'styled-components';

// 타입 정의
type TabType = 'created' | 'participated';

interface UserFeed {
  id: string | number;
  author: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  type: 'travel-plan' | 'photo';
  planId?: string;
  createdAt: string;
  travelType: 'created' | 'participated';
}

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  feeds: UserFeed[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  feeds 
}) => {
  const createdCount = feeds.filter((f) => f.travelType === 'created').length;
  const participatedCount = feeds.filter((f) => f.travelType === 'participated').length;

  return (
    <Container>
      <Tab
        className={activeTab === 'created' ? 'active' : ''}
        onClick={() => onTabChange('created')}
      >
        ✈️ 내가 만든 여행
        <TabCount>{createdCount}</TabCount>
      </Tab>
      <Tab
        className={activeTab === 'participated' ? 'active' : ''}
        onClick={() => onTabChange('participated')}
      >
        🤝 참여한 여행
        <TabCount>{participatedCount}</TabCount>
      </Tab>
    </Container>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #efefef;
  margin-top: 20px;
`;

const Tab = styled.div`
  padding: 16px 30px;
  cursor: pointer;
  font-weight: 600;
  color: #8e8e8e;
  border-top: 2px solid transparent;
  margin-top: -1px;
  transition: all 0.2s ease;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;

  &.active {
    color: #3682f8;
    border-top: 2px solid #3682f8;
  }

  &:hover {
    color: #3682f8;
  }
`;

const TabCount = styled.span`
  background-color: #3682f8;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  text-transform: none;
  letter-spacing: 0;
`;

export default ProfileTabs; 