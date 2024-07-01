import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from './l1.png';
import Profile from './profile1.png';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { User } from 'firebase/auth';

interface UserDetails {
  name: string;
  age: number;
  role: string;
}

interface NavBarProps {
  user: User | null; // Assuming 'firebase.User' based on usage
  userDetails: UserDetails | null;
  showUserDetails: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ user, userDetails, showUserDetails }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("User logged out successfully");
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <nav className="navbar">
      <img id='img1' src={Logo} alt="Logo" />
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/study-materials">Study Materials</Link></li>
        <li><Link to="/study-groups">Study Groups</Link></li>
        <li><Link to="/discussion-board">Discussion Board</Link></li>
        <li><Link to="/progress-tracking">Progress Tracking</Link></li>
      </ul>
      {user && (
        <div className="user-info">
          <img id='img2' src={Profile} alt="Profile" onClick={toggleDetails} />
          {showDetails && showUserDetails && userDetails && (
            <div className="user-details-dropdown">
              <p>Email: {user.email}</p>
              <p>Name: {userDetails.name}</p>
              <p>Age: {userDetails.age}</p>
              <p>Role: {userDetails.role}</p>
              <button id="btn1" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
