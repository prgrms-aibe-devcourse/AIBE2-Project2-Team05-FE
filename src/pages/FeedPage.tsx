import React from 'react';
import styled from 'styled-components';

const FeedPage = () => {
  return (
    <Container>
      <Header>
        <HeaderIcon className="ri-arrow-left-line"></HeaderIcon>
        <HeaderTitle>트래블메이트</HeaderTitle>
        <HeaderIcon className="ri-share-forward-line"></HeaderIcon>
      </Header>

      <Content>
        <AuthorInfo>
          <ProfileImage>
            <i className="ri-user-line"></i>
          </ProfileImage>
          <AuthorDetails>
            <AuthorName>김여행</AuthorName>
            <TravelStyle>자유여행가</TravelStyle>
            <TravelStyle>사진작가</TravelStyle>
          </AuthorDetails>
          <FollowButton>팔로우</FollowButton>
        </AuthorInfo>

        <PostTitle>제주도에서의 잊지 못할 3일간의 힐링 여행</PostTitle>

        <TravelInfo>
          <TravelDate>
            <i className="ri-calendar-line"></i>
            <span>2023.06.15 - 2023.06.18</span>
          </TravelDate>
          <TravelLocation>
            <i className="ri-map-pin-line"></i>
            <span>제주특별자치도 서귀포시</span>
          </TravelLocation>
        </TravelInfo>

        <ImageSlider>
          <SliderPlaceholder>
            <i
              className="ri-image-line"
              style={{ fontSize: '48px', marginBottom: '10px' }}
            ></i>
            <p>여행 사진 슬라이더</p>
          </SliderPlaceholder>
          <SliderIndicators>
            <Indicator className="active"></Indicator>
            <Indicator></Indicator>
            <Indicator></Indicator>
            <Indicator></Indicator>
          </SliderIndicators>
        </ImageSlider>

        <PostContent>
          <p>
            제주도에서의 3일간의 여행은 정말 잊을 수 없는 경험이었습니다. 첫째
            날에는 성산일출봉에서 아름다운 일출을 감상하고, 우도로 향했습니다.
            우도의 하얀 모래해변과 에메랄드빛 바다는 정말 환상적이었어요.
          </p>
          <br />
          <p>
            둘째 날에는 중문 관광단지의 여러 해변을 돌아다니며 시간을
            보냈습니다. 특히 중문색달해변에서의 수영은 정말 상쾌했어요. 저녁에는
            제주 흑돼지 바비큐를 즐기며 하루를 마무리했습니다.
          </p>
          <br />
          <p>
            마지막 날에는 한라산 등반에 도전했습니다. 비록 정상까지는 가지
            못했지만, 중간 지점에서 바라본 제주의 전경은 정말 장관이었습니다.
            다음에 제주도를 방문한다면 꼭 정상까지 올라가보고 싶네요.
          </p>
          <br />
          <p>
            제주도의 자연, 음식, 그리고 사람들의 따뜻함이 모두 기억에 남습니다.
            여러분도 기회가 된다면 꼭 방문해보세요!
          </p>
        </PostContent>

        <Tags>
          <Tag>#제주도</Tag>
          <Tag>#힐링여행</Tag>
          <Tag>#성산일출봉</Tag>
          <Tag>#우도</Tag>
          <Tag>#한라산</Tag>
          <Tag>#여름휴가</Tag>
        </Tags>

        <InteractionButtons>
          <InteractionBtn className="liked">
            <i className="ri-heart-fill"></i>
            <span>128</span>
          </InteractionBtn>
          <InteractionBtn>
            <i className="ri-chat-3-line"></i>
            <span>24</span>
          </InteractionBtn>
          <InteractionBtn>
            <i className="ri-share-forward-line"></i>
            <span>15</span>
          </InteractionBtn>
        </InteractionButtons>

        <CommentsSection>
          <CommentsTitle>댓글 24개</CommentsTitle>

          <Comment>
            <CommentProfile>
              <i className="ri-user-line"></i>
            </CommentProfile>
            <CommentContent>
              <CommentAuthor>이제주</CommentAuthor>
              <CommentText>
                저도 지난달에 제주도 다녀왔는데, 정말 좋았어요! 성산일출봉
                일출은 정말 장관이죠.
              </CommentText>
              <CommentTime>2시간 전</CommentTime>
            </CommentContent>
          </Comment>

          <Comment>{/* ... other comments ... */}</Comment>

          <CommentInput>
            <input type="text" placeholder="댓글을 입력하세요..." />
            <button>게시</button>
          </CommentInput>
        </CommentsSection>
      </Content>
    </Container>
  );
};

export default FeedPage;

const Container = styled.div`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  background-color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background-color: #3366ff;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  letter-spacing: -0.5px;
`;

const HeaderIcon = styled.i`
  font-size: 24px;
  cursor: pointer;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  overflow: hidden;
  i {
    font-size: 30px;
    color: #999;
  }
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
  color: #3366ff;
  border-radius: 15px;
  font-size: 14px;
  margin-right: 8px;
`;

const FollowButton = styled.button`
  padding: 8px 20px;
  background-color: #3366ff;
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
`;

const TravelDate = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
  color: #666666;
  i {
    margin-right: 8px;
    color: #3366ff;
  }
`;

const TravelLocation = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
  color: #666666;
  i {
    margin-right: 8px;
    color: #3366ff;
  }
`;

const ImageSlider = styled.div`
  position: relative;
  margin-bottom: 30px;
  border-radius: 15px;
  overflow: hidden;
  height: 500px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SliderPlaceholder = styled.div`
  color: #999;
  font-size: 18px;
  text-align: center;
`;

const SliderIndicators = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const Indicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  &.active {
    background-color: #3366ff;
  }
`;

const PostContent = styled.div`
  margin-bottom: 30px;
  line-height: 1.6;
  font-size: 16px;
  color: #333333;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30px;
  gap: 10px;
`;

const Tag = styled.div`
  padding: 8px 15px;
  background-color: #e6f0ff;
  color: #3366ff;
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
  i {
    margin-right: 8px;
    font-size: 22px;
  }
  &.liked {
    color: #ff3366;
  }
`;

const CommentsSection = styled.div`
  margin-bottom: 100px;
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

const CommentProfile = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    font-size: 20px;
    color: #999;
  }
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const CommentText = styled.div`
  margin-bottom: 5px;
  line-height: 1.4;
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #999999;
`;

const CommentInput = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 30px;
  padding: 10px 20px;
  margin-top: 30px;
  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px 0;
    outline: none;
    font-size: 16px;
  }
  button {
    background-color: #3366ff;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    cursor: pointer;
    font-size: 16px;
  }
`;
