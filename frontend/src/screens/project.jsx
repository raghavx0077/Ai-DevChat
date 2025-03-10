// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useRef,
//   useCallback,
// } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "../config/axios";
// import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";
// import { UserContext } from "../context/user.context";
// import Markdown from "markdown-to-jsx";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import hljs from "highlight.js";
// // Updated theme: using Monokai Sublime for more vibrant colours
// import "highlight.js/styles/monokai-sublime.css";
// import { getWebContainer } from "../config/webContainer";

// // Custom component for code blocks.
// const CodeBlock = ({ className, children, inline, ...props }) => {
//   if (inline) {
//     return (
//       <code className={`bg-gray-200 p-1 rounded ${className || ""}`} {...props}>
//         {children}
//       </code>
//     );
//   }
//   const language = className ? className.replace("lang-", "") : "";
//   return (
//     <SyntaxHighlighter language={language} style={atomDark} {...props}>
//       {children}
//     </SyntaxHighlighter>
//   );
// };

// // Helper to format AI message.
// const formatAIMessage = (message) => {
//   try {
//     const parsed = JSON.parse(message);
//     if (parsed.text) {
//       return parsed.text;
//     }
//     return message;
//   } catch (error) {
//     return message;
//   }
// };

// // Normalization function that converts keys with slashes into nested objects.
// // const normalizeFileTree = (tree) => {
// //   const normalized = {};
// //   Object.keys(tree || {}).forEach((filePath) => {
// //     // If the key does not include a slash, assign it directly.
// //     if (!filePath.includes("/")) {
// //       normalized[filePath] = tree[filePath];
// //     } else {
// //       // Split the path into parts.
// //       const parts = filePath.split("/");
// //       let current = normalized;
// //       parts.forEach((part, index) => {
// //         // For intermediate parts, create nested directories if not already present.
// //         if (index < parts.length - 1) {
// //           if (!current[part]) {
// //             current[part] = {};
// //           }
// //           current = current[part];
// //         } else {
// //           // Last part is the actual file name.
// //           current[part] = tree[filePath];
// //         }
// //       });
// //     }
// //   });
// //   return normalized;
// // };

// const Project = () => {
//   const location = useLocation();
//   const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [project, setProject] = useState(location.state.project);
//   const [message, setMessage] = useState("");
//   const { user } = useContext(UserContext);
//   const messageBox = useRef(null);
//   const [messages, setMessages] = useState([]);
//   const [fileTree, setFileTree] = useState({});
//   const [currentFile, setCurrentFile] = useState(null);
//   const [openFiles, setOpenFiles] = useState([]);
//   const [webContainer, setWebContainer] = useState(null);
//   const [iframeUrl, setIframeUrl] = useState(null);
//   const [runProcess, setRunProcess] = useState(null);

//   // Automatic saveFileTree function that sends the updated file tree to the backend.
//   function saveFileTree(ft) {
//     console.log("Automatically saving file tree:", JSON.stringify(ft, null, 2));
//     axios
//       .put("/projects/update-file-tree", {
//         projectId: project._id,
//         fileTree: ft,
//       })
//       .then((res) => {
//         console.log("Update response:", res.data);
//       })
//       .catch((err) => {
//         console.error("Error updating file tree:", err);
//       });
//   }

//   // Initialize the web container on component mount.
//   useEffect(() => {
//     getWebContainer().then((container) => {
//       setWebContainer(container);
//       console.log("Container started");
//     });
//   }, []);

//   // Handling user selection.
//   const handleUserClick = (userId) => {
//     setSelectedUserId((prev) =>
//       prev.includes(userId)
//         ? prev.filter((id) => id !== userId)
//         : [...prev, userId]
//     );
//   };

//   // API call to add collaborators.
//   const addCollaborators = () => {
//     axios
//       .put("/projects/add-user", {
//         projectId: location.state.project._id,
//         users: selectedUserId,
//       })
//       .then((res) => {
//         console.log("Collaborators updated:", res.data);
//         // Re-fetch the updated project data so that the UI reflects the change immediately.
//         axios
//           .get(`/projects/get-projects/${location.state.project._id}`)
//           .then((res) => {
//             console.log("Re-fetched project:", res.data.project);
//             setProject(res.data.project);
//           })
//           .catch((error) => console.log("Error fetching project:", error));
//         setIsModalOpen(false);
//       })
//       .catch((error) => console.log("Error adding collaborators:", error));
//   };
  

