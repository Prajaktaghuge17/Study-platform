import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useQuery } from '@tanstack/react-query';
import NavBar from './Navbar';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';

interface UserDetails {
  name: string;
  role: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  teacherId: string;
}

interface StudentProps {
  user: firebase.User | null;
}

const fetchUserDetails = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDetails;
  } else {
    throw new Error('No such document!');
  }
};

const fetchStudyMaterials = async () => {
  const q = query(collection(db, 'study'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StudyMaterial[];
};

const fetchTeacherDetails = async (teacherId: string) => {
  const teacherDocRef = doc(db, 'users', teacherId);
  const docSnap = await getDoc(teacherDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDetails;
  } else {
    throw new Error('No such document!');
  }
};

const Student: React.FC<StudentProps> = ({ user }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<Record<string, UserDetails | null>>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (user && user.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data() as UserDetails);
          } else {
            throw new Error('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUser();
  }, [user]);

  const { data: studyMaterials, isLoading: isMaterialsLoading, error: materialsError } = useQuery({
    queryKey: ['studyMaterials'],
    queryFn: fetchStudyMaterials,
    onError: (error) => console.error('Error fetching study materials:', error),
    staleTime: 60000,
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      if (studyMaterials) {
        const uniqueTeacherIds = Array.from(new Set(studyMaterials.map((material) => material.teacherId)));
        uniqueTeacherIds.forEach(async (teacherId) => {
          try {
            const teacherData = await fetchTeacherDetails(teacherId);
            setTeacherDetails((prev) => ({ ...prev, [teacherId]: teacherData }));
          } catch (error) {
            console.error(`Error fetching details for teacher ${teacherId}:`, error);
          }
        });
      }
    };

    fetchTeachers();
  }, [studyMaterials]);

  const userName = userDetails ? userDetails.name : 'Loading...';
  const userRole = userDetails ? userDetails.role : '';
  const userEmail = user ? user.email : 'Loading...';

  const groupByTitle = (materials: StudyMaterial[]) => {
    return materials.reduce((acc: Record<string, StudyMaterial[]>, material) => {
      const titleKey = material.title.toLowerCase();
      if (acc[titleKey]) {
        acc[titleKey].push(material);
      } else {
        acc[titleKey] = [material];
      }
      return acc;
    }, {});
  };

  const groupedMaterials = groupByTitle(studyMaterials || []);

  const uniqueTitles = Array.from(new Set(studyMaterials?.map((material) => material.title.toLowerCase()) || []));

  const handleTitleClick = (title: string) => {
    setSelectedTitle(selectedTitle === title ? null : title);
  };

  return (
    <div>
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      <div className="container mt-4">
        <div className="card">
          <div className="card-header">
            <h1>Student Portal</h1>
          </div>
          <div className="card-body">
            {userDetails ? (
              <>
                <h3>Welcome, {userName}!</h3>
                <p>
                  <strong>Role:</strong> {userRole}
                </p>
                <p>
                  <strong>Email:</strong> {userEmail}
                </p>
                <div className="btn-group mt-3">
                  {uniqueTitles.map((title) => (
                    <button
                      key={title}
                      className={`btn btn-primary ${selectedTitle === title ? 'active' : ''}`}
                      onClick={() => handleTitleClick(title)}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </div>
        </div>

        {selectedTitle && groupedMaterials[selectedTitle] && (
          <div className="card mt-4">
            <div className="card-header">
              <h2>{selectedTitle.charAt(0).toUpperCase() + selectedTitle.slice(1)}</h2>
              <p>
                <strong>Teacher:</strong> {teacherDetails[groupedMaterials[selectedTitle][0].teacherId]?.name || 'Loading...'}
              </p>
            </div>
            <div className="card-body">
              {isMaterialsLoading ? (
                <div className="d-flex justify-content-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : materialsError ? (
                <p>Error loading study materials: {materialsError.message}</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMaterials[selectedTitle].map((material) => (
                      <tr key={material.id}>
                        <td>{material.description}</td>
                        <td>
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            {material.url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;
