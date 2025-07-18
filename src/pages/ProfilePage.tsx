import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

const Modal = ({ imageUrl, onClose }: ModalProps) => (
  <ModalOverlay onClick={onClose}>
    <CloseButton onClick={onClose}>&times;</CloseButton>
    <ModalContent onClick={(e: MouseEvent) => e.stopPropagation()}>
      <PostImage src={imageUrl} alt="modal content" />
      <PostDetailsContainer>
        <PostHeader>
          <AuthorInfo>
            <AuthorAvatar />
            <span>여행자123</span>
          </AuthorInfo>
          <i className="ri-more-line"></i>
        </PostHeader>
        <PostDetails>
            <PostActions>
                <div>
                    <i className="ri-heart-line"></i>
                    <i className="ri-chat-3-line"></i>
                    <i className="ri-send-plane-line"></i>
                </div>
                <i className="ri-bookmark-line"></i>
            </PostActions>
            <Likes>좋아요 128개</Likes>
            <Caption>
                <strong>여행자123</strong> 제주도 여행 중! 오늘은 성산일출봉에서 아름다운 일출을 감상했어요. 다음에 제주도 여행 오시는 분들은 꼭 일출 보러 오세요! #제주도여행 #성산일출봉 #아침일출
            </Caption>
            <Comments>댓글 23개 모두 보기</Comments>
            <Timestamp>3시간 전</Timestamp>
        </PostDetails>
        <CommentInputSection>
          <CommentInput type="text" placeholder="댓글 달기..." />
          <PostButton>게시</PostButton>
        </CommentInputSection>
      </PostDetailsContainer>
    </ModalContent>
  </ModalOverlay>
);

const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleEditProfile = () => {
    navigate('/mypage');
  };

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage('');
  };

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
        <EditProfileButton onClick={handleEditProfile}>프로필 수정</EditProfileButton>
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
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <PostGrid onImageClick={openModal} />
            </motion.div>
          )}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <PostGrid onImageClick={openModal} />
            </motion.div>
          )}
          {activeTab === 'tagged' && (
            <motion.div
              key="tagged"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <PostGrid onImageClick={openModal} />
            </motion.div>
          )}
        </AnimatePresence>
      </TabContent>

      {modalOpen && <Modal imageUrl={selectedImage} onClose={closeModal} />}
    </motion.div>
  );
};

interface PostGridProps {
  onImageClick: (imageUrl: string) => void;
}

const PostGrid = ({ onImageClick }: PostGridProps) => (
  <PostsGridContainer>
    {Array.from({ length: 9 }).map((_, index) => {
      const imageUrl = `https://picsum.photos/300/300?random=${index}`;
      return (
        <PostItem key={index} onClick={() => onImageClick(imageUrl)}>
          <img src={imageUrl} alt={`post-${index}`} />
        </PostItem>
      );
    })}
  </PostsGridContainer>
);

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
`;

const PostsGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
`;

const PostItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 Aspect Ratio */
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`; 

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 90vw;
  height: 90vh;
  max-width: 900px;
  max-height: 600px;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;
  
  @media (min-width: 768px) {
    width: 60%;
    height: 100%;
  }
`;

const PostDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: 768px) {
    width: 40%;
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 50px 16px 16px; /* X 버튼과의 간격 확보 */
  border-bottom: 1px solid #efefef;

  i {
    font-size: 24px;
    cursor: pointer;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  
  span {
    margin-left: 12px;
  }
`;

const AuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #eee;
`;

const PostActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 10px;

  i {
    font-size: 24px;
    margin-right: 12px;
    cursor: pointer;
  }
`;

const PostDetails = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const CommentInputSection = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid #efefef;
`;

const CommentInput = styled.input`
  flex-grow: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
`;

const PostButton = styled.button`
  border: none;
  background-color: transparent;
  color: #0095f6;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    color: #b2dffc;
  }
`;

const Likes = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const Caption = styled.div`
  margin-bottom: 8px;

  strong {
    margin-right: 5px;
  }
`;

const Comments = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #8e8e8e;
`;

const Timestamp = styled.div`
  color: #8e8e8e;
  font-size: 12px;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 20px;
  right: 40px; /* 오른쪽에서 좀 더 안쪽으로 이동 */
  font-size: 40px;
  font-weight: 300;
  color: #fff;
  cursor: pointer;
  z-index: 1010;
`; 