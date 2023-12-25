import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Sidebar from '../../components/Sidebar';

const firebaseConfig = {
    apiKey: "AIzaSyDHZOmC3wqbu6oTllK2QOCUyLo4V2kX0vk",
    authDomain: "mychatapp-81ceb.firebaseapp.com",
    projectId: "mychatapp-81ceb",
    storageBucket: "mychatapp-81ceb.appspot.com",
    messagingSenderId: "186103250800",
    appId: "1:186103250800:web:1d3d4a377f81df0b7619b5",
    measurementId: "G-JRC0PPJ161"
  };


  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth();
  
  function AdminDash() {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
  
    useEffect(() => {
      const fetchMessages = () => {
        const getPostsFromFirebase = [];
        const unsubscribe = onSnapshot(collection(db, 'messages'), (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            getPostsFromFirebase.push({
              ...doc.data(),
              key: doc.id,
            });
          });
          setPosts(getPostsFromFirebase);
          setLoading(false);
        });
  
        // Cleanup function
        return () => unsubscribe();
      };
  
      const fetchUserAccounts = async () => {
        try {
          const userRecords = await getAuth().listUsers(auth);
          const userData = userRecords.map((userRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            // Add other user properties as needed
          }));
  
          setUsers(userData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user accounts:', error);
          setLoading(false);
        }
      };
  
      // Fetch both messages and user accounts
      fetchMessages();
      fetchUserAccounts();
    }, [db, auth, loading]);
  
    const handleDeleteMessage = async (postId) => {
      try {
        await deleteDoc(doc(db, 'messages', postId));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    };
  
    const handleDeleteAllMessages = async () => {
      try {
        const querySnapshot = await collection(db, 'messages').get();
        const batch = db.batch();
  
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
  
        await batch.commit();
      } catch (error) {
        console.error('Error deleting all messages:', error);
      }
    };
  
  return (
    <>
      {/* Your existing header content */}
      <div className='flex border h-screen w-auto'>
        <div className='flex flex-col w-1/5 h-full py-8 gap-1 border-r'>
        <Sidebar />
        </div>
        <div className='flex flex-col ml-auto my-auto gap-5 px-5'>
          {/* User information */}
        </div>

        <div className='flex flex-col w-full h-full mx-auto gap-3 py-10'>
         
           {/* Table to display messages */}
           <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.key}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.text}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.timestamp.toDate().toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={() => handleDeleteMessage(post.key)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminDash;