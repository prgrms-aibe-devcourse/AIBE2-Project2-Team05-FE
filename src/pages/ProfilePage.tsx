import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useState } from 'react';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <ProfileHeader>
        <ProfileAvatar />
        <ProfileInfo>
          <Username>Traveler_Kim</Username>
          <Stats>
            <span>게시물 <strong>12</strong></span>
            <span>팔로워 <strong>1.2k</strong></span>
            <span>팔로우 <strong>345</strong></span>
          </Stats>
          <Bio>사진과 여행을 사랑하는 개발자. ✈️</Bio>
        </ProfileInfo>
        <EditProfileButton>프로필 수정</EditProfileButton>
      </ProfileHeader>
      
      <Tabs>
        <Tab onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>
          게시물
        </Tab>
        <Tab onClick={() => setActiveTab('saved')} className={activeTab === 'saved' ? 'active' : ''}>
          저장됨
        </Tab>
        <Tab onClick={() => setActiveTab('tagged')} className={activeTab === 'tagged' ? 'active' : ''}>
          태그됨
        </Tab>
      </Tabs>

      <TabContent>
        {activeTab === 'posts' && <div>게시물 콘텐츠</div>}
        {activeTab === 'saved' && <div>저장된 콘텐츠</div>}
        {activeTab === 'tagged' && <div>태그된 콘텐츠</div>}
      </TabContent>
    </motion.div>
  );
};

export default ProfilePage;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px;
  border-bottom: 1px solid #dbdbdb;
`;

const ProfileAvatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #eee;
  margin-right: 60px;
`;

const ProfileInfo = styled.div`
  flex-grow: 1;
`;

const Username = styled.h2`
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 20px;
`;

const Stats = styled.div`
  display: flex;
  margin-bottom: 20px;
  
  span {
    margin-right: 40px;
    font-size: 16px;
  }
  
  strong {
    font-weight: 600;
  }
`;

const Bio = styled.p`
  font-size: 16px;
`;

const EditProfileButton = styled.button`
  background-color: transparent;
  border: 1px solid #dbdbdb;
  color: #262626;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
`; 

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #dbdbdb;
`;

const Tab = styled.div`
  padding: 15px 30px;
  cursor: pointer;
  font-weight: 600;
  color: #8e8e8e;
  border-top: 1px solid transparent;
  margin-top: -1px;

  &.active {
    color: #262626;
    border-top: 1px solid #262626;
  }
`;

const TabContent = styled.div`
  padding: 20px;
  /* 여기에 그리드 레이아웃 등이 추가될 수 있습니다. */
`; 