// import React, { useEffect } from 'react'
// import "../style/feed.scss"
// import Post from '../components/Post'
// import { usePost }  from '../hooks/usePost'
// import Nav from '../../shared/components/Nav'
// const Feed = () => {
//   const {handleGetFeed,feed,loading,handleUnLikePost,handleLikePost} = usePost();
//   useEffect(()=>{
//     handleGetFeed();
//   },[])

//   if(loading || !feed){
//     return <h1>Loading...</h1>
//   }
//   return (
//     <main className='feed-page'>
//       <Nav />
//         <div className="feed">
//             <div className="posts">
//                 {feed.map((post,idx)=>{
//                     return <Post key={idx} post={post} user={post.user} loading={loading} handleLikePost={handleLikePost} handleUnLikePost={handleUnLikePost} />
//                 })}
//             </div>
//         </div>
//     </main>
//   )
// }

// export default Feed

import React, { useEffect } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import { usePost } from '../hooks/usePost'
import Nav from '../../shared/components/Nav'

const Loader = () => (
  <div className="loader-screen">
    <div className="loader">
      <div className="ring ring--outer" />
      <div className="ring ring--mid" />
      <div className="ring ring--inner" />
      <div className="core" />
      <div className="particle particle--1" />
      <div className="particle particle--2" />
    </div>
    <span className="loader-label">Loading</span>
  </div>
)

const Feed = () => {
  const { handleGetFeed, feed, loading, handleUnLikePost, handleLikePost } = usePost()

  useEffect(() => {
    handleGetFeed()
  }, [])

  if (loading || !feed) return <Loader />

  return (
    <main className='feed-page'>
      <Nav />
      <div className="feed">
        <div className="posts">
          {feed.map((post, idx) => (
            <Post
              key={idx}
              post={post}
              user={post.user}
              loading={loading}
              handleLikePost={handleLikePost}
              handleUnLikePost={handleUnLikePost}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Feed