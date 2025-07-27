import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as S from './FeedDetailPage.style';

const FeedDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: 실제 id에 해당하는 데이터 불러오기
  const feedData = {
    // 1. 게시물 정보 (첫 번째 이미지)
    author: {
        name: '김여행',
        tags: ['자유여행가', '사진작가'],
        avatar: `https://i.pravatar.cc/150?u=traveler${id}`,
    },
    post: {
        title: '제주도에서의 잊지 못할 3일간의 힐링 여행',
        date: '2023.06.15 - 2023.05.18',
        location: '제주특별자치도 서귀포시',
        mainImage: `https://picsum.photos/800/500?random=${id}`,
        content: '제주도에서의 3일간의 여행은 정말 잊을 수 없는 경험이었습니다. 첫째 날에는 성산일출봉에서 아름다운 일출을 감상하고, 우도로 향했습니다. 우도에서 전기자전거를 빌려 해안도로를 달리니 정말 환상적이더군요.\n\n둘째 날에는 중문관광단지의 여러 해변을 돌아다니며 시간을 보냈습니다. 특히 중문색달해변에서의 수영은 정말 상쾌했어요. 저녁에는 제주 흑돼지 바비큐를 즐기며 하루를 마무리했습니다.\n\n마지막 날에는 한라산 등반에 도전했습니다. 비록 정상까지는 가지 못했지만, 중간 지점에서 바라본 제주의 전경은 정말 장관이었습니다. 다음에 제주를 방문한다면 꼭 정상까지 올라가보고 싶네요.',
        hashtags: ['#제주도', '#힐링여행', '#성산일출봉', '#우도', '#한라산', '#여름휴가'],
        likes: 128,
        commentsCount: 24,
        shares: 15,
        comments: [
            { id: 1, author: '이제주', text: '저도 지난달에 제주도 다녀왔는데, 정말 좋았어요! 성산일출봉 일출은 정말 장관이죠.', time: '2시간 전' },
            { id: 2, author: '박여행', text: '흑돼지 바비큐 어디서 드셨나요? 저도 다음에 제주도 가는데 맛집 추천 부탁드려요!', time: '1시간 전' },
            { id: 3, author: '최사진', text: '사진이 정말 예쁘게 잘 나왔네요! 카메라 어떤 거 쓰시는지 궁금합니다.', time: '1시간 전' },
        ],
    },
    // 2. 상세 일정 정보 (두 번째 이미지)
    plan: {
      title: '제주도 힐링 여행',
      period: '2023년 6월 15일 - 2023년 6월 19일',
      travelInfo: [
        { icon: '📅', label: '여행 기간', value: '5일 4박' },
        { icon: '📍', label: '여행지', value: '제주도' },
        { icon: '💰', label: '예산', value: '₩850,000' },
        { icon: '👥', label: '인원', value: '2명' },
      ],
      days: [
        {
          day: 1,
          date: '6월 15일 (목)',
          events: [
            { time: '10:00', title: '제주공항 도착', location: '제주국제공항', description: '김포공항에서 제주공항으로 이동 (약 1시간 소요) 도착 후 렌터카 픽업', category: '교통', image: true },
            { time: '12:30', title: '점심 식사', location: '제주 흑돼지 명가', description: '제주도 대표 음식인 흑돼지 구이를 맛볼 수 있는 맛집 사전 예약 완료', category: '식사', image: true },
            { time: '15:00', title: '성산일출봉 관광', location: '성산일출봉', description: '유네스코 세계자연유산으로 등재된 제주도의 상징적인 명소 정상까지 약 30분 소요, 날씨가 좋으면 우도와 바다 전망 감상 가능', category: '관광', image: true },
            { time: '18:30', title: '호텔 체크인 및 휴식', location: '제주 시그니처 호텔', description: '오션뷰 객실 예약 완료 호텔 내 수영장 및 스파 이용 가능', category: '숙박', image: false },
          ],
        },
        {
          day: 2,
          date: '6월 16일 (금)',
          events: [
              { time: '09:00', title: '우도 투어', location: '우도', description: '성산항에서 페리로 15분 소요 우도 내에서는 전기차 또는 자전거 대여 예정 우도 땅콩 아이스크림, 소라 등 현지 음식 체험', category: '관광', image: true },
              { time: '15:00', title: '카페 투어', location: '월정리 해변 카페거리', description: '인스타그램에서 유명한 해변 뷰 카페 방문 커피와 디저트 즐기기', category: '카페', cost: '₩30,000', image: false },
          ],
        },
      ],
    }
  };

  if (!feedData) {
    return <div>피드를 찾을 수 없습니다.</div>;
  }

  const { author, post, plan } = feedData;

  return (
    <S.PageContainer>
        {/* --- 1. 게시물 부분 --- */}
        <S.PostSection>
            <S.BlueHeader>
                트래블메이트
                <S.ShareIcon>
                    <i className="ri-share-forward-line"></i>
                </S.ShareIcon>
            </S.BlueHeader>
            <S.PostContentWrapper>
                <S.AuthorInfo>
                    <S.AuthorAvatar src={author.avatar} alt={author.name} />
                    <div>
                        <S.AuthorName>{author.name}</S.AuthorName>
                        <div>
                            {author.tags.map(tag => <S.AuthorTag key={tag}>{tag}</S.AuthorTag>)}
                        </div>
                    </div>
                    <S.FollowButton>팔로우</S.FollowButton>
                </S.AuthorInfo>

                <S.PostTitle>{post.title}</S.PostTitle>
                
                <S.PostMeta>
                    <span>{post.date}</span>
                    <span>・</span>
                    <span>{post.location}</span>
                </S.PostMeta>

                <S.PostImageSlider>
                    <i className="ri-image-line"></i> 여행 사진 슬라이더
                </S.PostImageSlider>

                <S.PostText dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
                
                <S.HashtagContainer>
                    {post.hashtags.map(tag => <S.Hashtag key={tag}>{tag}</S.Hashtag>)}
                </S.HashtagContainer>

                <S.InteractionStats>
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.commentsCount}</span>
                    <span>🔗 {post.shares}</span>
                </S.InteractionStats>
            </S.PostContentWrapper>
        </S.PostSection>

        <S.Divider />

        {/* --- 2. 상세 일정 부분 --- */}
        <S.PlanSection>
            <S.PlanHeader>상세 여행 일정</S.PlanHeader>
            <S.InfoCards>
                {plan.travelInfo.map(info => (
                <S.InfoCard key={info.label}>
                    <S.CardLabel>{info.label}</S.CardLabel>
                    <S.CardValue>{info.value}</S.CardValue>
                </S.InfoCard>
                ))}
            </S.InfoCards>

            <S.TimelineContainer>
                {plan.days.map(day => (
                <div key={day.day}>
                    <S.DayHeader>
                        <S.DayBadge>{day.day}</S.DayBadge>
                        <S.DayTitle>{day.day}일째 <S.DayDate>{day.date}</S.DayDate></S.DayTitle>
                    </S.DayHeader>
                    {day.events.map((event, index) => (
                    <S.EventRow key={index}>
                        <S.TimelineLine />
                        <S.TimelineDot />
                        <S.EventTime>{event.time}</S.EventTime>
                        <S.EventCard>
                            <S.EventHeader>
                                <S.EventTitle>{event.title}</S.EventTitle>
                                <S.CategoryBadge category={event.category}>{event.category}</S.CategoryBadge>
                            </S.EventHeader>
                            <S.EventLocation>{event.location}</S.EventLocation>
                            <S.EventDescription>{event.description}</S.EventDescription>
                            {event.image && <S.ImagePlaceholder>이미지 영역</S.ImagePlaceholder>}
                            {event.cost && <S.CostBadge>{event.cost}</S.CostBadge>}
                        </S.EventCard>
                    </S.EventRow>
                    ))}
                </div>
                ))}
            </S.TimelineContainer>
        </S.PlanSection>

        {/* --- 3. 댓글 부분 --- */}
        <S.CommentsSection>
            <S.CommentsTitle>댓글 {post.commentsCount}개</S.CommentsTitle>
            {post.comments.map(comment => (
                <S.Comment key={comment.id}>
                    <S.AuthorAvatar src={`https://i.pravatar.cc/150?u=${comment.author}`} alt={comment.author} isComment={true} />
                    <S.CommentContent>
                        <S.AuthorName isComment={true}>{comment.author}</S.AuthorName>
                        <S.CommentText>{comment.text}</S.CommentText>
                        <S.CommentTime>{comment.time}</S.CommentTime>
                    </S.CommentContent>
                </S.Comment>
            ))}
            <S.CommentInputWrapper>
                <S.CommentInput placeholder="댓글을 입력하세요..." />
                <S.CommentSubmitButton>게시</S.CommentSubmitButton>
            </S.CommentInputWrapper>
        </S.CommentsSection>
    </S.PageContainer>
  );
};

export default FeedDetailPage; 