"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { supabase } from "./lib/supabase/client.js"
import LoginForm from "./components/LoginForm.js"
import SignUpForm from "./components/SignUpForm.js"
import "./App.css"

const WelcomeScreen = () => (
  <div className="welcome-screen">
    <div className="welcome-logo"></div>
    <h1 className="welcome-title">Welcome to LPEE</h1>
    <p className="welcome-subtitle">
      Your intelligent conversation partner. Start a new chat to begin exploring ideas, getting answers, and having
      meaningful conversations.
    </p>
    <div className="welcome-features">
      <div className="welcome-feature">
        <span className="welcome-feature-icon">💬</span>
        <div className="welcome-feature-title">Natural Conversations</div>
        <div className="welcome-feature-desc">Chat naturally with AI assistance</div>
      </div>
      <div className="welcome-feature">
        <span className="welcome-feature-icon">🖼️</span>
        <div className="welcome-feature-title">Image Analysis</div>
        <div className="welcome-feature-desc">Upload and discuss images</div>
      </div>
      <div className="welcome-feature">
        <span className="welcome-feature-icon">🎤</span>
        <div className="welcome-feature-title">Voice Input</div>
        <div className="welcome-feature-desc">Speak your messages naturally</div>
      </div>
      <div className="welcome-feature">
        <span className="welcome-feature-icon">✏️</span>
        <div className="welcome-feature-title">Edit & Refine</div>
        <div className="welcome-feature-desc">Edit messages and regenerate responses</div>
      </div>
    </div>
  </div>
)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  const [conversations, setConversations] = useState({})
  const [currentConversation, setCurrentConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [thinking, setThinking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingMessage, setEditingMessage] = useState(null)
  const [editedMessage, setEditedMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const textareaRef = useRef(null)
  const messageAreaRef = useRef(null)

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        await fetchConversationsFromSupabase(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setConversations({})
        setCurrentConversation(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        await fetchConversationsFromSupabase(session.user.id)
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationsFromSupabase = async (userId) => {
    try {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          title,
          created_at,
          messages (
            id,
            content,
            sender,
            image_url,
            created_at
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const parsed = {}
      conversations.forEach((convo) => {
        parsed[convo.id] = {
          title: convo.title || "New conversation",
          messages: convo.messages
            .map((msg) => ({
              role: msg.sender,
              content: msg.content,
              ...(msg.image_url && { image: msg.image_url }),
            }))
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        }
      })

      setConversations(parsed)

      const savedConversation = localStorage.getItem("currentConversation")
      if (savedConversation && parsed[savedConversation]) {
        setCurrentConversation(savedConversation)
      } else if (Object.keys(parsed).length > 0 && !currentConversation) {
        setCurrentConversation(Object.keys(parsed)[0])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchConversations = () => {
    if (!user) return
    fetchConversationsFromSupabase(user.id)
  }

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (currentConversation) {
      localStorage.setItem("currentConversation", currentConversation)
    }
  }, [currentConversation])

  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
    adjustHeight()
  }, [message])

  useEffect(() => {
    if (messageAreaRef.current && currentConversation && conversations[currentConversation]?.messages?.length > 0) {
      const messageArea = messageAreaRef.current
      messageArea.scrollTop = messageArea.scrollHeight
    }
  }, [conversations, currentConversation, thinking])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedImage(file)
    alert("Image selected. Click Send to send it. Click the image button again to change it.")
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    const fileInput = document.getElementById("image-upload")
    if (fileInput) fileInput.value = ""
  }

  const switchConversation = (conversationId) => {
    setCurrentConversation(conversationId)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const createNewConversation = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: user.id,
            title: "New conversation",
          },
        ])
        .select()
        .single()

      if (error) throw error

      const newId = data.id
      setConversations((prev) => ({
        ...prev,
        [newId]: {
          title: "New conversation",
          messages: [],
        },
      }))
      setCurrentConversation(newId)
      if (window.innerWidth < 768) setSidebarOpen(false)
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const deleteConversation = async (conversationId) => {
    if (!user) return

    try {
      const { error } = await supabase.from("conversations").delete().eq("id", conversationId).eq("user_id", user.id)

      if (error) throw error

      const updatedConvos = { ...conversations }
      delete updatedConvos[conversationId]
      setConversations(updatedConvos)
      if (currentConversation === conversationId) {
        localStorage.removeItem("currentConversation")
        setCurrentConversation(null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return
    if (!currentConversation || !user) {
      alert("No conversation selected. Please create a new conversation first.")
      return
    }

    const updatedConvos = { ...conversations }

    const userMessage = {
      role: "user",
      content: message || "",
      ...(selectedImage && { image: URL.createObjectURL(selectedImage) }),
    }

    updatedConvos[currentConversation].messages.push(userMessage)

    try {
      let imageUrl = null
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-images")
          .upload(fileName, selectedImage)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("chat-images").getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const { error: messageError } = await supabase.from("messages").insert([
        {
          conversation_id: currentConversation,
          content: message || "",
          sender: "user",
          image_url: imageUrl,
        },
      ])

      if (messageError) throw messageError
    } catch (error) {
      console.error("Error saving message:", error)
    }

    setMessage("")
    setThinking(true)
    setConversations(updatedConvos)

    if (selectedImage) {
      setSelectedImage(null)
      const fileInput = document.getElementById("image-upload")
      if (fileInput) fileInput.value = ""
    }

    try {
      let response
      let isImage = false

      if (selectedImage) {
        isImage = true
        const formData = new FormData()
        formData.append("image", selectedImage)
        if (message.trim()) formData.append("prompt", message)
        formData.append("conversationId", String(currentConversation))

        response = await axios.post("http://127.0.0.1:5000/api/chat-with-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        response = await axios.post("http://127.0.0.1:5000/api/chat", {
          conversationId: currentConversation,
          messages: updatedConvos[currentConversation].messages,
        })
      }

      const newMessages = [...updatedConvos[currentConversation].messages]
      const assistantMessage = {
        role: "assistant",
        content: response.data.content || "⚠️ Empty response from model.",
      }

      newMessages.push(assistantMessage)
      updatedConvos[currentConversation] = {
        ...updatedConvos[currentConversation],
        messages: newMessages,
      }

      try {
        await supabase.from("messages").insert([
          {
            conversation_id: currentConversation,
            content: assistantMessage.content,
            sender: "assistant",
          },
        ])
      } catch (error) {
        console.error("Error saving assistant message:", error)
      }

      setConversations(updatedConvos)
      setThinking(false)

      if (updatedConvos[currentConversation].messages.length >= 4) {
        await axios.post("http://127.0.0.1:5000/api/update-title", {
          conversationId: currentConversation,
          messages: updatedConvos[currentConversation].messages,
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      let errorMessage = "Failed to get a response from the server."
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 404) {
        errorMessage = "Server endpoint not found. Please check if the server is running."
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again."
      }
      alert(errorMessage)
      setThinking(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const btn = document.activeElement
        if (btn) {
          btn.classList.add("copied")
          btn.innerHTML = "✓"
          setTimeout(() => {
            btn.classList.remove("copied")
            btn.innerHTML = "📋"
          }, 1200)
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  const handleRightClick = (e, messageIndex) => {
    e.preventDefault()
    if (e.target.closest(".message.user")) {
      setEditingMessage(messageIndex)
      setEditedMessage(conversations[currentConversation].messages[messageIndex].content)
    }
  }

  const handleEditSave = async () => {
    if (!editedMessage.trim() || thinking) return
    setThinking(true)

    const updatedConvos = { ...conversations }
    const messages = [...updatedConvos[currentConversation].messages]
    const originalMessage = messages[editingMessage]

    messages[editingMessage] = {
      role: "user",
      content: editedMessage,
      ...(originalMessage.image && { image: originalMessage.image }),
    }

    messages.splice(editingMessage + 1)

    updatedConvos[currentConversation] = {
      ...updatedConvos[currentConversation],
      messages: [...messages],
    }

    setConversations(updatedConvos)
    setEditingMessage(null)

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/edit-message", {
        conversationId: currentConversation,
        messageIndex: editingMessage,
        newContent: editedMessage,
        hasImage: !!originalMessage.image,
      })

      if (res.data.error) {
        alert("Edit failed: " + res.data.error)
      } else {
        const finalConvos = { ...updatedConvos }
        finalConvos[currentConversation].messages.push({
          role: "assistant",
          content: res.data.content,
        })
        setConversations(finalConvos)
      }
    } catch (err) {
      console.error("Error editing message:", err)
      alert("Error editing message")
    } finally {
      setThinking(false)
      setEditedMessage("")
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data)
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          const formData = new FormData()
          formData.append("audio", blob, "voice.wav")

          try {
            const res = await axios.post("http://127.0.0.1:5000/api/stt", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })

            if (res.data.text) {
              setMessage((prev) => prev + " " + res.data.text.trim())
            }
          } catch (err) {
            console.error("STT request failed:", err)
            alert("❌ Error converting speech to text")
          }
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (err) {
        console.error("Microphone error:", err)
        alert("⚠️ Could not access microphone.")
      }
    }
  }

  const formatMessageWithCodeBlocks = (content) => {
    if (!content || typeof content !== "string" || content.trim() === "") {
      return content || ""
    }

    try {
      const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/g)

      return parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const codeContent = part.slice(3, -3)
          const lines = codeContent.split("\n")
          const language = lines[0].trim()
          const code = lines.slice(1).join("\n")

          return (
            <div key={index} className="code-block">
              {language && <div className="code-language">{language}</div>}
              <pre>
                <code>{code}</code>
              </pre>
              <button className="copy-code-btn" onClick={() => copyToClipboard(code)} title="Copy code">
                📋
              </button>
            </div>
          )
        } else if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="inline-code">
              {part.slice(1, -1)}
            </code>
          )
        } else {
          return part.split("\n").map((line, lineIndex, array) => (
            <span key={`${index}-${lineIndex}`}>
              {line}
              {lineIndex < array.length - 1 && <br />}
            </span>
          ))
        }
      })
    } catch (error) {
      console.error("Error formatting message with code blocks:", error)
      return content.split("\n").map((line, index, array) => (
        <span key={index}>
          {line}
          {index < array.length - 1 && <br />}
        </span>
      ))
    }
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setConversations({})
      setCurrentConversation(null)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-layout">
        <div className="auth-wrapper">
          {showSignUp ? (
            <div>
              <SignUpForm onSignUpSuccess={() => setShowSignUp(false)} />
              <div className="auth-switch">
                Already have an account?{" "}
                <button onClick={() => setShowSignUp(false)} className="auth-switch-btn">
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <div>
              <LoginForm onLoginSuccess={handleLoginSuccess} />
              <div className="auth-switch">
                Don't have an account?{" "}
                <button onClick={() => setShowSignUp(true)} className="auth-switch-btn">
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">
          <h1 className="app-title">LPEE</h1>
          <div className="user-info">
            <div className="user-avatar">{user.email.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-email">{user.email}</div>
              <button onClick={handleLogout} className="logout-btn">
                Sign Out
              </button>
            </div>
          </div>
          <button className="new-conversation-btn" onClick={createNewConversation}>
            + New Chat
          </button>
          <div className="conversations-list">
            {Object.keys(conversations).map((cid) => (
              <div key={cid} className="conversation-item">
                <button className="conversation-btn" onClick={() => switchConversation(cid)}>
                  {conversations[cid]?.title || "Chat"}
                </button>
                <button className="delete-btn" onClick={() => deleteConversation(cid)}></button>
              </div>
            ))}
          </div>
        </div>
        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
      </aside>

      <main className="chat-container">
        <header className="chat-header">
          <h2>{conversations[currentConversation]?.title || "Chat"}</h2>
        </header>
        <section className="message-area" ref={messageAreaRef}>
          {!currentConversation ||
          (currentConversation && conversations[currentConversation]?.messages?.length === 0) ? (
            <WelcomeScreen />
          ) : (
            conversations[currentConversation].messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role} animate${editingMessage === index ? " editing" : ""}`}
                onContextMenu={(e) => handleRightClick(e, index)}
              >
                <div className="message-actions">
                  <button
                    className="copy-btn"
                    data-tooltip="Copy"
                    onClick={() => copyToClipboard(msg.content)}
                    aria-label="Copy message"
                  >
                    <span>📋</span>
                  </button>
                  {msg.role === "user" && (
                    <button
                      className="edit-btn"
                      data-tooltip="Edit"
                      onClick={() => {
                        setEditingMessage(index)
                        setEditedMessage(msg.content)
                      }}
                      aria-label="Edit message"
                    >
                      <span>✏️</span>
                    </button>
                  )}
                </div>

                <div className="message-content">
                  {editingMessage === index ? (
                    <textarea autoFocus value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)} />
                  ) : (
                    <>
                      {msg.image && (
                        <div className="message-image">
                          <img
                            src={msg.image || "/placeholder.svg"}
                            alt="Uploaded image"
                            style={{ maxWidth: "300px", maxHeight: "300px", borderRadius: "8px" }}
                          />
                        </div>
                      )}
                      {msg.content && <div className="message-text">{formatMessageWithCodeBlocks(msg.content)}</div>}
                    </>
                  )}
                </div>

                {editingMessage === index && (
                  <div className="edit-buttons">
                    <button className="save-edit-btn" onClick={handleEditSave} disabled={thinking}>
                      {thinking ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="cancel-edit-btn"
                      onClick={() => {
                        setEditingMessage(null)
                        setEditedMessage("")
                      }}
                      disabled={thinking}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          {thinking && (
            <div className="thinking-indicator">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>
          )}
        </section>

        <footer className="input-area">
          {selectedImage && (
            <div className="image-preview">
              <img src={URL.createObjectURL(selectedImage) || "/placeholder.svg"} alt="Preview" />
              <div className="image-preview-info">
                <span>{selectedImage.name}</span>
                <button onClick={clearSelectedImage} className="remove-preview-btn">
                  ✕
                </button>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="message-input"
            rows={1}
            disabled={editingMessage !== null}
          />
          <div className="input-buttons">
            <button
              className={`mic-btn ${isRecording ? "active" : ""}`}
              onClick={toggleRecording}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1v11" />
                  <path d="M19 11a7 7 0 0 1-14 0" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>

            {selectedImage ? (
              <div className="image-selected">
                <span title={`Selected: ${selectedImage.name}`}>📷</span>
                <button className="clear-image-btn" onClick={clearSelectedImage} title="Clear image">
                  ✕
                </button>
              </div>
            ) : (
              <label htmlFor="image-upload" className="image-btn" title="Upload image">
                <span>🖼️</span>
              </label>
            )}
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageUpload(e)}
            />

            <button className="send-btn" onClick={sendMessage}>
              <span>→</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
