import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';
import { useAuth } from './components/AuthProvider';
// import NavBar from './components/Navbar';
// import StudyMaterials from './components/StudyMaterials';
// import StudyGroups from './components/StudyGroups';
// import DiscussionBoard from './components/DiscussionBoard';
// import ProgressTracking from './components/ProgressTracking';
// import Footer from './components/Footer';
import Student from './components/Student';
// import Teacher from './components/Teacher';

const App: React.FC = () => {
  const { currentUser, userDetails } = useAuth();

  return (
    <div>
      {/* {currentUser && <NavBar user={currentUser} userDetails={userDetails} showUserDetails={false} />} */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
         <Route path="/" element={<Home />} />
        {/*<Route path="/study-materials" element={<StudyMaterials user={currentUser} userDetails={userDetails} />} />
        <Route path="/study-groups" element={<StudyGroups user={currentUser} userDetails={userDetails} />} />
        <Route path="/discussion-board" element={<DiscussionBoard user={currentUser} userDetails={userDetails} />} />
        <Route path="/progress-tracking" element={<ProgressTracking user={currentUser} userDetails={userDetails} />} />
        
        <Route path="/teacher" element={currentUser ? <Teacher user={currentUser} userDetails={userDetails} /> : <Navigate to="/login" />} /> */}
       <Route path="/student" element={<Student user={currentUser} userDetails={userDetails} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* {currentUser && <Footer />} */}
    </div>
  );
};

export default App;