//   // Sending a message.
//   const send = () => {
//     if (!message.trim()) return;
//     const newMessage = { message, sender: user.email };
//     sendMessage("project-message", newMessage);
//     setMessages((prev) => [...prev, newMessage]);
//     setMessage("");
//   };

//   // Handling incoming messages.

//   const handleMessage = useCallback(
//     (data) => {
//       console.log("Received Message:", data);
//       let parsedMessage;
//       // If data.message is a string, try to parse it.
//       if (typeof data.message === "string") {
//         try {
//           parsedMessage = JSON.parse(data.message);
//           // If sender is missing, use data.sender (could be a string like "ai")
//           if (!parsedMessage.sender && data.sender) {
//             parsedMessage.sender = data.sender;
//           }
//         } catch (error) {
//           console.error("Error parsing message JSON, using fallback:", error);
//           parsedMessage = { message: data.message, sender: data.sender || "Unknown" };
//         }
//       } else {
//         parsedMessage = data.message;
//       }
//       console.log("Parsed Message:", parsedMessage);
  
//       // Check if the message includes a fileTree update.
//       if (
//         parsedMessage.fileTree &&
//         typeof parsedMessage.fileTree === "object"
//       ) {
//         console.log("FileTree received:", parsedMessage.fileTree);
//         if (webContainer) {
//           webContainer.mount(parsedMessage.fileTree);
//         }
//         setFileTree(parsedMessage.fileTree);
//         // If there is text along with the fileTree, add that to chat messages.
//         if (parsedMessage.text) {
//           setMessages((prev) => [
//             ...prev,
//             { message: parsedMessage.text, sender: parsedMessage.sender },
//           ]);
//         }
//       } else {
//         // Otherwise, treat it as a regular chat message.
//         setMessages((prev) => [
//           ...prev,
//           { ...parsedMessage, rawData: data },
//         ]);
//       }
//     },
//     [webContainer]
//   );
  
  
//   useEffect(() => {
//     const socket = initializeSocket(project._id);
//     receiveMessage("project-message", handleMessage);
//     return () => {
//       console.log("Cleaning up message listener");
//       socket.off("project-message", handleMessage);
//     };
//   }, [project._id, handleMessage]);

//   useEffect(() => {
//     axios
//       .get(`/projects/get-projects/${location.state.project._id}`)
//       .then((res) => {
//         console.log("Response:", res.data.project);
//         setProject(res.data.project);
//       })
//       .catch((error) => console.log("Error:", error));
//     axios
//       .get("/users/getall")
//       .then((res) => setUsers(res.data.users))
//       .catch((error) => console.log("Error:", error));
//   }, [location.state.project._id]);

//   useEffect(() => {
//     if (messageBox.current) {
//       messageBox.current.scrollTop = messageBox.current.scrollHeight;
//     }
//   }, [messages]);

//   // Helper to check if a message is from AI.
//   const isAISender = (sender) => {
//     if (typeof sender === "object") {
//       return sender._id === "ai";
//     }
//     return sender === "ai";
//   };

