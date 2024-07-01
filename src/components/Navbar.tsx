import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from './l1.png';
import Profile from './profile1.png';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { User } from 'firebase/auth';
import { UserDetails } from './types'; // Ensure you have a types file exporting UserDetails

interface NavBarProps {
  user: User | null; // Assuming 'firebase.User' based on usage
  userDetails: UserDetails | null;
  showUserDetails: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ user, userDetails, showUserDetails }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      alert("User logged out successfully");
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  }, [navigate]);

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  const handleTeacherClick = useCallback((e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (userDetails?.role === 'student') {
      e.preventDefault();
      alert('Students do not have access to the teacher portal.');
    }
  }, [userDetails]);

  const userDetailsContent = useMemo(() => {
    if (showDetails && showUserDetails && userDetails) {
      return (
        <div className="user-details-dropdown">
          <p>Email: {user.email}</p>
          <p>Name: {userDetails.name}</p>
          <p>Age: {userDetails.age}</p>
          <p>Role: {userDetails.role}</p>
          <button id="btn1" onClick={handleLogout}>Logout</button>
        </div>
      );
    }
    return null;
  }, [showDetails, showUserDetails, userDetails, user?.email, handleLogout]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img id='img1' src={Logo} alt="Logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/studynotes">Study Notes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/flashcards">Flashcards</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/quizzes">Quizzes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/teacher" onClick={handleTeacherClick}>Teacher</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/student">Student</Link>
            </li>
          </ul>
          {user && (
            <div className="user-info ms-auto">
              <img id='img2' src={Profile} alt="Profile" onClick={toggleDetails} />
              {userDetailsContent}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
