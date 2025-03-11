// import React, { useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "../config/axios";
// import { UserContext } from "../context/user.context";

// const Login = () => {
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); // 'success' or 'error'
//   const { setUser } = useContext(UserContext);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setMessage(""); // Clear previous messages

//     const email = e.target.email.value;
//     const password = e.target.password.value;

//     try {
//       const res = await axios.post("/users/login", { email, password });

//       localStorage.setItem("token", res.data.token);
//       setUser(res.data.user);

//       setMessage("Login successful!");
//       setMessageType("success");

//       setTimeout(() => {
//         navigate("/");
//       }, 1500); // Redirect after 1.5 sec
//     } catch (err) {
//       setMessage("Invalid email or password!");
//       setMessageType("error");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-6 rounded-lg shadow-md w-80">
//         <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        
//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             required
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             required
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           {/* ✅ Message appears here */}
//           {message && (
//             <p className={`text-sm text-center ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
//               {message}
//             </p>
//           )}

//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
//           >
//             Login
//           </button>
//         </form>

//         <p className="text-center mt-4">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-blue-500">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    const email = e.target.email.value;
    const password = e.target.password.value;

    // Log the payload to see what is being sent
    console.log("Login Payload:", { email, password });

    try {
      const res = await axios.post("/users/login", { email, password });
      console.log("Login Response:", res.data);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      setMessage("Login successful!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/");
      }, 1500); // Redirect after 1.5 sec
    } catch (err) {
      console.error("Login Error:", err.response ? err.response.data : err);
      setMessage("Invalid email or password!");
      setMessageType("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Message appears here */}
          {message && (
            <p className={`text-sm text-center ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
