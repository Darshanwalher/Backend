// import { useContext, useEffect } from "react"
// import {fetchPosts,createPost,likePost,unLikePost} from "../services/post.api"
// import { PostContext } from "../post.context"



// export const usePost = ()=>{
//      const context = useContext(PostContext)

//      const {loading,setLoading,post,setPost,feed,setFeed} = context;

//      const handleGetFeed = async()=>{
//         setLoading(true);
//         const data = await fetchPosts();
//         setFeed(data.posts);
//         setLoading(false);
//      }

//      const handleCreatePost = async(imageFile,caption)=>{
//         setLoading(true);
//         const data = await createPost(imageFile,caption);
//         setPost(data.posts);
//         setLoading(false);
//      }

//      const handleLikePost = async(postId)=>{
       
//         const data = await likePost(postId);
//         await handleGetFeed();
       
//      }

//      const handleUnLikePost = async(postId)=>{
        
//         const data = await unLikePost(postId);
//         await handleGetFeed();
        
//      }

//      useEffect(()=>{
//         handleGetFeed();
//      },[])  

     

//      return {loading,post,feed,handleGetFeed,handleCreatePost,handleLikePost,handleUnLikePost}
// }

import { useContext, useEffect } from "react"
import { fetchPosts, createPost, likePost, unLikePost } from "../services/post.api"
import { PostContext } from "../post.context"
import { useNavigate } from "react-router";

export const usePost = () => {

  const context = useContext(PostContext)
  const navigate = useNavigate();

  const { loading, setLoading, post, setPost, feed, setFeed } = context;

  const handleGetFeed = async () => {
    try {
      setLoading(true);

      const data = await fetchPosts();
      setFeed(data.posts);

    } catch (error) {

      console.error("Error fetching feed:", error);

      if (error.response?.status === 404) {
        navigate("/login");
      }

    } finally {
      setLoading(false);
    }
  }

  const handleCreatePost = async (imageFile, caption) => {
    try {
      setLoading(true);

      const data = await createPost(imageFile, caption);
      setPost(data.posts);

      await handleGetFeed();

    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLikePost = async (postId) => {
    try {
      await likePost(postId);
      await handleGetFeed();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  }

  const handleUnLikePost = async (postId) => {
    try {
      await unLikePost(postId);
      await handleGetFeed();
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  }

  useEffect(() => {
    handleGetFeed();
  }, [])

  return {
    loading,
    post,
    feed,
    handleGetFeed,
    handleCreatePost,
    handleLikePost,
    handleUnLikePost
  }
}