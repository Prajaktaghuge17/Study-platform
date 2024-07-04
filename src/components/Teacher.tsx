
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import NavBar from './Navbar';
import { Spinner, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
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
  userId: string; // Add userId to StudyMaterial
}

interface TeacherProps {
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

const fetchStudyMaterials = async (userId: string) => {
  const q = query(collection(db, 'study'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StudyMaterial[];
};

const addStudyMaterial = async (newMaterial: Partial<StudyMaterial>, userId: string) => {
  const docRef = await addDoc(collection(db, 'study'), { ...newMaterial, userId });
  return { id: docRef.id, ...newMaterial, userId };
};

const updateStudyMaterial = async (material: StudyMaterial) => {
  const { id, ...data } = material;
  const docRef = doc(db, 'study', id);
  await updateDoc(docRef, data);
  return material;
};

const deleteStudyMaterial = async (id: string) => {
  const docRef = doc(db, 'study', id);
  await deleteDoc(docRef);
  return id;
};

const Teacher: React.FC<TeacherProps> = ({ user }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [studyMaterial, setStudyMaterial] = useState<Partial<StudyMaterial>>({
    title: '',
    description: '',
    url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false); // New state for edit success alert
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
    queryKey: ['studyMaterials', user?.uid], // Add user?.uid as part of the queryKey
    queryFn: () => fetchStudyMaterials(user?.uid ?? ''),
    onError: (error) => console.error('Error fetching study materials:', error)
  });

  const addMutation = useMutation({
    mutationFn: (newMaterial: Partial<StudyMaterial>) => addStudyMaterial(newMaterial, user?.uid ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries(['studyMaterials', user?.uid]);
      setShowAddForm(false);
      setStudyMaterial({ title: '', description: '', url: '' });
    },
    onError: (error) => console.error('Error adding study material:', error)
  });

  const updateMutation = useMutation({
    mutationFn: updateStudyMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries(['studyMaterials', user?.uid]);
      setShowAddForm(false);
      setStudyMaterial({ title: '', description: '', url: '' });
      setEditingMaterialId(null);
      setShowEditSuccessAlert(true); // Show edit success alert
      setTimeout(() => {
        setShowEditSuccessAlert(false);
      }, 3000);
    },
    onError: (error) => console.error('Error updating study material:', error)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudyMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries(['studyMaterials', user?.uid]);
      setShowConfirmModal(false);
      setMaterialToDelete(null);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
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
    setShowConfirmModal(true);
    setMaterialToDelete(id);
  };

  const confirmDelete = () => {
    if (materialToDelete) {
      deleteMutation.mutate(materialToDelete);
    }
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
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      <div className="container mt-4">
        <div className="card">
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
                  <h5 className="modal-title">{editingMaterialId ? 'Edit Study Material' : 'Add Study Material'}</h5>
                  <button type="button" className="btn-close" onClick={toggleAddForm}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={studyMaterial.title}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={studyMaterial.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="url" className="form-label">URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id="url"
                      name="url"
                      value={studyMaterial.url}
                      onChange={handleChange}
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
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Study Materials</h5>
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
                  {studyMaterials && studyMaterials.length > 0 ? (
                    studyMaterials.map((material) => (
                      <tr key={material.id}>
                        <td>{material.title}</td>
                        <td>{material.description}</td>
                        <td>
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            {material.url}
                          </a>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-primary me-2"
                            onClick={() => handleEdit(material)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(material.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No study materials found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this study material?
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </Modal.Footer>
        </Modal>

        <Alert show={showSuccessAlert} variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
          Study material deleted successfully!
        </Alert>
        <Alert show={showEditSuccessAlert} variant="success" onClose={() => setShowEditSuccessAlert(false)} dismissible>
          Study material updated successfully!
        </Alert>
      </div>
    </div>
  );
};

export default Teacher;
