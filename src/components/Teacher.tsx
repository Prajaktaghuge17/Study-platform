import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './Dashboard.css';

interface UserDetails {
  name: string;
  role: string;
}

interface TeacherProps {
  user: firebase.User | null;
}

const Teacher: React.FC<TeacherProps> = ({ user }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.uid) {
        console.log('Fetching user details for user:', user.uid);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            console.log('User details found:', docSnap.data());
            setUserDetails(docSnap.data() as UserDetails);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  const userName = userDetails ? userDetails.name : 'Loading...';
  const userRole = userDetails ? userDetails.role : '';
  const userEmail = user ? user.email : 'Loading...';

  return (
    <div className="dashboard-container">
      <h1>Teacher Portal</h1>
      <div className="dashboard-section">
        {userDetails ? (
          <>
            <h3>Welcome, {userName}!</h3>
            <p>Role: {userRole}</p>
            <p>Email: {userEmail}</p>
          </>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>
      {/* Other dashboard sections */}
    </div>
  );
};

export default Teacher;
