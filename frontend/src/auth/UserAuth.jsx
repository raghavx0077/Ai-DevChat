import React ,{useContext,useState,useEffect}from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom';



const UserAuth = ({children}) => {
  
  const {user}=useContext(UserContext);

  const[loading,setLoading]=useState(true);
  
    const navigate=useNavigate();
  const token =localStorage.getItem('token');


  useEffect(() => {
    if (!token || !user) {
        navigate('/login');
    } else {
        setLoading(false);
    }
}, [token, user, navigate]); // ✅ Dependencies ensure it runs when values change

     
    if(loading){
        return <div>Loading...</div>
    } 
    return (
   <>
   {
        children
      }</>
      
  )
}

export default UserAuth
