import styled from 'styled-components';
import { Link } from 'react-router-dom';

// 피드 아이템 데이터의 타입을 정의합니다.
interface FeedItemProps {
  item: {
    id: number;
    author: string;
    content: string;
    imageUrl: string;
  };
}

const FeedItem = ({ item }: FeedItemProps) => {
  return (
    <CardWrapper to={`/feed/${item.id}`}>
      <Card>
        <CardHeader>
          <AuthorAvatar />
          <AuthorName>{item.author}</AuthorName>
        </CardHeader>
        <CardImage src={item.imageUrl} alt={`Feed from ${item.author}`} />
        <CardContent>
          <p>{item.content}</p>
        </CardContent>
        <CardActions>
          <ActionButton>❤️ 좋아요</ActionButton>
          <ActionButton>💬 댓글 달기</ActionButton>
          <ActionButton>🔗 공유하기</ActionButton>
        </CardActions>
      </Card>
    </CardWrapper>
  );
};

export default FeedItem;

const CardWrapper = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const Card = styled.article`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  margin-bottom: 24px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
`;

const AuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 12px;
`;

const AuthorName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-top: 1px solid #dbdbdb;
  border-bottom: 1px solid #dbdbdb;
`;

const CardContent = styled.div`
  padding: 12px 16px;
  font-size: 14px;
`;

const CardActions = styled.div`
  display: flex;
  padding: 8px 16px;
  border-top: 1px solid #efefef;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #8e8e8e;
  margin-right: 16px;
  padding: 0;
  
  &:hover {
    color: #262626;
  }
`; 