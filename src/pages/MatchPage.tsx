import React from 'react';
import './MatchPage.css';

const MatchPage: React.FC = () => {
  return (
    <div className="match-container">
      <header className="match-header">
        <div className="logo">TravelMate</div>
        <nav className="nav-menu">
          <a href="#" className="nav-item">
            홈
          </a>
          <a href="#" className="nav-item">
            피드
          </a>
          <a href="#" className="nav-item active">
            매칭
          </a>
          <a href="#" className="nav-item">
            채팅
          </a>
          <a href="#" className="nav-item">
            마이페이지
          </a>
        </nav>
        <div className="user-icon">
          <i className="ri-user-line"></i>
        </div>
      </header>
      <main className="main-content">
        <aside className="filter-sidebar">
          <h2 className="filter-title">여행지 필터</h2>
          <div className="filter-group">
            <label htmlFor="destination" className="filter-label">
              여행지
            </label>
            <select id="destination" className="filter-select">
              <option>전체</option>
              <option>서울</option>
              <option>부산</option>
              <option>제주</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="schedule" className="filter-label">
              일정
            </label>
            <select id="schedule" className="filter-select">
              <option>전체</option>
              <option>당일치기</option>
              <option>1박 2일</option>
              <option>2박 3일 이상</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="style" className="filter-label">
              여행 스타일
            </label>
            <select id="style" className="filter-select">
              <option>전체</option>
              <option>맛집 탐방</option>
              <option>휴양</option>
              <option>액티비티</option>
            </select>
          </div>
          <button className="filter-button">필터 적용</button>
        </aside>
        <section className="matching-results">
          <div className="results-header">
            <h2 className="results-title">
              추천 여행 메이트 <span className="results-count">3</span>
            </h2>
            <select className="sort-dropdown">
              <option>추천순</option>
              <option>최신순</option>
            </select>
          </div>
          <div className="slider-container">
            <div className="slider-wrapper">
              <div className="slider">
                {/* 슬라이드 아이템들이 여기에 동적으로 추가됩니다 */}
                <div className="slide">
                  <div className="user-card">
                    <img
                      src="https://via.placeholder.com/800x600"
                      alt="User"
                      className="user-card-img"
                    />
                    <div className="user-card-info">
                      <h3>김메이트, 28</h3>
                      <p>맛집 탐방을 사랑하는 여행가</p>
                      <div className="user-card-tags">
                        <span>#서울</span>
                        <span>#맛집탐방</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 추가 슬라이드 */}
              </div>
            </div>
            <div className="slider-nav">
              <button className="slider-button prev">
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <button className="slider-button next">
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MatchPage;
