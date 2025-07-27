import React, { useState, useMemo } from 'react'; // useMemo 추가
import * as S from './ReviewPage.style';
// 더미 데이터와 타입들을 가져옵니다.
import {
  dummyReviewTargets,
  dummyReceivedReviews,
  dummyWrittenReviews,
  dummyReviewStats,
  ReviewTarget,
  Review,
} from '../data/dummyReviews';

// 별점을 표시하는 재사용 가능한 컴포넌트
interface StarRatingProps {
  rating: number; // 현재 별점
  setRating?: (rating: number) => void; // 별점 변경 함수 (선택적)
}

const StarRating = ({ rating, setRating }: StarRatingProps) => {
  // 0부터 4까지의 숫자를 담는 배열 [0, 1, 2, 3, 4]
  const stars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <S.RatingStars>
      {stars.map((starIndex) => (
        <S.Star
          key={starIndex}
          // 현재 별(starIndex + 1)이 전체 평점(rating)보다 작거나 같으면 'active' 클래스 적용
          className={`ri-star-fill ${starIndex + 1 <= rating ? 'active' : ''}`}
          // setRating 함수가 있을 경우에만 클릭 이벤트와 포인터 커서를 적용
          onClick={() => setRating && setRating(starIndex + 1)}
          style={{ cursor: setRating ? 'pointer' : 'default' }}
        />
      ))}
    </S.RatingStars>
  );
};