//   return (
//     <div>
//       <main className="h-screen w-screen flex">
//         {/* Left Panel: Chat Area */}
//         <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
//           <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 relative top-0">
//             <button
//               type="button"
//               className="flex gap-2"
//               title="Add collaborators"
//               onClick={() => setIsModalOpen(true)}
//             >
//               <i className="ri-add-large-fill mr-1"></i>
//               <p>Add Collaborator</p>
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
//               className="p-2"
//               title="Toggle Side Panel"
//             >
//               <i className="ri-group-fill"></i>
//             </button>
//           </header>
//           <div className="conversation-area flex-grow flex flex-col pb-10 relative overflow-hidden">
//             <div className="flex flex-col flex-grow w-full overflow-y-auto message-container">
//               <div
//                 ref={messageBox}
//                 className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full"
//               >
//                 {messages.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`message max-w-56 flex flex-col p-2 rounded-md w-fit ${
//                       (typeof msg.sender === "object"
//                         ? msg.sender.email
//                         : msg.sender) === user.email
//                         ? "bg-blue-500 text-white self-end"
//                         : "bg-gray-300 self-start"
//                     }`}
//                   >
//                     <small className="opacity-65 text-xs">
//                       {typeof msg.sender === "object" ? msg.sender.email : msg.sender}
//                     </small>
//                     {isAISender(msg.sender) ? (
//                       <div className="overflow-auto text-sm break-words">
//                         <Markdown
//                           options={{
//                             overrides: {
//                               p: {
//                                 component: "div",
//                                 props: { className: "markdown-paragraph break-words" },
//                               },
//                               code: { component: CodeBlock },
//                             },
//                           }}
//                         >
//                           {formatAIMessage(msg.message)}
//                         </Markdown>
//                       </div>
//                     ) : (
//                       <p className="text-sm break-words">{msg.message}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="inputfield w-full flex absolute bottom-0 bg-white border-t">
//               <input
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 className="p-2 px-4 border-none outline-none flex-grow"
//                 placeholder="Enter Message"
//               />
//               <button type="button" onClick={send} className="px-5 bg-slate-950 text-white">
//                 <i className="ri-send-plane-fill"></i>
//               </button>
//             </div>
//           </div>
//           {/* Side Panel for Collaborators */}
//           <div
//             className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute left-0 transition-all ${
//               isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
//             } top-0`}
//           >
//             <header className="flex justify-between items-center p-2 px-3 bg-slate-200">
//               <h1 className="font-semibold text-lg">Collaborators</h1>
//               <button type="button" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
//                 <i className="ri-close-line"></i>
//               </button>
//             </header>
//             <div className="users flex flex-col gap-2">
//               {project.users?.map((user) => (
//                 <div key={user._id} className="user cursor-pointer hover:bg-slate-200 flex gap-2 items-center">
//                   <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-slate-600">
//                     <i className="ri-user-fill absolute"></i>
//                   </div>
//                   <h1 className="font-semibold text-lg">{user.email}</h1>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//         {/* Right Panel: File Explorer & Code Display */}
//         <section className="right bg-red-50 flex-grow h-full flex">
//           <div className="explorer h-full max-w-64 min-w-52 bg-slate-200 ">
//             <div className="file-tree w-full">
//               {Object.keys(fileTree || {}).map((file, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setCurrentFile(file);
//                     setOpenFiles((prev) => [...new Set([...prev, file])]);
//                   }}
//                   className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
//                 >
//                   <p className="font-semibold text-lg">{file}</p>
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="code-editor flex flex-col flex-grow h-full">
//             <div className="top flex justify-between w-full">
//               <div className="files flex">
//                 {openFiles.map((file, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentFile(file)}
//                     className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 w-fit ${
//                       currentFile === file ? "bg-slate-400 text-white" : "bg-slate-300"
//                     }`}
//                   >
//                     <p className="font-semibold text-lg">{file}</p>
//                   </button>
//                 ))}
//               </div>
//               <div className="actions flex gap-2">
//                 <button
//                   onClick={async () => {
//                     await webContainer.mount(fileTree);
//                     const installProcess = await webContainer.spawn("npm", ["install"]);
//                     installProcess.output.pipeTo(
//                       new WritableStream({
//                         write(chunk) {
//                           console.log(chunk);
//                         },
//                       })
//                     );

//                     if (runProcess) {
//                       runProcess.kill();
//                     }

//                     let tempRunProcess = await webContainer.spawn("npm", ["start"]);
//                     tempRunProcess.output.pipeTo(
//                       new WritableStream({
//                         write(chunk) {
//                           console.log(chunk);
//                         },
//                       })
//                     );

//                     setRunProcess(tempRunProcess);

