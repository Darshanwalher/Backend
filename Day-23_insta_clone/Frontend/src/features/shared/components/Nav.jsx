import React from 'react'
import "../nav.scss"
import { useNavigate } from 'react-router'

const Nav = () => {
    const navigate = useNavigate()
  return (
    <nav className='nav-bar'>
      <p>Social Space</p>
      <button
      onClick={()=>{navigate("/create-post")}}
      className='btn primary-btn'>New Post</button>
    </nav>
  )
}

export default Nav