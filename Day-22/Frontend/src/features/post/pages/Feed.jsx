import React, { useEffect } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import { usePost }  from '../hooks/usePost'
const Feed = () => {
  const {handleGetFeed,feed,loading} = usePost();
  useEffect(()=>{
    handleGetFeed();
  },[])

  if(loading || !feed){
    return <h1>Loading....</h1>
  }
  return (
    <main className='feed-page'>
        <div className="feed">
            <div className="posts">
                {feed.map((post,idx)=>{
                    return <Post key={idx} post={post} user={post.user}/>
                })}
            </div>
        </div>
    </main>
  )
}

export default Feed
