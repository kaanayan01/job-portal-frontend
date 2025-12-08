import React, { use } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { useReduxUser } from '../hooks/useReduxUser';
import './Navbar.css';

export default function Navbar(){
 const {user,logout}=useAuth();
 const navigate=useNavigate();
 const reduxUser = useReduxUser();
 const jobSeeker = useSelector(state => state.jobSeeker?.jobSeeker);
 const employer = useSelector(state => state.employer?.employer);
 

 // Check if user has premium subscription from jobseeker or employer
 const isPremium = jobSeeker?.subscriptionType === 'PREMIUM' || employer?.subscriptionType === 'PREMIUM';
 const isLoggedIn = !!user || !!reduxUser?.userId;

 return(
 <header style={{padding:'15px 20px',background:'#222',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>
   <div onClick={()=>navigate('/')} style={{cursor:'pointer',fontSize:'1.5rem',fontWeight:'bold'}}>JobPortal</div>
   <nav style={{display:'flex',gap:'12px',alignItems:'center'}}>
     
     {!isLoggedIn && <>
      
       <NavLink to="/login" className={({isActive})=>isActive?'nav-link active login-btn':'nav-link login-btn'}>Login</NavLink>
       <NavLink to="/register" className={({isActive})=>isActive?'nav-link active register-btn':'nav-link register-btn'}>Register</NavLink>
     </>}
     {isLoggedIn && reduxUser?.userType == 'JOB_SEEKER' && <>
       <NavLink to="/jobseeker/profile" className={({isActive})=>isActive?'nav-link active profile-btn':'nav-link profile-btn'}>Profile</NavLink>
       <NavLink to="/jobs" className={({isActive})=>isActive?'nav-link active jobs-btn':'nav-link jobs-btn'}>Jobs</NavLink>
     </>}

      {isLoggedIn && reduxUser?.userType == 'EMPLOYER' && <>
       <NavLink to="/employer/profile" className={({isActive})=>isActive?'nav-link active profile-btn':'nav-link profile-btn'}>Profile</NavLink>
       <NavLink to="/employer/jobs" className={({isActive})=>isActive?'nav-link active jobs-btn':'nav-link jobs-btn'}>Jobs</NavLink>
     </>}
     {isLoggedIn && <>
      
      {/* Premium Badge or Upgrade Button */}
      {isPremium ? (
        <span style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: '#fff'
        }}>
          ✨ Premium
        </span>
      ) : (
        <button 
          onClick={() => navigate('/upgrade')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Upgrade
        </button>
      )}
      
      <button onClick={()=>{logout();navigate('/');}} className="logout-btn">Logout</button>
     </>
     }
   </nav>
 </header>);
}