//                     webContainer.on("server-ready", (port, url) => {
//                       console.log("Server ready at", port, url);
//                       setIframeUrl(url);
//                     });
//                   }}
//                   className="p-2 px-4 bg-slate-200 text-white"
//                 >
//                   run
//                 </button>
//               </div>
//             </div>
//             <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
//               {fileTree[currentFile] && (
//                 <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
//                   <pre className="hljs h-full">
//                     <code
//                       className="hljs h-full outline-none"
//                       contentEditable
//                       suppressContentEditableWarning
//                       onBlur={(e) => {
//                         const updatedContent = e.target.innerText;
//                         const ft = {
//                           ...fileTree,
//                           [currentFile]: {
//                             file: { contents: updatedContent },
//                           },
//                         };
//                         setFileTree(ft);
//                         saveFileTree(ft);
//                       }}
//                       dangerouslySetInnerHTML={{
//                         __html: hljs
//                           .highlight(
//                             (fileTree[currentFile].file &&
//                               fileTree[currentFile].file.contents) ||
//                               fileTree[currentFile].content ||
//                               "",
//                             { language: "javascript" }
//                           )
//                           .value,
//                       }}
//                       style={{
//                         whiteSpace: "pre-wrap",
//                         paddingBottom: "25rem",
//                         counterSet: "line-numbering",
//                       }}
//                     />
//                   </pre>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//         {iframeUrl && webContainer && (
//           <div className="flex min-w-96 flex-col h-full ">
//             <div className="address-bar">
//               <input
//                 type="text"
//                 onChange={(e) => setIframeUrl(e.target.value)}
//                 value={iframeUrl}
//                 className="w-full p-2 px-4 bg-slate-200"
//               />
//             </div>
//             <iframe src={iframeUrl} className="w-full h-full"></iframe>
//           </div>
//         )}
//         {/* Modal for Collaborators (if needed) */}
//         {isModalOpen && (
//           <div className="modal fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-40">
//             <div className="bg-white p-5 rounded-md w-96">
//               <h2 className="text-lg font-semibold">Select Users</h2>
//               <div className="users-list flex flex-col gap-2 mt-4">
//                 {users.map((user) => (
//                   <div
//                     key={user._id}
//                     className={`p-2 border rounded-md cursor-pointer ${
//                       selectedUserId.includes(user._id)
//                         ? "bg-blue-500 text-white"
//                         : "bg-gray-200"
//                     }`}
//                     onClick={() => handleUserClick(user._id)}
//                   >
//                     {user.email}
//                   </div>
//                 ))}
//               </div>
//               <div className="buttons mt-4 flex justify-end gap-3">
//                 <button className="px-4 py-2 bg-gray-300" onClick={() => setIsModalOpen(false)}>
//                   Cancel
//                 </button>
//                 <button className="px-4 py-2 bg-blue-500 text-white" onClick={addCollaborators}>
//                   Add Collaborators
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Project;


// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useRef,
//   useCallback,
// } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "../config/axios";
// import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";
// import { UserContext } from "../context/user.context";
// import Markdown from "markdown-to-jsx";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import hljs from "highlight.js";
// import "highlight.js/styles/monokai-sublime.css";
// import { getWebContainer } from "../config/webContainer";

// // Custom component for code blocks.
// const CodeBlock = ({ className, children, inline, ...props }) => {
//   if (inline) {
//     return (
//       <code className={`bg-gray-100 p-1 rounded ${className || ""}`} {...props}>
//         {children}
//       </code>
//     );
//   }
//   const language = className ? className.replace("lang-", "") : "";
//   return (
//     <SyntaxHighlighter language={language} style={atomDark} {...props}>
//       {children}
//     </SyntaxHighlighter>
//   );
// };

// // Helper to format AI message.
// const formatAIMessage = (message) => {
//   try {
//     const parsed = JSON.parse(message);
//     if (parsed.text) {
//       return parsed.text;
//     }
//     return message;
//   } catch (error) {
//     return message;
//   }
// };

// // Normalization function that converts keys with slashes into nested objects.
// const normalizeFileTree = (tree) => {
//   const normalized = {};
//   Object.keys(tree || {}).forEach((filePath) => {
//     if (!filePath.includes("/")) {
//       normalized[filePath] = tree[filePath];
//     } else {
//       const parts = filePath.split("/");
//       let current = normalized;
//       parts.forEach((part, index) => {
//         if (index < parts.length - 1) {
//           if (!current[part]) {
//             current[part] = {};
//           }
//           current = current[part];
//         } else {
//           current[part] = tree[filePath];
//         }
//       });
//     }
//   });
//   return normalized;
// };

// const Project = () => {
//   const location = useLocation();
//   const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [project, setProject] = useState(location.state.project);
//   const [message, setMessage] = useState("");
//   const { user } = useContext(UserContext);
//   const messageBox = useRef(null);
//   const [messages, setMessages] = useState([]);
//   const [fileTree, setFileTree] = useState({});
//   const [currentFile, setCurrentFile] = useState(null);
//   const [openFiles, setOpenFiles] = useState([]);
//   const [webContainer, setWebContainer] = useState(null);
//   const [iframeUrl, setIframeUrl] = useState(null);
//   const [runProcess, setRunProcess] = useState(null);

//   // Automatic saveFileTree function that sends the updated file tree to the backend.
//   function saveFileTree(ft) {
//     console.log("Automatically saving file tree:", JSON.stringify(ft, null, 2));
//     axios
//       .put("/projects/update-file-tree", {
//         projectId: project._id,
//         fileTree: ft,
//       })
//       .then((res) => {
//         console.log("Update response:", res.data);
//       })
//       .catch((err) => {
//         console.error("Error updating file tree:", err);
//       });
//   }

//   // Initialize the web container on component mount.
//   useEffect(() => {
//     getWebContainer().then((container) => {
//       setWebContainer(container);
//       console.log("Container started");
//     });
//   }, []);

