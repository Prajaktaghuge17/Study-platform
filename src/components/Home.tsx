import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import notesImage from './notes.jpg';
import flashcardsImage from './flashcard.jpg';
import quizzesImage from './quiz.png';
import studyGroupsImage from './studygroup.jpg';
import discussionBoardImage from './discussion.jpg';
import progressTrackingImage from './progress.png';
import NavBar from './Navbar';
import firebase from 'firebase/compat/app';
import './Home.css';
interface UserDetails {
  name: string;
  age: number;
  role: string;
}

const Home: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [needsDetails, setNeedsDetails] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('User logged in:', currentUser);
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log('User document does not exist. Prompting for details.');
          setNeedsDetails(true);
        } else {
          const userData = userDoc.data() as UserDetails;
          setUserDetails(userData);
          setNeedsDetails(false);
        }
      } else {
        console.log('No user logged in. Redirecting to login.');
        setUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, age, role } = e.currentTarget.elements as typeof e.currentTarget.elements & {
      name: HTMLInputElement;
      age: HTMLInputElement;
      role: RadioNodeList;
    };

    try {
      if (!user) throw new Error("User is not logged in");
      
      const userData: UserDetails = {
        name: name.value,
        age: parseInt(age.value),
        role: role.value
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User details saved successfully.');
      setUserDetails(userData);
      setNeedsDetails(false);
      
      if (role.value === 'student') {
        navigate('/student');
      } else if (role.value === 'teacher') {
        navigate('/teacher');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
    }
  };

  return (
    <div>
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      {needsDetails ? (
        <form onSubmit={handleDetailsSubmit} className="container mt-5">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name:</label>
            <input type="text" id="name" name="name" className="form-control" required />
          </div>
          <div className="mb-3">
            <label htmlFor="age" className="form-label">Age:</label>
            <input type="number" id="age" name="age" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Role:</label>
            <div>
              <div className="form-check">
                <input type="radio" id="student" name="role" value="student" className="form-check-input" required />
                <label htmlFor="student" className="form-check-label">Student</label>
              </div>
              <div className="form-check">
                <input type="radio" id="teacher" name="role" value="teacher" className="form-check-input" required />
                <label htmlFor="teacher" className="form-check-label">Teacher</label>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      ) : (
        
        <div className="container mt-5">
          <div className="text-center mb-5">
            <h1>Welcome to the Collaborative Study Platform</h1>
            <p>Your one-stop destination for creating and sharing study notes, flashcards, quizzes, and more.</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-md-4 p-5">
              <div className="card">
                <img src={notesImage} alt="Study Notes" className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title">Study Notes</h5>
                  <p className="card-text">Create and share your study notes with others.</p>
                  <Link to="/study-materials" className="btn btn-primary">Go to Study Notes</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-5 ">
              <div className="card">
                <img src={flashcardsImage} alt="Flashcards" className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title">Flashcards</h5>
                  <p className="card-text">Create flashcards to help you memorize key concepts.</p>
                  <Link to="/study-materials" className="btn btn-primary">Go to Flashcards</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-5 " >
              <div className="card">
                <img src={quizzesImage} alt="Quizzes" className="card-img-top" /><br/>
                <div className="card-body">
                  <h5 className="card-title">Quizzes</h5>
                  <p className="card-text">Test your knowledge with quizzes created by other users.</p>
                  <Link to="/study-materials" className="btn btn-primary">Go to Quizzes</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-5">
              <div className="card">
                <img src={studyGroupsImage} alt="Study Groups" className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title">Study Groups</h5>
                  <p className="card-text">Join study groups and collaborate with peers.</p>
                  <Link to="/study-groups" className="btn btn-primary">Go to Study Groups</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-5">
              <div className="card">
                <img src={discussionBoardImage} alt="Discussion Board" className="card-img-top" /><br/>
                <div className="card-body">
                  <h5 className="card-title">Discussion Board</h5>
                  <p className="card-text">Engage in discussions and get help from others.</p>
                  <Link to="/discussion-board" className="btn btn-primary">Go to Discussion Board</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-5">
              <div className="card">
                <img src={progressTrackingImage} alt="Progress Tracking" className="card-img-top" /><br/>
                <div className="card-body">
                  <h5 className="card-title">Progress Tracking</h5>
                  <p className="card-text">Track your progress and stay motivated.</p>
                  <Link to="/progress-tracking" className="btn btn-primary">Go to Progress Tracking</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
