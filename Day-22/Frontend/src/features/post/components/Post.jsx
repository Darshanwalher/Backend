import React from 'react';

const Post = ({ user, post }) => {
  return (
    <article className="post-card">
      {/* Header */}
      <header className="post-header">
        <div className="user-info">
          <div className="avatar-ring">
            <img src={user.profileImage} alt={`${user.username}'s avatar`} className="avatar-img" />
          </div>
          <span className="username">{user.username}</span>
        </div>
        <button className="more-options-btn">•••</button>
      </header>

      {/* Content */}
      <div className="post-image-container">
        <img src={post.imgUrl} alt="Post content" className="post-main-img" />
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="action-left">
          <button className={`action-btn ${post.isLiked ? "active-like" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button className="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
          <button className="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className="action-right">
          <button className="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="post-details">
        <p className="caption">
          <span className="caption-username">{user.username}</span> {post.caption}
        </p>
      </div>
    </article>
  );
};

export default Post;