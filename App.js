"use client"

import { useState, useEffect, useRef } from "react"
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

  // Hardcoded scripts
  const SCRIPT_USER1 = [
    { user: "Salut, comment ça va ?", bot: "Je suis un assistant IA, donc je ne ressens pas d'émotions comme un humain, mais je fonctionne parfaitement et je suis prêt à vous aider pour tout ce dont vous avez besoin. Si je pouvais ressentir quelque chose, je dirais que je suis curieux et impatient de voir nos échanges. Et vous, comment allez-vous ?" },
    {
      user: "Hi!",
      bot: "Hello! I’m an AI assistant for LPEE, ready to help with any questions or provide information about our activities."
    },

    { user: "Ça va, merci. Est-ce que tu peux me dire un truc intéressant qui n'a rien à voir avec le travail ?", bot: "Bien sûr ! Saviez-vous que le béton utilisé aujourd'hui peut être conçu pour absorber le dioxyde de carbone de l'air et réduire l'empreinte carbone des bâtiments ? C'est un exemple d'innovation durable dans la construction." },
    { user: "Ah oui, c'est impressionnant. Et sinon, peux-tu me donner un aperçu des activités récentes du LPEE dans le béton et matériaux ?", bot: "Bien sûr. Depuis janvier 2025, le LPEE a analysé et validé plus de 1 000 échantillons de béton sur différents chantiers au Maroc. Les contrôles portaient sur la résistance mécanique, la durabilité et la conformité aux normes NM 10.1.004 et NM 10.2.008. On observe également une hausse des demandes liées aux matériaux recyclés et aux solutions de construction durable." },
    { user: "Quels sont les projets les plus suivis récemment ?", bot: "Les principaux projets sont :\n\nTramway Casablanca, Extension Ligne 2\n\nAutoroute Casablanca-Rabat, Lot 3\n\nPort Tanger Med, Zone logistique\nPour chacun, le LPEE a effectué des essais de matériaux et suivi la qualité sur site, en émettant des recommandations détaillées pour garantir la conformité." },
    { user: "Can you tell me about the geotechnical studies conducted this year?", bot: "Yes. In 2025, LPEE performed over 3,000 soil and foundation studies for various infrastructure projects. Common issues detected were low soil compaction in coastal regions and clay layers requiring stabilization. For each case, engineers provided specific recommendations to ensure safe construction and structural stability." },
    { user: "Et au niveau des laboratoires, quels tests sont les plus fréquents ?", bot: "Les tests les plus demandés sont :\n\nRésistance à la compression du béton\n\nAnalyses granulométriques des matériaux\n\nEssais de durabilité et vieillissement\n\nContrôle de qualité des enrobés bitumineux\nCes quatre catégories représentent environ 75 % des demandes globales." },
    { user: "Tiens, petite question : est-ce que les IA comme toi peuvent apprendre de nouvelles choses par elles-mêmes ?", bot: "Je peux traiter et analyser les données qui me sont fournies, mais je n'apprends pas de façon autonome comme un humain. Je fonctionne en utilisant les informations et les modèles qui m'ont été programmés." }
  ]

  const SCRIPT_USER2 = [
    { user: "Peux-tu me donner un aperçu rapide des anomalies ou non-conformités récentes ?", bot: "Oui, environ 4 % des échantillons ont présenté des écarts : certains bétons légèrement en dessous de la résistance attendue et quelques granulats non conformes aux spécifications. Pour chaque cas, le LPEE a fourni des recommandations détaillées pour corriger les anomalies." },
    { user: "Que penses-tu de la performance du secteur environnement ?", bot: "Le secteur environnement affiche une performance remarquable avec une croissance de +15.3%, la plus élevée de tous les secteurs d'activité du LPEE. Cette forte progression s'explique probablement par plusieurs facteurs :\nPremièrement, le renforcement du cadre réglementaire environnemental au Maroc pousse les entreprises et collectivités à multiplier les études d'impact et contrôles de conformité.\nDeuxièmement, la sensibilisation croissante aux enjeux écologiques génère une demande accrue d'analyses de qualité de l'air, de l'eau et des sols.\nAvec 552 analyses réalisées (17% du volume total) et un délai moyen de 10.8 jours, ce secteur trouve un équilibre intéressant entre volume d'activité et efficacité opérationnelle. Le délai reste raisonnable comparé à la géotechnique (14.5 jours) ou aux structures (18.3 jours), tout en étant plus long que les matériaux de construction (7.2 jours), ce qui reflète la complexité technique des analyses environnementales.\nCette dynamique positionne l'environnement comme un secteur d'avenir pour le LPEE, avec un potentiel de croissance soutenu dans les années à venir, notamment avec les grands projets d'infrastructure verte du royaume." }
  ]

  const clearSelectedImage = () => {
    setSelectedImage(null);
  };


  const getBotReply = (userEmail, userMessage) => {
    if (userEmail === "chafiaaabida@gmail.com") {
      const match = SCRIPT_USER1.find(item => item.user.trim().toLowerCase() === userMessage.trim().toLowerCase())
      return match ? match.bot : "Je ne comprends pas votre question. Veuillez consulter les exemples de dialogue."
    }
    if (userEmail === "elyaakoubimohammed@gmail.com") {
      const match = SCRIPT_USER2.find(item => item.user.trim().toLowerCase() === userMessage.trim().toLowerCase())
      return match ? match.bot : "Je ne comprends pas votre question. Veuillez consulter les exemples de dialogue."
    }
    return "User not authorized."
  }

  // Auto-save conversations to localStorage whenever they change
  useEffect(() => {
    if (user && Object.keys(conversations).length > 0) {
      const storageKey = `conversations_${user.email.replace('@', '_').replace('.', '_')}`
      localStorage.setItem(storageKey, JSON.stringify(conversations))
    }
  }, [conversations, user])

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)

        // Load conversations from localStorage for this user
        const storageKey = `conversations_${parsed.email.replace('@', '_').replace('.', '_')}`
        const savedConversations = localStorage.getItem(storageKey)
        if (savedConversations) {
          setConversations(JSON.parse(savedConversations))
        } else {
          setConversations({})
        }
        setCurrentConversation(null)
      } catch (e) {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))

    // Load conversations for this user
    const storageKey = `conversations_${userData.email.replace('@', '_').replace('.', '_')}`
    const savedConversations = localStorage.getItem(storageKey)
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations))
    } else {
      setConversations({})
    }
    setCurrentConversation(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    setConversations({})
    setCurrentConversation(null)
  }

  const createNewConversation = () => {
    if (!user) return
    const newId = Date.now().toString()
    setConversations(prev => ({
      ...prev,
      [newId]: {
        title: "New conversation",
        messages: []
      }
    }))
    setCurrentConversation(newId)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const switchConversation = (conversationId) => {
    setCurrentConversation(conversationId)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const deleteConversation = (conversationId) => {
    setConversations(prev => {
      const updated = { ...prev }
      delete updated[conversationId]
      return updated
    })
    if (currentConversation === conversationId) {
      setCurrentConversation(null)
    }
  }

  const sendMessage = () => {
    if (!message.trim() && !selectedImage) return
    if (!currentConversation || !user) {
      alert("No conversation selected. Please create a new conversation first.")
      return
    }

    const currentMessages = conversations[currentConversation]?.messages || []
    const userMessage = {
      role: "user",
      content: message,
      ...(selectedImage && { image: URL.createObjectURL(selectedImage) })
    }

    const updatedMessages = [...currentMessages, userMessage]
    const updatedConversations = {
      ...conversations,
      [currentConversation]: {
        ...conversations[currentConversation],
        messages: updatedMessages
      }
    }

    setConversations(updatedConversations)
    setMessage("")
    setThinking(true)
    setEditingMessage(null)

    if (selectedImage) {
      setSelectedImage(null)
      const fileInput = document.getElementById("image-upload")
      if (fileInput) fileInput.value = ""
    }

    // Simulate delay
    setTimeout(() => {
      const botReply = getBotReply(user.email, message)
      const finalMessages = [...updatedMessages, {
        role: "assistant",
        content: botReply
      }]

      // Inside the setTimeout, after bot reply
      setConversations(prev => {
        const conv = prev[currentConversation]
        const messageCount = conv?.messages?.length || 0

        let newTitle = conv?.title || "New Conversation"

        // Set title after bot's 2nd reply (4th message total)
        if (messageCount === 3) {
          if (user.email === "chafiaaabida@gmail.com") {
            newTitle = "LPEE Béton & Matériaux"
          } else if (user.email === "elyaakoubimohammed@gmail.com") {
            newTitle = "Performance Environnement"
          }
        }

        return {
          ...prev,
          [currentConversation]: {
            ...prev[currentConversation],
            messages: finalMessages,
            title: newTitle
          }
        }
      })
      setThinking(false)
    }, 3500)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.activeElement
      if (btn) {
        btn.classList.add("copied")
        btn.innerHTML = "✓"
        setTimeout(() => {
          btn.classList.remove("copied")
          btn.innerHTML = "📋"
        }, 1200)
      }
    }).catch(err => console.error("Failed to copy:", err))
  }

  const handleRightClick = (e, messageIndex) => {
    e.preventDefault()
    if (e.target.closest(".message.user")) {
      setEditingMessage(messageIndex)
      setEditedMessage(conversations[currentConversation].messages[messageIndex].content)
    }
  }

  const handleEditSave = () => {
    if (!editedMessage.trim() || thinking) return
    setThinking(true)

    const updatedMessages = [...conversations[currentConversation].messages]
    updatedMessages[editingMessage] = { role: "user", content: editedMessage }
    updatedMessages.splice(editingMessage + 1)

    setConversations(prev => ({
      ...prev,
      [currentConversation]: {
        ...prev[currentConversation],
        messages: updatedMessages
      }
    }))

    // Simulate bot response
    setTimeout(() => {
      const botReply = getBotReply(user.email, editedMessage)
      const finalMessages = [...updatedMessages, { role: "assistant", content: botReply }]
      setConversations(prev => ({
        ...prev,
        [currentConversation]: {
          ...prev[currentConversation],
          messages: finalMessages
        }
      }))
      setThinking(false)
      setEditingMessage(null)
      setEditedMessage("")
    }, 800)
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
            // Simulate STT response
            const fakeResponses = [
              "Ça va, merci. Est-ce que tu peux me dire un truc intéressant qui n'a rien à voir avec le travail ?",
              "Quels sont les projets les plus suivis récemment ?"
            ]
            const randomResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)]
            setMessage(prev => prev + " " + randomResponse.trim())
          } catch (err) {
            console.error("STT simulation failed:", err)
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
            <pre><code>{code}</code></pre>
            <button className="copy-code-btn" onClick={() => copyToClipboard(code)} title="Copy code">📋</button>
          </div>
        )
      } else if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="inline-code">{part.slice(1, -1)}</code>
      } else {
        return part.split("\n").map((line, lineIndex, array) => (
          <span key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < array.length - 1 && <br />}
          </span>
        ))
      }
    })
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
          <div className="auth-container">
            {showSignUp ? (
              <>
                <SignUpForm onSignUpSuccess={() => setShowSignUp(false)} />
                <div className="auth-switch">
                  Already have an account?{" "}
                  <button onClick={() => setShowSignUp(false)} className="auth-switch-btn">
                    Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
                <LoginForm onLoginSuccess={handleLoginSuccess} />
                <div className="auth-switch">
                  Don't have an account?{" "}
                  <button onClick={() => setShowSignUp(true)} className="auth-switch-btn">
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </div>
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
              <div className="user-email">{user.email === "chafiaaabida@gmail.com" ? "Chafia" : "Elyaakoubi"}</div>
              <button onClick={handleLogout} className="logout-btn">Sign Out</button>
            </div>
          </div>
          <button className="new-conversation-btn" onClick={createNewConversation}>+ New Chat</button>

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
          {!currentConversation || conversations[currentConversation]?.messages?.length === 0 ? (
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
                <button onClick={clearSelectedImage} className="remove-preview-btn">✕</button>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <button className="clear-image-btn" onClick={clearSelectedImage} title="Clear image">✕</button>
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
              onChange={(e) => {
                const file = e.target.files[0]
                if (!file) return
                setSelectedImage(file)
              }}
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