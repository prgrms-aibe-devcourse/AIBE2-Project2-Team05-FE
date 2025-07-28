import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { UserSearchResult } from '../../types/chat';
import { searchUsers } from '../../services/chatApi';

// 스타일 컴포넌트들
const ModalOverlay = styled(motion.div)`
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
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 600px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  margin-left: auto;
  
  &:hover {
    color: #333;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const UserList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  
  i {
    color: white;
    font-size: 20px;
  }
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  
  .nickname {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }
  
  .email {
    font-size: 14px;
    color: #666;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  i {
    font-size: 48px;
    margin-bottom: 16px;
    color: #ccc;
  }
  
  p {
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

// 컴포넌트 props 타입 정의
interface UserSearchModalProps {
  isOpen: boolean;           // 모달 열림/닫힘 상태
  onClose: () => void;      // 모달 닫기 함수
  onUserSelect: (user: UserSearchResult) => void; // 사용자 선택 시 호출되는 함수
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onUserSelect
}) => {
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');     // 검색어
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]); // 검색 결과
  const [isLoading, setIsLoading] = useState(false);      // 로딩 상태

  // 검색어 변경 시 검색 실행 (디바운싱 적용)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // 300ms 딜레이 후 검색 실행 (너무 많은 API 호출 방지)
    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    // 이전 타이머 정리 (디바운싱)
    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // 실제 검색 수행 함수
  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 선택 처리
  const handleUserSelect = (user: UserSearchResult) => {
    onUserSelect(user);  // 선택된 사용자 정보를 부모 컴포넌트로 전달
    onClose();           // 모달 닫기
  };

  // 모달 애니메이션 설정
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // 배경 클릭 시 모달 닫기
        >
          <ModalContainer
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 차단
          >
            <ModalHeader>
              <h2>사용자 검색</h2>
              <CloseButton onClick={onClose}>
                <i className="ri-close-line"></i>
              </CloseButton>
            </ModalHeader>

            <SearchInput
              type="text"
              placeholder="닉네임을 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus // 모달 열릴 때 자동으로 포커스
            />

            <UserList>
              {isLoading ? (
                <LoadingState>
                  <i className="ri-loader-4-line"></i>
                  <p>검색 중...</p>
                </LoadingState>
              ) : searchResults.length > 0 ? (
                // 검색 결과가 있는 경우
                searchResults.map((user) => (
                  <UserItem 
                    key={user.id} 
                    onClick={() => handleUserSelect(user)}
                  >
                    <UserAvatar>
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.nickname} />
                      ) : (
                        <i className="ri-user-line"></i>
                      )}
                    </UserAvatar>
                    <UserInfo>
                      <div className="nickname">{user.nickname}</div>
                      <div className="email">{user.email}</div>
                    </UserInfo>
                  </UserItem>
                ))
              ) : searchQuery.trim() !== '' ? (
                // 검색어는 있지만 결과가 없는 경우
                <EmptyState>
                  <i className="ri-search-line"></i>
                  <p>검색 결과가 없습니다.</p>
                </EmptyState>
              ) : (
                // 아직 검색어를 입력하지 않은 경우
                <EmptyState>
                  <i className="ri-user-search-line"></i>
                  <p>닉네임을 입력하여 사용자를 검색하세요.</p>
                </EmptyState>
              )}
            </UserList>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default UserSearchModal; 