//   // Handling user selection.
//   const handleUserClick = (userId) => {
//     setSelectedUserId((prev) =>
//       prev.includes(userId)
//         ? prev.filter((id) => id !== userId)
//         : [...prev, userId]
//     );
//   };

//   // API call to add collaborators.
//   const addCollaborators = () => {
//     axios
//       .put("/projects/add-user", {
//         projectId: location.state.project._id,
//         users: selectedUserId,
//       })
//       .then((res) => {
//         console.log("Collaborators updated:", res.data);
//         setIsModalOpen(false);
//       })
//       .catch((error) => console.log("Error adding collaborators:", error));
//   };

//   // Sending a message.
//   const send = () => {
//     if (!message.trim()) return;
//     const newMessage = { message, sender: user.email };
//     sendMessage("project-message", newMessage);
//     setMessages((prev) => [...prev, newMessage]);
//     setMessage("");
//   };

//   // Handling incoming messages.
//   const handleMessage = useCallback(
//     (data) => {
//       console.log("Received Message:", data);
//       let parsedMessage;
//       try {
//         parsedMessage = JSON.parse(data.message);
//         console.log("Parsed Message:", parsedMessage);
//       } catch (error) {
//         console.error("Error parsing message JSON:", error);
//         return; // Exit early if parsing fails
//       }
//       const rawTree =
//         parsedMessage.fileTree && typeof parsedMessage.fileTree === "object"
//           ? parsedMessage.fileTree
//           : {};
//       const normalizedTree = normalizeFileTree(rawTree);
//       console.log("Normalized fileTree:", normalizedTree);
//       if (webContainer) {
//         webContainer.mount(normalizedTree);
//       }
//       setFileTree(normalizedTree);
//       setMessages((prev) => [...prev, data]);
//     },
//     [webContainer]
//   );

//   useEffect(() => {
//     const socket = initializeSocket(project._id);
//     receiveMessage("project-message", handleMessage);
//     return () => {
//       console.log("Cleaning up message listener");
//       socket.off("project-message", handleMessage);
//     };
//   }, [project._id, handleMessage]);

//   useEffect(() => {
//     axios
//       .get(`/projects/get-projects/${location.state.project._id}`)
//       .then((res) => {
//         console.log("Fetched project:", res.data.project);
//         setProject(res.data.project);
//       })
//       .catch((error) => console.log("Error fetching project:", error));
//     axios
//       .get("/users/getall")
//       .then((res) => setUsers(res.data.users))
//       .catch((error) => console.log("Error fetching users:", error));
//   }, [location.state.project._id]);

//   useEffect(() => {
//     if (messageBox.current) {
//       messageBox.current.scrollTop = messageBox.current.scrollHeight;
//     }
//   }, [messages]);

