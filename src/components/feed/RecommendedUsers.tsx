import styled from 'styled-components';

const RecommendedUsers = () => {
  const users = [
    { id: 1, name: '여행가 A', reason: '회원님과 여행 스타일이 비슷해요' },
    { id: 2, name: '탐험가 B', reason: '최근 같은 지역을 여행했어요' },
    { id: 3, name: '미식가 C', reason: '관심사가 비슷해요' },
    { id: 4, name: '사진작가 D', reason: '회원님을 위한 추천' },
  ];

  return (
    <Container>
      <Header>
        <h4>회원님을 위한 추천</h4>
        <SeeAll>모두 보기</SeeAll>
      </Header>
      <UserList>
        {users.map(user => (
          <UserItem key={user.id}>
            <UserAvatar />
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserReason>{user.reason}</UserReason>
            </UserInfo>
            <FollowButton>팔로우</FollowButton>
          </UserItem>
        ))}
      </UserList>
    </Container>
  );
};

export default RecommendedUsers;

const Container = styled.div`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #8e8e8e;
  }
`;

const SeeAll = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: #262626;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

const UserList = styled.ul`
  list-style: none;
`;

const UserItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #dbdbdb;
  margin-right: 12px;
`;

const UserInfo = styled.div`
  flex-grow: 1;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #262626;
`;

const UserReason = styled.div`
  font-size: 12px;
  color: #8e8e8e;
`;

const FollowButton = styled.button`
  font-size: 12px;
  font-weight: 600;
  color: #3897f0;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`; 