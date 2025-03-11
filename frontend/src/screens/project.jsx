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
