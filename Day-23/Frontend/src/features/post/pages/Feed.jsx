import React, { useEffect } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import { usePost }  from '../hooks/usePost'
import Nav from '../../shared/components/Nav'
const Feed = () => {
  const {handleGetFeed,feed,loading,handleUnLikePost,handleLikePost} = usePost();
  useEffect(()=>{
    handleGetFeed();
  },[])

  if(loading || !feed){
    return <h1>Loading...</h1>
  }
  return (
    <main className='feed-page'>
      <Nav />
        <div className="feed">
            <div className="posts">
                {feed.map((post,idx)=>{
                    return <Post key={idx} post={post} user={post.user} loading={loading} handleLikePost={handleLikePost} handleUnLikePost={handleUnLikePost} />
                })}
            </div>
        </div>
    </main>
  )
}

export default Feed
