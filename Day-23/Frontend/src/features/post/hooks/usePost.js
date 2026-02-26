import { useContext, useEffect } from "react"
import {fetchPosts,createPost,likePost,unLikePost} from "../services/post.api"
import { PostContext } from "../post.context"



export const usePost = ()=>{
     const context = useContext(PostContext)

     const {loading,setLoading,post,setPost,feed,setFeed} = context;

     const handleGetFeed = async()=>{
        setLoading(true);
        const data = await fetchPosts();
        setFeed(data.posts);
        setLoading(false);
     }

     const handleCreatePost = async(imageFile,caption)=>{
        setLoading(true);
        const data = await createPost(imageFile,caption);
        setPost(data.posts);
        setLoading(false);
     }

     const handleLikePost = async(postId)=>{
       
        const data = await likePost(postId);
        await handleGetFeed();
       
     }

     const handleUnLikePost = async(postId)=>{
        
        const data = await unLikePost(postId);
        await handleGetFeed();
        
     }

     useEffect(()=>{
        handleGetFeed();
     },[])  

     

     return {loading,post,feed,handleGetFeed,handleCreatePost,handleLikePost,handleUnLikePost}
}

