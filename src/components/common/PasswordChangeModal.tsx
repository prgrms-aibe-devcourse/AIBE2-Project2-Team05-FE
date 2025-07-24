import React, { useState } from 'react';
import styled from 'styled-components';
import { changePassword } from '../../services/api';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 입력 시 이전 오류/성공 메시지 초기화
    setError('');
    setSuccess('');
  };

  const validatePassword = (password: string) => {
    // 최소 8자, 영문+숫자+특수문자 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 유효성 검사
    if (!formData.currentPassword || !formData.newPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setError('새 비밀번호는 최소 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword({
        ...formData,
        confirmPassword: formData.newPassword // 새 비밀번호를 확인 비밀번호로 사용
      });
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setFormData({
        currentPassword: '',
        newPassword: '',
      });
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>비밀번호 변경</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              type="password"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              type="password"
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (최소 8자)"
              required
            />
            <PasswordHint>
              영문, 숫자, 특수문자를 포함하여 최소 8자 이상
            </PasswordHint>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PasswordChangeModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #999;
  }
`;

const PasswordHint = styled.small`
  color: #666;
  font-size: 14px;
  margin-top: 5px;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  padding: 10px;
  background-color: #fdf2f2;
  border-radius: 5px;
  border-left: 4px solid #e74c3c;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 14px;
  padding: 10px;
  background-color: #f0f9f4;
  border-radius: 5px;
  border-left: 4px solid #27ae60;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 2px solid #e1e5e9;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ccc;
    background-color: #f8f9fa;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`; 