//   const isAISender = (sender) =>
//     typeof sender === "object" ? sender._id === "ai" : sender === "ai";

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-800">
//       <main className="flex h-screen">
//         {/* Left Panel: Chat Area */}
//         <section className="w-1/4 flex flex-col bg-white border-r border-gray-200 p-6 shadow-sm">
//           <header className="flex justify-between items-center pb-4 border-b border-gray-200">
//             <button
//               type="button"
//               className="flex items-center gap-2 text-lg font-semibold text-blue-600 hover:text-blue-500"
//               onClick={() => setIsModalOpen(true)}
//             >
//               <i className="ri-add-circle-line"></i>
//               <span>Add Collaborator</span>
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
//               className="text-xl text-blue-600 hover:text-blue-500"
//               title="Toggle Collaborators"
//             >
//               <i className="ri-group-line"></i>
//             </button>
//           </header>
//           <div className="flex-grow mt-4 overflow-y-auto" ref={messageBox}>
//             <div className="space-y-3">
//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`p-3 rounded-md shadow-sm ${
//                     (typeof msg.sender === "object" ? msg.sender.email : msg.sender) === user.email
//                       ? "bg-blue-100 text-blue-800 self-end"
//                       : "bg-gray-100 text-gray-800 self-start"
//                   }`}
//                 >
//                   <small className="block opacity-75 text-xs">
//                     {typeof msg.sender === "object" ? msg.sender.email : msg.sender}
//                   </small>
//                   {isAISender(msg.sender) ? (
//                     <div className="mt-1 text-sm">
//                       <Markdown
//                         options={{
//                           overrides: {
//                             p: { component: "div", props: { className: "break-words" } },
//                             code: { component: CodeBlock },
//                           },
//                         }}
//                       >
//                         {formatAIMessage(msg.message)}
//                       </Markdown>
//                     </div>
//                   ) : (
//                     <p className="mt-1 text-sm break-words">{msg.message}</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="mt-4">
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type your message..."
//               className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <button
//               type="button"
//               onClick={send}
//               className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 transition-colors"
//             >
//               Send
//             </button>
//           </div>
//         </section>
//         {/* Right Panel: File Explorer & Code Editor */}
//         <section className="w-3/4 flex">
//           <div className="w-1/4 bg-gray-100 p-6 overflow-y-auto border-r border-gray-200">
//             <h2 className="text-xl font-bold border-b pb-2 border-gray-300">Files</h2>
//             <div className="mt-4 space-y-2">
//               {Object.keys(fileTree || {}).map((file, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setCurrentFile(file);
//                     setOpenFiles((prev) => [...new Set([...prev, file])]);
//                   }}
//                   className="w-full text-left p-2 rounded hover:bg-gray-200 transition"
//                 >
//                   {file}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="flex-grow bg-white p-6 flex flex-col">
//             <div className="flex justify-between items-center mb-4">
//               <div className="flex space-x-3">
//                 {openFiles.map((file, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentFile(file)}
//                     className={`px-4 py-1 rounded ${
//                       currentFile === file ? "bg-gray-300 text-gray-900" : "bg-gray-200 text-gray-700"
//                     }`}
//                   >
//                     {file}
//                   </button>
//                 ))}
//               </div>
//               <div className="flex space-x-3">
//                 <button
//                   onClick={async () => {
//                     await webContainer.mount(fileTree);
//                     const installProcess = await webContainer.spawn("npm", ["install"]);
//                     installProcess.output.pipeTo(
//                       new WritableStream({
//                         write(chunk) {
//                           console.log(chunk);
//                         },
//                       })
//                     );
//                     if (runProcess) {
//                       runProcess.kill();
//                     }
//                     let tempRunProcess = await webContainer.spawn("npm", ["start"]);
//                     tempRunProcess.output.pipeTo(
//                       new WritableStream({
//                         write(chunk) {
//                           console.log(chunk);
//                         },
//                       })
//                     );
//                     setRunProcess(tempRunProcess);
//                     webContainer.on("server-ready", (port, url) => {
//                       console.log("Server ready at", port, url);
//                       setIframeUrl(url);
//                     });
//                   }}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
//                 >
//                   Run
//                 </button>
//               </div>
//             </div>
//             <div className="flex-grow bg-gray-50 p-6 overflow-auto">
//               {fileTree[currentFile] && (
//                 <div className="bg-white p-6 rounded shadow transition">
//                   <pre className="hljs">
//                     <code
//                       contentEditable
//                       suppressContentEditableWarning
//                       onBlur={(e) => {
//                         const updatedContent = e.target.innerText;
//                         const ft = {
//                           ...fileTree,
//                           [currentFile]: {
//                             file: { contents: updatedContent },
//                           },
//                         };
//                         setFileTree(ft);
//                         saveFileTree(ft);
//                       }}
//                       dangerouslySetInnerHTML={{
//                         __html: hljs
//                           .highlight(
//                             (fileTree[currentFile].file &&
//                               fileTree[currentFile].file.contents) ||
//                               fileTree[currentFile].content ||
//                               "",
//                             { language: "javascript" }
//                           )
//                           .value,
//                       }}
//                       style={{ whiteSpace: "pre-wrap", paddingBottom: "25rem" }}
//                     />
//                   </pre>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//         {iframeUrl && webContainer && (
//           <div className="w-full h-full">
//             <div className="p-2 bg-gray-100 border-b border-gray-200">
//               <input
//                 type="text"
//                 onChange={(e) => setIframeUrl(e.target.value)}
//                 value={iframeUrl}
//                 className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <iframe src={iframeUrl} className="w-full h-full" title="Preview"></iframe>
//           </div>
//         )}
//         {/* Modal for Collaborators */}
//         {isModalOpen && (
//           <div className="fixed inset-0 flex justify-center items-center bg-gray-200 bg-opacity-80">
//             <div className="bg-white p-6 rounded-md w-96 shadow">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">Select Users</h2>
//               <div className="space-y-3">
//                 {users.map((user) => (
//                   <div
//                     key={user._id}
//                     className={`p-2 border rounded cursor-pointer ${
//                       selectedUserId.includes(user._id)
//                         ? "bg-blue-100 text-blue-800"
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                     onClick={() => handleUserClick(user._id)}
//                   >
//                     {user.email}
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-6 flex justify-end gap-4">
//                 <button
//                   className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-blue-500 text-white rounded"
//                   onClick={addCollaborators}
//                 >
//                   Add Collaborators
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Project;



