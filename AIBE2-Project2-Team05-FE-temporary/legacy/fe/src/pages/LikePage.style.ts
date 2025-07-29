import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  color: #333;
  font-family: 'NotoSansHans', sans-serif;
  width: 100%;
`;

export const Header = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #4285f4, #34a5ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: relative;
`;

export const BackButton = styled.a`
  display: flex;
  align-items: center;
  color: white;
  font-size: 36px;
  text-decoration: none;

  i {
    margin-right: 10px;
    font-size: 48px;
  }
`;

export const AppTitle = styled.div`
  font-size: 48px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

export const MenuButton = styled.div`
  font-size: 48px;
`;

export const Content = styled.div`
  padding: 2rem;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #888;
  margin-bottom: 2rem;
`;

export const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  gap: 1rem;
`;

export const StatCard = styled.div`
  width: 33%;
  background-color: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

export const StatNumber = styled.div`
  font-size: 2.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;

  .heart-icon {
    color: #4285f4;
    font-size: 1.5rem;
    margin-right: 0.5rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-right: 1rem;
`;

export const CountBadge = styled.span`
  background-color: #f0f5ff;
  color: #4285f4;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
`;

export const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
`;

export const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  background: #fff;
`;

export const ProfileImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e6f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: #4285f4;
  font-weight: bold;
  flex-shrink: 0;
`;

export const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const UserName = styled.div`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserDescription = styled.div`
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserMeta = styled.div`
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FollowButton = styled.button<{ isFollowing: boolean }>`
  background-color: ${(props) => (props.isFollowing ? 'white' : '#4285f4')};
  color: ${(props) => (props.isFollowing ? '#4285f4' : 'white')};
  border: ${(props) => (props.isFollowing ? '2px solid #4285f4' : 'none')};
  border-radius: 1.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  font-weight: bold;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`; 