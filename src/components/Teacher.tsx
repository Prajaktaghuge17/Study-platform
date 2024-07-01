import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';//This line imports several functions from the Firebase Firestore library, which are used to interact with Firestore, a NoSQL database provided by Firebase. 
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import NavBar from './Navbar'; // Import NavBar
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Dashboard.css';
//doc- Creates a reference to a specific document in a Firestore collection.
//getDoc-  Retrieves the data of a specific document from Firestore.
//query - Creates a query object to retrieve documents from a collection based on specified criteria.
interface UserDetails {//Using interfaces in TypeScript helps create robust, readable, and maintainable code by providing a clear contract for the structure of objects. They enhance type safety, promote code reuse, and facilitate better design patterns in your application.
  name: string;
  role: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
}

interface TeacherProps {
  user: firebase.User | null;
}

const fetchUserDetails = async (userId: string) => {
  //userId: string: This parameter expects a string representing the unique identifier of the user whose details need to be fetched.
  const userDocRef = doc(db, 'users', userId);//db: The Firestore database instance
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDetails;
  } else {
    throw new Error('No such document!');
  }
};

const fetchStudyMaterials = async () => {
  const q = query(collection(db, 'study'));//Creates a query object to retrieve all documents from the study collection
  //collection(db, 'study'): Creates a reference to the study collection
  const querySnapshot = await getDocs(q);//Executes the query and retrieves the resulting documents.
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StudyMaterial[];// Transforms the query snapshot into an array of study material objects
//doc.id: The unique identifier of the document.
// doc.data(): A method that returns the data stored in the document as an object.
// { id: doc.id, ...doc.data() }: Combines the document ID and data into a single object. The spread operator ... merges the properties of the doc.data() object with the id property.

};

const addStudyMaterial = async (newMaterial: Partial<StudyMaterial>) => {
  //newMaterial: An object of type Partial<StudyMaterial>, which means it can have some or all of the properties of StudyMaterial.
  const docRef = await addDoc(collection(db, 'study'), newMaterial);
  //addDoc: A function that adds a new document to the specified collection with the given data.
// newMaterial: The data to be stored in the new document.
// await: Waits for the promise returned by addDoc to resolve.
  return { id: docRef.id, ...newMaterial };//docRef.id: The ID of the newly created document.
  // ...newMaterial: The spread operator, which includes all the properties of newMaterial.
  // { id: docRef.id, ...newMaterial }: Combines the document ID and data into a single object.
};

const updateStudyMaterial = async (material: StudyMaterial) => {//material: An object of type StudyMaterial, representing the updated study material
  const { id, ...data } = material;
  const docRef = doc(db, 'study', id);//doc(db, 'study', id): Creates a reference to the document in the study collection with the given ID.
  await updateDoc(docRef, data);
  //updateDoc: A function that updates the specified document with the given data.
// docRef: The reference to the document to be updated.
// data: The new data to be stored in the document.
  return material;
};

const deleteStudyMaterial = async (id: string) => {
  const docRef = doc(db, 'study', id);
  await deleteDoc(docRef);
  return id;
};

const Teacher: React.FC<TeacherProps> = ({ user }) => {//React.FC is used to know the component is a functional component
  //This part ({ user }) is a JavaScript feature called destructuring. It means that the component is receiving an object (the props) and it is extracting the user property from that object.

// Destructuring: It's a syntax in JavaScript that allows you to extract properties from objects or items from arrays and assign them to variables.
// user: This is the prop that is being extracted from the props object. In the context of the Teacher component, user is expected to be an object of type firebase.User or null.
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [studyMaterial, setStudyMaterial] = useState<Partial<StudyMaterial>>({
    title: '',
    description: '',
    url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    onError: (error) => console.error('Error fetching study materials:', error)
  });

  const addMutation = useMutation({
    mutationFn: addStudyMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries('studyMaterials');
      setShowAddForm(false);
      setStudyMaterial({ title: '', description: '', url: '' });
    },
    onError: (error) => console.error('Error adding study material:', error)
  });

  const updateMutation = useMutation({
    mutationFn: updateStudyMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries('studyMaterials');
      setShowAddForm(false);
      setStudyMaterial({ title: '', description: '', url: '' });
      setEditingMaterialId(null);
    },
    onError: (error) => console.error('Error updating study material:', error)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudyMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries('studyMaterials');
    },
    onError: (error) => console.error('Error deleting study material:', error)
  });

  useEffect(() => {
    if (userDetails && userDetails.role !== 'teacher') {
      navigate('/student');
    }
  }, [userDetails, navigate]);

  const handleAddStudyMaterial = () => {
    if (editingMaterialId) {
      updateMutation.mutate({ id: editingMaterialId, ...studyMaterial } as StudyMaterial);
    } else {
      addMutation.mutate(studyMaterial);
    }
  };

  const handleEdit = (material: StudyMaterial) => {
    setStudyMaterial(material);
    setEditingMaterialId(material.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (showAddForm) {
      setStudyMaterial({ title: '', description: '', url: '' });
      setEditingMaterialId(null);
    }
  };

  const toggleTableVisibility = () => {
    setShowTable(!showTable);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStudyMaterial({ ...studyMaterial, [name]: value });
  };

  const userName = userDetails ? userDetails.name : 'Loading...';
  const userRole = userDetails ? userDetails.role : '';
  const userEmail = user ? user.email : 'Loading...';

  if (!userDetails || isMaterialsLoading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (materialsError) {
    return <div>Error loading study materials: {materialsError.message}</div>;
  }

  return (
    <div>
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} /> {/* Add NavBar here */}
      <div className="container mt-4"> 
        {/* container centers the content  */}
        <div className="card">
          <div className="card-header">
            <h1>Teacher Portal</h1>
          </div>
          <div className="card-body">
            <>
              <h3>Welcome, {userName}!</h3>
              <p><strong>Role:</strong> {userRole}</p>
              <p><strong>Email:</strong> {userEmail}</p>
              <button className="btn btn-outline-primary mt-3 me-2" onClick={toggleAddForm}>
                {editingMaterialId ? 'Edit Study Material' : 'Add Study Material'}
              </button>
              <button className="btn btn-outline-secondary mt-3" onClick={toggleTableVisibility}>
                {showTable ? 'Hide Study Materials' : 'Show Study Materials'}
              </button>
            </>
          </div>
        </div>

        {showAddForm && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingMaterialId ? 'Edit' : 'Add'} Study Material</h5>
                  <button type="button" className="btn-close" onClick={toggleAddForm} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={studyMaterial.title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={studyMaterial.description}
                      onChange={handleChange}
                      className="form-control"
                    ></textarea>
                  </div>
                  <div className="form-group mt-3">
                    <label htmlFor="url">URL</label>
                    <input
                      type="text"
                      id="url"
                      name="url"
                      value={studyMaterial.url}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={toggleAddForm}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={handleAddStudyMaterial}>
                    {editingMaterialId ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTable && (
          <div className="mt-4">
            <h3>Study Materials</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studyMaterials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.title}</td>
                    <td>{material.description}</td>
                    <td>{material.url}</td>
                    <td>
                      <button className="btn btn-outline-info btn-sm me-2" onClick={() => handleEdit(material)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(material.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teacher;
