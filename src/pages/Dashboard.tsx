import React from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';

// adminPage.html의 .stats-grid 스타일
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

// adminPage.html의 .stat-card 스타일
const StatCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StatTitle = styled.div`
  font-size: 15px;
  color: #666;
`;

const StatIcon = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;

  &.icon-users {
    background: linear-gradient(135deg, #3498db, #2980b9);
  }
  &.icon-new-users {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
  }
  &.icon-trips {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
  }
  &.icon-reports {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  gap: 5px;
  &.change-up {
    color: #2ecc71;
  }
  &.change-down {
    color: #e74c3c;
  }
`;

// adminPage.html의 .charts-grid 스타일
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

// adminPage.html의 .chart-card 스타일
const ChartCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ChartHeader = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  height: 250px;
`;

const RecentCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const RecentHeader = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const RecentList = styled.ul`
  list-style: none;
`;

const RecentItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 15px;
  &:last-child {
    border-bottom: none;
  }
`;

const RecentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  font-size: 16px;
`;

const RecentInfo = styled.div`
  flex: 1;
`;

const RecentName = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 3px;
`;

const RecentDetail = styled.div`
  font-size: 13px;
  color: #666;
`;

const StatusBadge = styled.div`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
`;

const Dashboard: React.FC = () => {
  return (
    <AdminLayout>
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>총 회원 수</StatTitle>
            <StatIcon className="icon-users">
              <i className="ri-user-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue>12,458</StatValue>
          <StatChange className="change-up">
            <i className="ri-arrow-up-s-line"></i>
            <span>8.3% 증가</span>
          </StatChange>
        </StatCard>
        <StatCard>
          <StatHeader>
            <StatTitle>신규 가입자 수</StatTitle>
            <StatIcon className="icon-new-users">
              <i className="ri-user-add-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue>342</StatValue>
          <StatChange className="change-up">
            <i className="ri-arrow-up-s-line"></i>
            <span>12.5% 증가</span>
          </StatChange>
        </StatCard>
        <StatCard>
          <StatHeader>
            <StatTitle>총 피드 수</StatTitle>
            <StatIcon className="icon-trips">
              <i className="ri-file-list-3-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue>876</StatValue>
          <StatChange className="change-up">
            <i className="ri-arrow-up-s-line"></i>
            <span>5.2% 증가</span>
          </StatChange>
        </StatCard>
        <StatCard>
          <StatHeader>
            <StatTitle>처리 대기 중인 신고 수</StatTitle>
            <StatIcon className="icon-reports">
              <i className="ri-alert-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue>28</StatValue>
          <StatChange className="change-down">
            <i className="ri-arrow-down-s-line"></i>
            <span>3.5% 감소</span>
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartHeader>가입자 추이 그래프</ChartHeader>
          <ChartContainer>
            <p>가입자 추이 그래프가 여기에 표시됩니다.</p>
          </ChartContainer>
        </ChartCard>
        <ChartCard>
          <ChartHeader>매칭 성공률 (월별)</ChartHeader>
          <ChartContainer>
            {/* Donut Chart placeholder */}
          </ChartContainer>
        </ChartCard>
      </ChartsGrid>

      <RecentCard>
        <RecentHeader>신고 이력</RecentHeader>
        <RecentList>
          <RecentItem>
            <RecentAvatar>
              <i className="ri-alert-line"></i>
            </RecentAvatar>
            <RecentInfo>
              <RecentName>부적절한 내용</RecentName>
              <RecentDetail>신고자: 김철수</RecentDetail>
            </RecentInfo>
            <StatusBadge>대기중</StatusBadge>
          </RecentItem>
          <RecentItem>
            <RecentAvatar>
              <i className="ri-alert-line"></i>
            </RecentAvatar>
            <RecentInfo>
              <RecentName>스팸 계정</RecentName>
              <RecentDetail>신고자: 박영희</RecentDetail>
            </RecentInfo>
            <StatusBadge>대기중</StatusBadge>
          </RecentItem>
        </RecentList>
      </RecentCard>
    </AdminLayout>
  );
};

export default Dashboard; 