// 

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import hljs from "highlight.js";
import "highlight.js/styles/monokai-sublime.css";
import { getWebContainer } from "../config/webContainer";

// Custom component for code blocks.
const CodeBlock = ({ className, children, inline, ...props }) => {
  if (inline) {
    return (
      <code className={`bg-gray-200 p-1 rounded ${className || ""}`} {...props}>
        {children}
      </code>
    );
  }
  const language = className ? className.replace("lang-", "") : "";
  return (
    <SyntaxHighlighter language={language} style={atomDark} {...props}>
      {children}
    </SyntaxHighlighter>
  );
};

// Helper to format AI message.
const formatAIMessage = (message) => {
  try {
    const parsed = JSON.parse(message);
    if (parsed.text) {
      return parsed.text;
    }
    return message;
  } catch (error) {
    return message;
  }
};

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);

  // Automatic saveFileTree function.
  function saveFileTree(ft) {
    console.log("Automatically saving file tree:", JSON.stringify(ft, null, 2));
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log("Update response:", res.data);
      })
      .catch((err) => {
        console.error("Error updating file tree:", err);
      });
  }

  // Initialize the web container on mount.
  useEffect(() => {
    getWebContainer().then((container) => {
      setWebContainer(container);
      console.log("Container started");
    });
  }, []);

  // Handling user selection.
  const handleUserClick = (userId) => {
    setSelectedUserId((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // API call to add collaborators.
  const addCollaborators = () => {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: selectedUserId,
      })
      .then((res) => {
        console.log("Collaborators updated:", res.data);
        // Re-fetch updated project data.
        axios
          .get(`/projects/get-projects/${location.state.project._id}`)
          .then((res) => {
            console.log("Re-fetched project:", res.data.project);
            setProject(res.data.project);
          })
          .catch((error) => console.log("Error fetching project:", error));
        setIsModalOpen(false);
      })
      .catch((error) => console.log("Error adding collaborators:", error));
  };

  // Sending a message.
  const send = () => {
    if (!message.trim()) return;
    const newMessage = { message, sender: user.email };
    sendMessage("project-message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  // Combined handleMessage function.
  const handleMessage = useCallback(
    (data) => {
      console.log("Received Message:", data);
      let parsedMessage;
      if (typeof data.message === "string") {
        try {
          parsedMessage = JSON.parse(data.message);
          if (!parsedMessage.sender && data.sender) {
            parsedMessage.sender = data.sender;
          }
        } catch (error) {
          console.error("Error parsing message JSON, using fallback:", error);
          parsedMessage = { message: data.message, sender: data.sender || "Unknown" };
        }
      } else {
        parsedMessage = data.message;
      }
      console.log("Parsed Message:", parsedMessage);

      if (parsedMessage.fileTree && typeof parsedMessage.fileTree === "object") {
        console.log("FileTree received:", parsedMessage.fileTree);
        if (webContainer) {
          webContainer.mount(parsedMessage.fileTree);
        }
        setFileTree(parsedMessage.fileTree);
        if (parsedMessage.text) {
          setMessages((prev) => [
            ...prev,
            { message: parsedMessage.text, sender: parsedMessage.sender },
          ]);
        }
      } else {
        setMessages((prev) => [...prev, { ...parsedMessage, rawData: data }]);
      }
    },
    [webContainer]
  );

  useEffect(() => {
    const socket = initializeSocket(project._id);
    receiveMessage("project-message", handleMessage);
    return () => {
      console.log("Cleaning up message listener");
      socket.off("project-message", handleMessage);
    };
  }, [project._id, handleMessage]);

  useEffect(() => {
    axios
      .get(`/projects/get-projects/${location.state.project._id}`)
      .then((res) => {
        console.log("Fetched project:", res.data.project);
        setProject(res.data.project);
      })
      .catch((error) => console.log("Error fetching project:", error));
    axios
      .get("/users/getall")
      .then((res) => setUsers(res.data.users))
      .catch((error) => console.log("Error fetching users:", error));
  }, [location.state.project._id]);

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  const isAISender = (sender) =>
    typeof sender === "object" ? sender._id === "ai" : sender === "ai";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="flex h-screen">
        {/* Left Panel: Chat Area with Relative Positioning */}
        <section className="relative w-1/4 flex flex-col bg-white border-r border-gray-200 p-6 shadow-sm">
          <header className="flex justify-between items-center pb-4 border-b border-gray-200">
            <button
              type="button"
              className="flex items-center gap-2 text-lg font-semibold text-blue-600 hover:text-blue-500"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="ri-add-circle-line"></i>
              <span>Add Collaborator</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="text-xl text-blue-600 hover:text-blue-500"
              title="Toggle Collaborators"
            >
              <i className="ri-group-line"></i>
            </button>
          </header>
          <div className="flex-grow mt-4 overflow-y-auto" ref={messageBox}>
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md shadow-sm ${
                    (typeof msg.sender === "object" ? msg.sender.email : msg.sender) === user.email
                      ? "bg-blue-100 text-blue-800 self-end"
                      : "bg-gray-100 text-gray-800 self-start"
                  }`}
                >
                  <small className="block opacity-75 text-xs">
                    {typeof msg.sender === "object" ? msg.sender.email : msg.sender}
                  </small>
                  {isAISender(msg.sender) ? (
                    <div className="mt-1 text-sm">
                      <Markdown
                        options={{
                          overrides: {
                            p: {
                              component: "div",
                              props: { className: "break-words" },
                            },
                            code: { component: CodeBlock },
                          },
                        }}
                      >
                        {formatAIMessage(msg.message)}
                      </Markdown>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm break-words">{msg.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={send}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 transition-colors"
            >
              Send
            </button>
          </div>
          {/* Side Panel for Collaborators */}
          <div
            className={`transform absolute inset-0 z-10 transition-all ${
              isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
            } bg-slate-50`}
          >
            <header className="flex justify-between items-center p-2 px-3 bg-slate-200">
              <h1 className="font-semibold text-lg">Collaborators</h1>
              <button type="button" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                <i className="ri-close-line"></i>
              </button>
            </header>
            <div className="users flex flex-col gap-2">
              {project.users?.map((user) => (
                <div key={user._id} className="user cursor-pointer hover:bg-slate-200 flex gap-2 items-center">
                  <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Right Panel: File Explorer & Code Editor */}
        <section className="w-3/4 flex">
          <div className="w-1/4 bg-gray-100 p-6 overflow-y-auto border-r border-gray-200">
            <h2 className="text-xl font-bold border-b pb-2 border-gray-300">Files</h2>
            <div className="mt-4 space-y-2">
              {Object.keys(fileTree || {}).map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles((prev) => [...new Set([...prev, file])]);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-gray-200 transition"
                >
                  {file}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow bg-white p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-3">
                {openFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFile(file)}
                    className={`px-4 py-1 rounded ${
                      currentFile === file ? "bg-gray-300 text-gray-900" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    await webContainer.mount(fileTree);
                    const installProcess = await webContainer.spawn("npm", ["install"]);
                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );
                    if (runProcess) {
                      runProcess.kill();
                    }
                    let tempRunProcess = await webContainer.spawn("npm", ["start"]);
                    tempRunProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );
                    setRunProcess(tempRunProcess);
                    webContainer.on("server-ready", (port, url) => {
                      console.log("Server ready at", port, url);
                      setIframeUrl(url);
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  run
                </button>
              </div>
            </div>
            <div className="flex-grow bg-gray-50 p-6 overflow-auto">
              {fileTree[currentFile] && (
                <div className="bg-white p-6 rounded shadow transition">
                  <pre className="hljs">
                    <code
                      className="hljs h-full outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        const ft = {
                          ...fileTree,
                          [currentFile]: {
                            file: { contents: updatedContent },
                          },
                        };
                        setFileTree(ft);
                        saveFileTree(ft);
                      }}
                      dangerouslySetInnerHTML={{
                        __html: hljs
                          .highlight(
                            (fileTree[currentFile].file &&
                              fileTree[currentFile].file.contents) ||
                              fileTree[currentFile].content ||
                              "",
                            { language: "javascript" }
                          )
                          .value,
                      }}
                      style={{ whiteSpace: "pre-wrap", paddingBottom: "25rem" }}
                    />
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>
        {iframeUrl && webContainer && (
          <div className="w-full h-full">
            <div className="p-2 bg-gray-100 border-b border-gray-200">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full" title="Preview"></iframe>
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-200 bg-opacity-80">
            <div className="bg-white p-5 rounded-md w-96 shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Users</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`p-2 border rounded cursor-pointer ${
                      selectedUserId.includes(user._id)
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    {user.email}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={addCollaborators}
                >
                  Add Collaborators
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Project;
