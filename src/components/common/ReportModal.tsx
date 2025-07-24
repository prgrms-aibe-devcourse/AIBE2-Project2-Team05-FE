import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createReport, searchUsers } from '../../services/api';

// 사용자 검색 결과 타입을 정의합니다.
interface SearchUser {
  id: number;
  nickname: string;
  email: string;
}

// 신고하기 모달의 props 타입을 정의합니다.
interface ReportModalProps {
  isOpen: boolean;           // 모달이 열려있는지 여부
  onClose: () => void;       // 모달을 닫을 때 호출할 함수
  reportedUserId?: number;   // 신고당할 사용자 ID (일반 신고용, 선택사항)
}

// 신고 유형 옵션들을 배열로 정의합니다.
const REPORT_TYPES = [
  '욕설 및 비방',
  '스팸 및 광고',
  '부적절한 내용',
  '사기 및 허위 정보',
  '기타'
];

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  reportedUserId 
}) => {
  // 모달 내부에서 관리할 상태들
  const [reportType, setReportType] = useState(''); // 선택된 신고 유형
  const [description, setDescription] = useState(''); // 신고 상세 설명
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중인지 여부
  
  // 사용자 검색 관련 상태들
  const [searchKeyword, setSearchKeyword] = useState(''); // 검색 키워드
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]); // 검색 결과
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null); // 선택된 사용자
  const [isSearching, setIsSearching] = useState(false); // 검색 중인지 여부

  // 모달이 닫혀있으면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  // 폼 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지

    // 필수 입력값 검증
    if (!reportType) {
      alert('신고 유형을 선택해주세요.');
      return;
    }

    if (!description.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }

    // 사용자 선택 검증 (일반 신고의 경우)
    if (!reportedUserId && !selectedUser) {
      alert('신고할 사용자를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // API 호출
      await createReport({
        reportedUserId: reportedUserId || selectedUser!.id,
        reportType,
        description: description.trim(),
      });

      alert('신고가 성공적으로 접수되었습니다. 관리자가 검토 후 조치할 예정입니다.');
      
      // 폼 초기화
      resetForm();
      
      // 모달 닫기
      onClose();
    } catch (error) {
      console.error('신고 접수 중 오류:', error);
      alert('신고 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setReportType('');
    setDescription('');
    setSearchKeyword('');
    setSearchResults([]);
    setSelectedUser(null);
  };

  // 모달 닫기 처리 (배경 클릭이나 취소 버튼)
  const handleClose = () => {
    if (isSubmitting) return; // 제출 중일 때는 닫기 방지
    
    // 폼 초기화
    resetForm();
    
    onClose();
  };

  // 사용자 검색 함수
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    
    if (keyword.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(keyword.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('사용자 검색 중 오류:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 사용자 선택 함수
  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
    setSearchKeyword(user.nickname);
    setSearchResults([]);
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>신고하기</ModalTitle>
          <CloseButton onClick={handleClose} disabled={isSubmitting}>
            ×
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <form onSubmit={handleSubmit}>
            {/* 사용자 검색 (일반 신고용) */}
            {!reportedUserId && (
              <FormGroup>
                <FormLabel>신고할 사용자 검색</FormLabel>
                <SearchContainer>
                  <SearchInput
                    type="text"
                    value={searchKeyword}
                                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                    placeholder="닉네임으로 사용자를 검색하세요 (2글자 이상)"
                    disabled={isSubmitting}
                  />
                  {isSearching && <SearchStatus>검색 중...</SearchStatus>}
                </SearchContainer>
                
                {/* 검색 결과 목록 */}
                {searchResults.length > 0 && (
                  <SearchResults>
                    {searchResults.map((user) => (
                      <SearchResultItem
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        disabled={isSubmitting}
                      >
                        <UserInfo>
                          <UserNickname>{user.nickname}</UserNickname>
                          <UserEmail>{user.email}</UserEmail>
                        </UserInfo>
                        <SelectButton>선택</SelectButton>
                      </SearchResultItem>
                    ))}
                  </SearchResults>
                )}
                
                {/* 선택된 사용자 표시 */}
                {selectedUser && (
                  <SelectedUser>
                    <span>선택된 사용자: <strong>{selectedUser.nickname}</strong></span>
                    <ClearButton 
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchKeyword('');
                      }}
                      disabled={isSubmitting}
                    >
                      ×
                    </ClearButton>
                  </SelectedUser>
                )}
              </FormGroup>
            )}

            {/* 신고 유형 선택 */}
            <FormGroup>
              <FormLabel>신고 유형 *</FormLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">신고 유형을 선택하세요</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {/* 신고 상세 설명 */}
            <FormGroup>
              <FormLabel>신고 사유 *</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="신고 사유를 자세히 작성해주세요."
                rows={4}
                disabled={isSubmitting}
              />
            </FormGroup>

            {/* 버튼 영역 */}
            <ButtonContainer>
              <CancelButton 
                type="button" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                취소
              </CancelButton>
              <SubmitButton 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? '접수 중...' : '신고 접수'}
              </SubmitButton>
            </ButtonContainer>
          </form>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReportModal;

// ======= 스타일 컴포넌트들 =======

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: #bdc3c7;
  }
`;

// ======= 사용자 검색 관련 스타일 컴포넌트들 =======

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SearchStatus = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #666;
`;

const SearchResults = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 8px;
  background: white;
`;

const SearchResultItem = styled.div<{ disabled?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : '#f5f5f5'};
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserNickname = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #666;
`;

const SelectButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #3498db;
  background: transparent;
  color: #3498db;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #3498db;
    color: white;
  }
`;

const SelectedUser = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #e8f0fe;
  border: 1px solid #3498db;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 14px;
  color: #333;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`; 