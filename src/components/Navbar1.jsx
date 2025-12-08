// // src/components/Navbar.jsx
// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";

// function Navbar({ user, onLogout }) {
//   const navigate = useNavigate();

//   const activeClass = ({ isActive }) =>
//     `nav-link ${isActive ? "active" : ""}`;

//   const handleLogout = () => {
//     if (onLogout) onLogout();
//     navigate("/"); // redirect to home
//   };

//   return (
//     <header className="navbar">
//       {/* Left: Logo */}
//       <div
//         className="navbar-left"
//         onClick={() => navigate("/")}
//         style={{ cursor: "pointer" }}
//       >
//         <span className="logo-highlight">Job</span>Portal
//       </div>

//       {/* Center Navigation */}
//       <nav className="navbar-center">
//         <NavLink to="/jobs" className={activeClass}>
//           Jobs
//         </NavLink>
//       </nav>

//       {/* Right Navigation */}
//       <div className="navbar-right">
//         {!user && (
//           <>
//             <NavLink
//               to="/login"
//               className={({ isActive }) =>
//                 `btn btn-outline ${isActive ? "active" : ""}`
//               }
//             >
//               Login
//             </NavLink>

//             <NavLink to="/register" className="btn btn-primary">
//               Register
//             </NavLink>
//           </>
//         )}

//         {user && (
//           <>
//             <NavLink
//               to="/profile"
//               className={({ isActive }) =>
//                 `btn btn-outline ${isActive ? "active" : ""}`
//               }
//               style={{ marginRight: 8 }}
//             >
//               Profile
//             </NavLink>

//             <button className="btn btn-danger" onClick={handleLogout}>
//               Logout
//             </button>
//           </>
//         )}
//       </div>
//     </header>
//   );
// } 

// export default Navbar;