// '리뷰 작성' 탭 컴포넌트
// 부모로부터 리뷰 등록 함수를 props로 받습니다.
const WriteReview = ({ onRegister }: { onRegister: (newReview: Omit<Review, 'id' | 'date' | 'photos'>) => void }) => {
  const [selectedTarget, setSelectedTarget] = useState<ReviewTarget | null>(dummyReviewTargets[1]);
  const [overallRating, setOverallRating] = useState(4);
  const [title, setTitle] = useState(''); // 리뷰 제목 상태
  const [content, setContent] = useState(''); // 리뷰 내용 상태

  // '리뷰 등록하기' 버튼 클릭 시 호출될 함수
  const handleSubmit = () => {
    if (!selectedTarget) {
      alert('리뷰 대상을 선택해주세요.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert('리뷰 제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 부모로부터 받은 onRegister 함수를 호출하여 새 리뷰 정보를 전달합니다.
    onRegister({
      reviewee: {
        name: selectedTarget.name,
        avatar: selectedTarget.avatar,
      },
      rating: overallRating,
      title,
      content,
    });

    // 폼 초기화
    alert('리뷰가 성공적으로 등록되었습니다!');
    setTitle('');
    setContent('');
    setOverallRating(4);
  };

  return (
    <>
      <S.ReviewTargetSection>
        <S.SectionTitle>리뷰 대상자 선택</S.SectionTitle>
        <S.UserList>
          {dummyReviewTargets.map((target) => (
            <S.UserCard
              key={target.id}
              className={selectedTarget?.id === target.id ? 'selected' : ''}
              onClick={() => setSelectedTarget(target)}
            >
              <S.UserAvatar>
                <i className="ri-user-line" style={{ fontSize: '24px' }}></i>
              </S.UserAvatar>
              <S.UserName>{target.name}</S.UserName>
              <S.UserTrip>{target.trip}</S.UserTrip>
            </S.UserCard>
          ))}
        </S.UserList>
      </S.ReviewTargetSection>

      <S.ReviewFormSection>
        <S.FormGroup>
          <S.FormLabel>전체 평점</S.FormLabel>
          <StarRating rating={overallRating} setRating={setOverallRating} />
        </S.FormGroup>
        
        <S.FormGroup>
          <S.FormLabel>리뷰 제목</S.FormLabel>
          <S.FormInput
            type="text"
            placeholder="리뷰 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </S.FormGroup>
        <S.FormGroup>
          <S.FormLabel>리뷰 내용</S.FormLabel>
          <S.Textarea
            placeholder="여행 동반자에 대한 솔직한 리뷰를 작성해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </S.FormGroup>
        <S.SubmitButton onClick={handleSubmit}>리뷰 등록하기</S.SubmitButton>
      </S.ReviewFormSection>
    </>
  );
};

// '받은 리뷰' 탭 컴포넌트
// 부모로부터 리뷰 목록을 props로 받습니다.
const ReceivedReviews = ({ reviews }: { reviews: Review[] }) => {
  const stats = dummyReviewStats;
  const [filter, setFilter] = useState('latest');

  const sortedReviews = useMemo(() => {
    // 원본 배열을 직접 수정하지 않기 위해 복사본을 만듭니다.
    const newReviews = [...reviews];
    switch (filter) {
      case 'high':
        return newReviews.sort((a, b) => b.rating - a.rating);
      case 'low':
        return newReviews.sort((a, b) => a.rating - b.rating);
      case 'latest':
      default:
        return newReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [reviews, filter]);

  return (
    <>
      <S.ReviewStats>
        {/* 평균 평점 */}
        <S.AverageRating>
          <S.RatingNumber>{stats.averageRating.toFixed(1)}</S.RatingNumber>
          <StarRating rating={stats.averageRating} />
          <S.RatingCount>총 {stats.totalCount}개의 리뷰</S.RatingCount>
        </S.AverageRating>
        {/* 카테고리별 통계 */}
        <S.CategoryStats>
          <S.CategoryStat>
            <S.CategoryLabel>친절도</S.CategoryLabel>
            <S.ProgressBar>
              <S.Progress width={`${(stats.categoryStats.kindness / 5) * 100}%`} />
            </S.ProgressBar>
            <S.CategoryValue>{stats.categoryStats.kindness.toFixed(1)}</S.CategoryValue>
          </S.CategoryStat>
          <S.CategoryStat>
            <S.CategoryLabel>시간 약속</S.CategoryLabel>
            <S.ProgressBar>
              <S.Progress width={`${(stats.categoryStats.timeliness / 5) * 100}%`} />
            </S.ProgressBar>
            <S.CategoryValue>{stats.categoryStats.timeliness.toFixed(1)}</S.CategoryValue>
          </S.CategoryStat>
          <S.CategoryStat>
            <S.CategoryLabel>여행 스타일</S.CategoryLabel>
            <S.ProgressBar>
              <S.Progress width={`${(stats.categoryStats.styleMatch / 5) * 100}%`} />
            </S.ProgressBar>
            <S.CategoryValue>{stats.categoryStats.styleMatch.toFixed(1)}</S.CategoryValue>
          </S.CategoryStat>
        </S.CategoryStats>
      </S.ReviewStats>

      {/* 리뷰 목록 필터링 바 */}
      <S.FilterBar>
        <S.FilterOptions>
          <S.FilterOption
            className={filter === 'latest' ? 'active' : ''}
            onClick={() => setFilter('latest')}
          >최신순</S.FilterOption>
          <S.FilterOption
            className={filter === 'high' ? 'active' : ''}
            onClick={() => setFilter('high')}
          >평점 높은순</S.FilterOption>
          <S.FilterOption
            className={filter === 'low' ? 'active' : ''}
            onClick={() => setFilter('low')}
          >평점 낮은순</S.FilterOption>
        </S.FilterOptions>
      </S.FilterBar>

      {/* 리뷰 목록 */}
      <S.ReviewList>
        {sortedReviews.map((review) => (
          <S.ReviewCard key={review.id}>
            <S.ReviewHeader>
              <S.Reviewer>
                <S.ReviewerAvatar>
                  <i className="ri-user-line" style={{ fontSize: '20px' }}></i>
                </S.ReviewerAvatar>
                <S.ReviewerInfo>
                  <S.ReviewerName>{review.reviewer?.name}</S.ReviewerName>
                  <S.ReviewDate>{review.date}</S.ReviewDate>
                </S.ReviewerInfo>
              </S.Reviewer>
              <S.ReviewRating>
                <StarRating rating={review.rating} />
                <span style={{marginLeft: '10px'}}>{review.rating.toFixed(1)}</span>
              </S.ReviewRating>
            </S.ReviewHeader>
            <S.ReviewTitle>{review.title}</S.ReviewTitle>
            <S.ReviewContent>{review.content}</S.ReviewContent>
            <S.ReviewActions>
              <S.ActionButton>
                <i className="ri-chat-1-line"></i> 답글 달기
              </S.ActionButton>
              <S.ActionButton>
                <i className="ri-flag-line"></i> 신고하기
              </S.ActionButton>
            </S.ReviewActions>
          </S.ReviewCard>
        ))}
      </S.ReviewList>
    </>
  );
};

// '작성한 리뷰' 탭 컴포넌트
// 부모로부터 리뷰 목록을 props로 받습니다.
const WrittenReviews = ({ reviews }: { reviews: Review[] }) => {
  const [filter, setFilter] = useState('latest');

  const sortedReviews = useMemo(() => {
    const newReviews = [...reviews];
    switch (filter) {
      case 'high':
        return newReviews.sort((a, b) => b.rating - a.rating);
      case 'low':
        return newReviews.sort((a, b) => a.rating - b.rating);
      case 'latest':
      default:
        return newReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [reviews, filter]);

  return (
    <>
      {/* 리뷰 목록 필터링 바 */}
      <S.FilterBar>
        <S.FilterOptions>
          <S.FilterOption
            className={filter === 'latest' ? 'active' : ''}
            onClick={() => setFilter('latest')}
          >최신순</S.FilterOption>
          <S.FilterOption
            className={filter === 'high' ? 'active' : ''}
            onClick={() => setFilter('high')}
          >평점 높은순</S.FilterOption>
          <S.FilterOption
            className={filter === 'low' ? 'active' : ''}
            onClick={() => setFilter('low')}
          >평점 낮은순</S.FilterOption>
        </S.FilterOptions>
      </S.FilterBar>

      {/* 내가 작성한 리뷰 목록 */}
      <S.ReviewList>
        {sortedReviews.map((review) => (
          <S.ReviewCard key={review.id}>
            <S.ReviewHeader>
              <S.Reviewer>
                <S.ReviewerAvatar>
                  <i className="ri-user-line" style={{ fontSize: '20px' }}></i>
                </S.ReviewerAvatar>
                <S.ReviewerInfo>
                  {/* reviewee는 내가 리뷰를 작성한 대상을 의미합니다. */}
                  <S.ReviewerName>{review.reviewee?.name}</S.ReviewerName>
                  <S.ReviewDate>{review.date}</S.ReviewDate>
                </S.ReviewerInfo>
              </S.Reviewer>
              <S.ReviewRating>
                <StarRating rating={review.rating} />
                 <span style={{marginLeft: '10px'}}>{review.rating.toFixed(1)}</span>
              </S.ReviewRating>
            </S.ReviewHeader>
            <S.ReviewTitle>{review.title}</S.ReviewTitle>
            <S.ReviewContent>{review.content}</S.ReviewContent>
            <S.ReviewActions>
              {/* 내가 작성한 리뷰이므로 '수정'과 '삭제' 버튼을 보여줍니다. */}
              <S.ActionButton>
                <i className="ri-edit-line"></i> 수정하기
              </S.ActionButton>
              <S.ActionButton>
                <i className="ri-delete-bin-line"></i> 삭제하기
              </S.ActionButton>
            </S.ReviewActions>
          </S.ReviewCard>
        ))}
      </S.ReviewList>
    </>
  );
};

const ReviewPage = () => {
  // 현재 선택된 탭을 관리하는 상태입니다.
  // 'write', 'received', 'written' 세 가지 상태를 가질 수 있습니다.
  // useState의 초기값으로 'write'를 주어, 페이지가 처음 열렸을 때 '리뷰 작성' 탭이 보이도록 합니다.
  const [activeTab, setActiveTab] = useState('write');
  
  // 상태 끌어올리기: 부모 컴포넌트에서 리뷰 목록 상태를 관리합니다.
  const [writtenReviews, setWrittenReviews] = useState<Review[]>(dummyWrittenReviews);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>(dummyReceivedReviews);

  // 새 리뷰를 등록하는 함수
  const handleRegisterReview = (newReviewData: Omit<Review, 'id' | 'date' | 'photos'>) => {
    const newReview: Review = {
      id: Date.now(), // 임시로 현재 시간을 고유 ID로 사용
      date: new Date().toISOString().split('T')[0], // 오늘 날짜를 YYYY-MM-DD 형식으로
      photos: [],
      ...newReviewData,
    };

    // '작성한 리뷰' 목록의 맨 앞에 새로운 리뷰를 추가합니다.
    setWrittenReviews(prevReviews => [newReview, ...prevReviews]);

    // 리뷰 작성 후 '작성한 리뷰' 탭으로 자동 이동합니다.
    setActiveTab('written');
  };

  return (
    <S.ReviewContainer>
      <S.PageTitle>리뷰</S.PageTitle>

      {/* 탭 메뉴를 구성하는 부분입니다. */}
      <S.Tabs>
        {/*
          - 각 탭 버튼을 클릭하면 `setActiveTab` 함수가 호출되어 `activeTab` 상태가 변경됩니다.
          - `activeTab` 상태값에 따라 `className`이 동적으로 변경되어, 현재 활성화된 탭에 'active' 스타일이 적용됩니다.
        */}
        <S.Tab
          className={activeTab === 'write' ? 'active' : ''}
          onClick={() => setActiveTab('write')}
        >
          리뷰 작성
        </S.Tab>
        <S.Tab
          className={activeTab === 'received' ? 'active' : ''}
          onClick={() => setActiveTab('received')}
        >
          받은 리뷰
        </S.Tab>
        <S.Tab
          className={activeTab === 'written' ? 'active' : ''}
          onClick={() => setActiveTab('written')}
        >
          작성한 리뷰
        </S.Tab>
      </S.Tabs>

      {/* 
        - `activeTab` 상태에 따라 해당하는 탭의 컴포넌트를 보여줍니다.
        - 예를 들어 `activeTab`이 'write'이면, <WriteReview /> 컴포넌트가 렌더링됩니다.
      */}
      <S.TabContent>
        {/* 자식들에게 상태와 함수를 props로 내려줍니다. */}
        {activeTab === 'write' && <WriteReview onRegister={handleRegisterReview} />}
        {activeTab === 'received' && <ReceivedReviews reviews={receivedReviews} />}
        {activeTab === 'written' && <WrittenReviews reviews={writtenReviews} />}
      </S.TabContent>
    </S.ReviewContainer>
  );
};

export default ReviewPage; 