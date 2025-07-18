import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
// 아이콘 사용을 원할 경우: import { RiArrowLeftLine, RiShareForwardLine, ... } from 'react-icons/ri';

// 상세 페이지에서 사용할 피드 아이템의 확장된 타입
interface FeedDetailData {
  id: number;
  author: string;
  travelStyle: string[];
  title: string;
  travelDate: string;
  location: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  commentsCount: number;
  shares: number;
  comments: { id: number; author: string; text: string; time: string }[];
}

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const FeedPage = () => {
  const { id } = useParams<{ id: string }>();
  const [feedItem, setFeedItem] = useState<FeedDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const numericId = id ? parseInt(id, 10) : NaN;
      if (!isNaN(numericId)) {
        // 더미 데이터 생성 (확장된 타입에 맞게)
        const dummyItem: FeedDetailData = {
          id: numericId,
          author: `김여행`,
          travelStyle: ['자유여행가', '사진작가'],
          title: '제주도에서의 잊지 못할 3일간의 힐링 여행',
          travelDate: '2023.06.15 - 2023.06.18',
          location: '제주특별자치도 서귀포시',
          content: '제주도에서의 3일간의 여행은 정말 잊을 수 없는 경험이었습니다...',
          images: [`https://picsum.photos/800/500?random=${numericId}`],
          tags: ['#제주도', '#힐링여행', '#성산일출봉', '#우도'],
          likes: 128,
          commentsCount: 24,
          shares: 15,
          comments: [
            { id: 1, author: '이제주', text: '저도 지난달에 제주도 다녀왔는데...', time: '2시간 전' },
            { id: 2, author: '박여행', text: '흑돼지 바비큐 어디서 드셨나요?', time: '1시간 전' },
          ],
        };
        setFeedItem(dummyItem);
      } else {
        setFeedItem(null);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) return <Loading>로딩 중...</Loading>;
  if (!feedItem) return <NotFoundContainer>피드를 찾을 수 없습니다.</NotFoundContainer>;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants}>
      <Container>
        <Header>
          <IconWrapper as={Link} to="/">
            {/* <RiArrowLeftLine /> */}
            ←
          </IconWrapper>
          <HeaderTitle>트래블메이트</HeaderTitle>
          <IconWrapper>
            {/* <RiShareForwardLine /> */}
            🔗
          </IconWrapper>
        </Header>

        <Content>
          <AuthorInfo>
            <ProfileImage />
            <AuthorDetails>
              <AuthorName>{feedItem.author}</AuthorName>
              <div>
                {feedItem.travelStyle.map(style => (
                  <TravelStyle key={style}>{style}</TravelStyle>
                ))}
              </div>
            </AuthorDetails>
            <FollowButton>팔로우</FollowButton>
          </AuthorInfo>

          <PostTitle>{feedItem.title}</PostTitle>

          <TravelInfo>
            <InfoItem>
              {/* <RiCalendarLine /> */}
              📅
              <span>{feedItem.travelDate}</span>
            </InfoItem>
            <InfoItem>
              {/* <RiMapPinLine /> */}
              📍
              <span>{feedItem.location}</span>
            </InfoItem>
          </TravelInfo>

          <ImageSlider>
             <img src={feedItem.images[0]} alt={feedItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </ImageSlider>

          <PostContent dangerouslySetInnerHTML={{ __html: feedItem.content.replace(/\n/g, '<br />') }} />

          <Tags>
            {feedItem.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>

          <InteractionButtons>
            <InteractionBtn className="liked">
              {/* <RiHeartFill /> */}
              ❤️
              <span>{feedItem.likes}</span>
            </InteractionBtn>
            <InteractionBtn>
              {/* <RiChat3Line /> */}
              💬
              <span>{feedItem.commentsCount}</span>
            </InteractionBtn>
            <InteractionBtn>
              {/* <RiShareForwardLine /> */}
              🔗
              <span>{feedItem.shares}</span>
            </InteractionBtn>
          </InteractionButtons>

          <CommentsSection>
            <CommentsTitle>댓글 {feedItem.commentsCount}개</CommentsTitle>
            {feedItem.comments.map(comment => (
              <Comment key={comment.id}>
                <CommentProfile />
                <CommentContent>
                  <CommentAuthor>{comment.author}</CommentAuthor>
                  <CommentText>{comment.text}</CommentText>
                  <CommentTime>{comment.time}</CommentTime>
                </CommentContent>
              </Comment>
            ))}
            <CommentInput>
              <input type="text" placeholder="댓글을 입력하세요..." />
              <button>게시</button>
            </CommentInput>
          </CommentsSection>
        </Content>
      </Container>
    </motion.div>
  );
};

export default FeedPage;

// Styled Components
const Container = styled.div`
  background-color: #ffffff;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background-color: #3366FF;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const IconWrapper = styled.div`
  font-size: 24px;
  cursor: pointer;
  color: white;
  text-decoration: none;
`;

const Content = styled.div`
  padding: 30px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const ProfileImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 15px;
`;

const AuthorDetails = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const TravelStyle = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background-color: #f0f5ff;
  color: #3366FF;
  border-radius: 15px;
  font-size: 14px;
  margin-right: 8px;
`;

const FollowButton = styled.button`
  padding: 8px 20px;
  background-color: #3366FF;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
`;

const PostTitle = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.3;
`;

const TravelInfo = styled.div`
  display: flex;
  margin-bottom: 25px;
  color: #666;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
  span { margin-left: 8px; }
`;

const ImageSlider = styled.div`
  position: relative;
  margin-bottom: 30px;
  border-radius: 15px;
  overflow: hidden;
  height: 500px;
  background-color: #f0f0f0;
`;

const PostContent = styled.div`
  margin-bottom: 30px;
  line-height: 1.7;
  font-size: 16px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30px;
  gap: 10px;
`;

const Tag = styled.span`
  padding: 8px 15px;
  background-color: #e6f0ff;
  color: #3366FF;
  border-radius: 20px;
  font-size: 14px;
`;

const InteractionButtons = styled.div`
  display: flex;
  border-top: 1px solid #eeeeee;
  border-bottom: 1px solid #eeeeee;
  padding: 15px 0;
  margin-bottom: 30px;
`;

const InteractionBtn = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
  color: #666666;
  cursor: pointer;
  font-size: 16px;

  span { margin-left: 8px; }
  &.liked { color: #ff3366; }
`;

const CommentsSection = styled.div`
  margin-bottom: 50px;
`;

const CommentsTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Comment = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const CommentProfile = styled(ProfileImage)`
  width: 40px;
  height: 40px;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const CommentText = styled.div`
  line-height: 1.4;
  margin-bottom: 5px;
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #999;
`;

const CommentInput = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 30px;
  padding: 5px 5px 5px 20px;
  margin-top: 20px;

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 16px;
  }

  button {
    background-color: #3366FF;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 18px;
`;

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #8e8e8e;
`; 
