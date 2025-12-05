import React from 'react';
import { NavLink,useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar(){
 const {user,logout}=useAuth();
 const navigate=useNavigate();
 return(
 <header style={{padding:'15px 20px',background:'#222',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
   <div onClick={()=>navigate('/')} style={{cursor:'pointer',fontSize:'1.5rem',fontWeight:'bold'}}>JobPortal</div>
   <nav style={{display:'flex',gap:'12px',alignItems:'center'}}>
     
     {!user && <>
      
       <NavLink to="/login" className={({isActive})=>isActive?'nav-link active login-btn':'nav-link login-btn'}>Login</NavLink>
       <NavLink to="/register" className={({isActive})=>isActive?'nav-link active register-btn':'nav-link register-btn'}>Register</NavLink>
     </>}
     {user && user.userType == 'JOB_SEEKER' && <>
       <NavLink to="/jobSeeker/profile" className={({isActive})=>isActive?'nav-link active profile-btn':'nav-link profile-btn'}>Profile</NavLink>
       
     </>}

      {user && user.userType == 'EMPLOYER' && <>
       <NavLink to="/employer/profile" className={({isActive})=>isActive?'nav-link active profile-btn':'nav-link profile-btn'}>Profile</NavLink>
      
     </>}
     { user && <>
      <NavLink to="/jobs" className={({isActive})=>isActive?'nav-link active jobs-btn':'nav-link jobs-btn'}>Jobs</NavLink>
      <button onClick={()=>{logout();navigate('/');}} className="logout-btn">Logout</button>
     </>
     }
   </nav>
 </header>);
}