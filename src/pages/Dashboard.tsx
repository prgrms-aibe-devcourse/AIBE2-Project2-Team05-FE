import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/admin/AdminLayout';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 타입 정의
interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  status?: string;
  createdAt: string;
}

interface AdminFeedDto {
  id: number;
  imageUrl: string;
  caption: string;
  createdBy: string;
}

interface Report {
  id: number;
  reporter: {
    id: number;
    nickname: string;
    email: string;
  };
  reportedUser: {
    id: number;
    nickname: string;
    email: string;
  };
  reportType: string;
  description: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  totalFeeds: number;
  pendingReports: number;
  newUsersChange: number;
}

interface MonthlyUserData {
  month: string;
  users: number;
}

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
  
  &.loading {
    color: #bbb;
  }
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
  &.loading {
    color: #bbb;
  }
`;

// 차트 컨테이너를 전체 폭으로 변경
const ChartSection = styled.div`
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
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: "📈";
    font-size: 24px;
  }
`;

const ChartContainer = styled.div`
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-style: italic;
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
  max-height: 400px;
  overflow-y: auto;
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

const StatusBadge = styled.div<{ status?: string }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ status }) => {
    switch (status) {
      case 'PENDING': return 'rgba(241, 196, 15, 0.1)';
      case 'RESOLVED': return 'rgba(46, 204, 113, 0.1)';
      case 'REJECTED': return 'rgba(231, 76, 60, 0.1)';
      default: return 'rgba(108, 117, 125, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'PENDING': return '#f1c40f';
      case 'RESOLVED': return '#2ecc71';
      case 'REJECTED': return '#e74c3c';
      default: return '#6c757d';
    }
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  padding: 20px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
  
  &::before {
    content: "🎉";
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsers: 0,
    totalFeeds: 0,
    pendingReports: 0,
    newUsersChange: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 신고 유형 한글 변환
  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'INAPPROPRIATE_CONTENT': return '부적절한 콘텐츠';
      case 'HARASSMENT': return '괴롭힘';
      case 'SPAM': return '스팸';
      case 'FAKE_PROFILE': return '가짜 프로필';
      default: return type;
    }
  };

  // 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'REVIEWED': return '검토완료';
      case 'RESOLVED': return '해결완료';
      case 'REJECTED': return '반려';
      default: return status;
    }
  };

  // 월별 가입자 데이터 계산 함수
  const calculateMonthlyUserData = (users: User[]): MonthlyUserData[] => {
    const monthlyCount: { [key: string]: number } = {};
    
    // 최근 12개월 초기화
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);
      monthlyCount[monthKey] = 0;
    }

    // 사용자 가입일별로 카운트
    users.forEach(user => {
      const createdAt = new Date(user.createdAt);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyCount.hasOwnProperty(monthKey)) {
        monthlyCount[monthKey]++;
      }
    });

    // 월별 데이터 반환
    return months.map(month => ({
      month: month,
      users: monthlyCount[month]
    }));
  };

  // 차트 데이터 생성
  const chartData = {
    labels: monthlyData.map(data => {
      const [year, month] = data.month.split('-');
      return `${year}년 ${month}월`;
    }),
    datasets: [
      {
        label: '월별 가입자 수',
        data: monthlyData.map(data => data.users),
        borderColor: 'rgb(52, 152, 219)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(52, 152, 219)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#2c3e50',
          font: {
            size: 14,
            weight: '500',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(44, 62, 80, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(52, 152, 219)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y}명 가입`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return value + '명';
          }
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(52, 152, 219)',
        hoverBorderColor: '#ffffff',
      }
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: token ? `Bearer ${token}` : ''
        };

        // 병렬로 모든 데이터 요청
        const [usersResponse, feedsResponse, reportsResponse] = await Promise.all([
          api.get('/api/admin/manage/users', { headers }),
          api.get('/api/admin/manage/feeds', { headers }),
          api.get('/api/admin/manage/reports', { headers })
        ]);

        console.log('Dashboard API Responses:', {
          users: usersResponse,
          feeds: feedsResponse,
          reports: reportsResponse
        });

        const users: User[] = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const feeds: AdminFeedDto[] = Array.isArray(feedsResponse.data) ? feedsResponse.data : [];
        const reports: Report[] = Array.isArray(reportsResponse.data) ? reportsResponse.data : [];

        // 최근 30일 기준 계산
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // 신규 사용자 계산 (최근 30일)
        const newUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= thirtyDaysAgo;
        }).length;

        // 이전 30일 신규 사용자 (30-60일 전)
        const previousNewUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
        }).length;

        // 신규 사용자 증감률 계산
        const newUsersChange = previousNewUsers > 0 
          ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 
          : newUsers > 0 ? 100 : 0;

        // 대기중인 신고 수
        const pendingReports = reports.filter(report => report.status === 'PENDING').length;

        setStats({
          totalUsers: users.length,
          newUsers,
          totalFeeds: feeds.length,
          pendingReports,
          newUsersChange: Math.round(newUsersChange * 10) / 10 // 소수점 1자리
        });

        // 월별 가입자 데이터 계산
        const monthlyUserData = calculateMonthlyUserData(users);
        setMonthlyData(monthlyUserData);

        // 최근 신고 목록 (최대 10개, 최신순)
        const sortedReports = reports
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        
        setRecentReports(sortedReports);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <StatValue className={isLoading ? 'loading' : ''}>
            {isLoading ? '로딩 중...' : stats.totalUsers.toLocaleString()}
          </StatValue>
          <StatChange className={isLoading ? 'loading' : 'change-up'}>
            <i className="ri-arrow-up-s-line"></i>
            <span>{isLoading ? '계산 중...' : '전체 등록 회원'}</span>
          </StatChange>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <StatTitle>신규 가입자 수 (30일)</StatTitle>
            <StatIcon className="icon-new-users">
              <i className="ri-user-add-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue className={isLoading ? 'loading' : ''}>
            {isLoading ? '로딩 중...' : stats.newUsers.toLocaleString()}
          </StatValue>
          <StatChange className={
            isLoading ? 'loading' : 
            stats.newUsersChange >= 0 ? 'change-up' : 'change-down'
          }>
            <i className={`ri-arrow-${stats.newUsersChange >= 0 ? 'up' : 'down'}-s-line`}></i>
            <span>
              {isLoading ? '계산 중...' : 
               stats.newUsersChange >= 0 ? 
               `${stats.newUsersChange}% 증가` : 
               `${Math.abs(stats.newUsersChange)}% 감소`}
            </span>
          </StatChange>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <StatTitle>총 피드 수</StatTitle>
            <StatIcon className="icon-trips">
              <i className="ri-file-list-3-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue className={isLoading ? 'loading' : ''}>
            {isLoading ? '로딩 중...' : stats.totalFeeds.toLocaleString()}
          </StatValue>
          <StatChange className={isLoading ? 'loading' : 'change-up'}>
            <i className="ri-arrow-up-s-line"></i>
            <span>{isLoading ? '계산 중...' : '전체 등록 피드'}</span>
          </StatChange>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <StatTitle>처리 대기 중인 신고</StatTitle>
            <StatIcon className="icon-reports">
              <i className="ri-alert-line"></i>
            </StatIcon>
          </StatHeader>
          <StatValue className={isLoading ? 'loading' : ''}>
            {isLoading ? '로딩 중...' : stats.pendingReports.toLocaleString()}
          </StatValue>
          <StatChange className={
            isLoading ? 'loading' : 
            stats.pendingReports <= 5 ? 'change-up' : 'change-down'
          }>
            <i className={`ri-arrow-${stats.pendingReports <= 5 ? 'down' : 'up'}-s-line`}></i>
            <span>
              {isLoading ? '계산 중...' : 
               stats.pendingReports <= 5 ? '양호한 수준' : '관리 필요'}
            </span>
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <ChartCard>
          <ChartHeader>월별 가입자 추이</ChartHeader>
          <ChartContainer>
            {isLoading ? (
              <LoadingMessage>차트 데이터를 불러오는 중...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : monthlyData.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <EmptyMessage>가입자 데이터가 없습니다</EmptyMessage>
            )}
          </ChartContainer>
        </ChartCard>
      </ChartSection>

      <RecentCard>
        <RecentHeader>최근 신고 이력</RecentHeader>
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : isLoading ? (
          <LoadingMessage>신고 이력을 불러오는 중...</LoadingMessage>
        ) : recentReports.length === 0 ? (
          <EmptyMessage>
            최근 신고가 없습니다.<br />
            <small>모든 사용자들이 건전하게 이용하고 있습니다!</small>
          </EmptyMessage>
        ) : (
          <RecentList>
            {recentReports.map((report) => (
              <RecentItem key={report.id}>
                <RecentAvatar>
                  <i className="ri-alert-line"></i>
                </RecentAvatar>
                <RecentInfo>
                  <RecentName>{getReportTypeText(report.reportType)}</RecentName>
                  <RecentDetail>
                    신고자: {report.reporter?.nickname || '알 수 없음'} → 대상: {report.reportedUser?.nickname || '알 수 없음'}
                  </RecentDetail>
                  <RecentDetail style={{ fontSize: '12px', marginTop: '2px' }}>
                    {new Date(report.createdAt).toLocaleString()}
                  </RecentDetail>
                </RecentInfo>
                <StatusBadge status={report.status}>
                  {getStatusText(report.status)}
                </StatusBadge>
              </RecentItem>
            ))}
          </RecentList>
        )}
      </RecentCard>
    </AdminLayout>
  );
};

export default Dashboard; 