import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenerativeAI, ChatSession, Part } from "@google/generative-ai";

// --- Icons (SVG) ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1c-.55 0-1.05-.11-1.5-.31A7.95 7.95 0 0 1 12 24a7.95 7.95 0 0 1-6.5-4.31A3.97 3.97 0 0 1 5 21H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7v-1.27c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"/><path d="M9 11h.01"/><path d="M15 11h.01"/></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text?: string;
  audioUrl?: string; // If the message contains audio
  imageUrl?: string; // If the message contains an image
}

interface FileData {
  name: string;
  type: string;
  data: string; // base64 without prefix
  url: string; // for iframe/img
}

// --- App Component ---
const App = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [file, setFile] = useState<FileData | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Attachments in Chat
  const [chatAttachment, setChatAttachment] = useState<FileData | null>(null);
  
  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const landingFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, hasStarted]);

  useEffect(() => {
    console.log("AI Chat Assistant initialized.");
  }, []);

  // Helper: Read file as Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Initialize Chat with Gemini (supports optional docFile)
  const initializeChat = async (docFile: FileData | null): Promise<ChatSession | null> => {
    try {
      // Use the API key from environment variables
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API key is missing. Please check your environment variables.');
        return null;
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      let history: any[] = [];

      if (docFile) {
        history = [
          {
            role: 'user',
            parts: [
              { 
                inlineData: { 
                  mimeType: docFile.type, 
                  data: docFile.data 
                } 
              },
              { text: "Analyze this document/image and prepare to answer questions about it." }
            ]
          },
          {
            role: 'model',
            parts: [{ text: `I have analyzed "${docFile.name}". I am ready to answer your questions.` }]
          }
        ];
      }

      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.2,
        },
      });

      setChatSession(chat);
      return chat;
    } catch (err) {
      console.error(err);
      setError('Failed to initialize AI session. Please check your API key.');
      return null;
    }
  };

  // Shared: Process Stream Response
  const processStreamResponse = async (result: any) => {
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      try {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            fullResponse += chunkText;
            setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].text = fullResponse;
              return newMsgs;
            });
          }
        }
      } catch (err) {
        console.error("Error processing stream:", err);
        setMessages(prev => [...prev, { role: 'model', text: "Error processing response." }]);
      }
      setIsSending(false);
  };

  // --- Landing Page Handlers ---

  const handleLandingFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic'];
    if (!validTypes.includes(uploadedFile.type)) {
      setError('Please upload a valid PDF or Image file.');
      return;
    }

    try {
      const base64 = await readFileAsBase64(uploadedFile);
      const base64Data = base64.split(',')[1];
      const newFile = {
        name: uploadedFile.name,
        type: uploadedFile.type,
        data: base64Data,
        url: base64
      };

      setFile(newFile);
      setHasStarted(true);
      
      const chat = await initializeChat(newFile);
      if (chat) {
        setMessages([{ role: 'model', text: `I've analyzed **${newFile.name}**. Ask me anything about it!` }]);
      }
    } catch (err) {
      setError('Failed to read file.');
    }
  };

  const handleLandingTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setIsSending(true);
    setHasStarted(true);
    
    // Start fresh chat without file context
    const chat = await initializeChat(null);
    const textToSend = inputText;
    setInputText(''); // Clear input for the chat view

    setMessages([{ role: 'user', text: textToSend }]);
    
    if (chat) {
      try {
        const result = await chat.sendMessageStream([textToSend]);
        await processStreamResponse(result);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
        setIsSending(false);
      }
    }
  };

  // --- Voice Handlers (Shared) ---
  
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          if (!hasStarted) {
             // Landing Page Recording
             setHasStarted(true);
             const chat = await initializeChat(null);
             await handleSendAudio(base64Audio, chat);
          } else {
             // Chat Page Recording
             await handleSendAudio(base64Audio, chatSession);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Microphone access denied. Please allow permissions in your browser.");
      } else {
        setError(`Microphone error: ${err.message || 'Unknown error'}`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (base64Audio: string, chat: ChatSession | null) => {
    if (!chat) return;
    
    const audioData = base64Audio.split(',')[1];
    const mimeType = 'audio/webm';

    setMessages(prev => [...prev, { role: 'user', audioUrl: base64Audio, text: "🎤 Voice Message" }]);
    setIsSending(true);

    try {
      const result = await chat.sendMessageStream([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioData
          }
        },
        "Please listen to this audio and respond to the user's request."
      ]);
      await processStreamResponse(result);
    } catch (err) {
      console.error("Error processing voice input:", err);
      setMessages(prev => [...prev, { role: 'model', text: "Error processing voice input." }]);
      setIsSending(false);
    }
  };

  // --- Chat Page Message Handler ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !chatAttachment) || !chatSession || isSending) return;

    const userText = inputText.trim();
    const currentAttachment = chatAttachment;

    setInputText('');
    setChatAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);

    setMessages(prev => [
      ...prev, 
      { 
        role: 'user', 
        text: userText, 
        imageUrl: currentAttachment?.url 
      }
    ]);
    setIsSending(true);

    try {
      let messageParts: (string | Part)[] = [];
      
      if (currentAttachment) {
        messageParts.push({
          inlineData: {
            mimeType: currentAttachment.type,
            data: currentAttachment.data
          }
        });
      }
      
      if (userText) {
        messageParts.push(userText);
      } else if (currentAttachment) {
         messageParts.push("Describe this image.");
      }

      const result = await chatSession.sendMessageStream(messageParts);
      await processStreamResponse(result);

    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not generate response." }]);
      setIsSending(false);
    }
  };

  const handleChatAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await readFileAsBase64(file);
      setChatAttachment({
        name: file.name,
        type: file.type,
        data: base64.split(',')[1],
        url: base64
      });
      setError(null);
    } catch (err) {
      setError("Failed to attach file.");
    }
  };

  const resetSession = () => {
    setFile(null);
    setChatSession(null);
    setMessages([]);
    setError(null);
    setChatAttachment(null);
    setIsRecording(false);
    setHasStarted(false);
    setInputText('');
  };

  // --- Render: Landing Page ---
  if (!hasStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" 
           style={{ 
             background: 'linear-gradient(135deg, var(--cosmic-bg-dark) 0%, var(--cosmic-bg-medium) 100%)',
             fontFamily: 'var(--font-family)'
           }}>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse glow" 
               style={{ 
                 background: 'radial-gradient(circle, var(--cosmic-accent-primary) 0%, transparent 70%)',
                 animationDelay: '0s'
               }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse glow" 
               style={{ 
                 background: 'radial-gradient(circle, var(--cosmic-accent-secondary) 0%, transparent 70%)',
                 animationDelay: '1s'
               }}></div>
          <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse glow" 
               style={{ 
                 background: 'radial-gradient(circle, #ff6b6b 0%, transparent 70%)',
                 animationDelay: '2s'
               }}></div>
        </div>

        <div className="max-w-4xl w-full z-10 flex flex-col items-center">
          
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 glow-strong"
                 style={{ 
                   background: 'linear-gradient(135deg, var(--cosmic-accent-primary) 0%, var(--cosmic-accent-secondary) 100%)',
                   boxShadow: '0 0 30px rgba(106, 90, 249, 0.4)'
                 }}>
              <SparkleIcon />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-center tracking-tight mb-4" 
                style={{ 
                  color: 'var(--cosmic-text-primary)',
                  textShadow: '0 0 20px rgba(106, 90, 249, 0.5)'
                }}>
              AI Chat Assistant
            </h1>
            <p className="text-xl text-center max-w-2xl" style={{ color: 'var(--cosmic-text-secondary)' }}>
              Experience the future of AI-powered conversations with document analysis and voice capabilities
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
            <div className="p-6 rounded-2xl border glow" 
                 style={{ 
                   backgroundColor: 'rgba(26, 26, 58, 0.5)',
                   borderColor: 'var(--cosmic-border)',
                   backdropFilter: 'blur(10px)'
                 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                   style={{ 
                     backgroundColor: 'rgba(106, 90, 249, 0.2)',
                     color: 'var(--cosmic-accent-primary)'
                   }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--cosmic-text-primary)' }}>Document Analysis</h3>
              <p style={{ color: 'var(--cosmic-text-secondary)' }}>Upload PDFs and images for AI-powered analysis and insights</p>
            </div>
            
            <div className="p-6 rounded-2xl border glow" 
                 style={{ 
                   backgroundColor: 'rgba(26, 26, 58, 0.5)',
                   borderColor: 'var(--cosmic-border)',
                   backdropFilter: 'blur(10px)'
                 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                   style={{ 
                     backgroundColor: 'rgba(214, 110, 253, 0.2)',
                     color: 'var(--cosmic-accent-secondary)'
                   }}>
                <MicIcon />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--cosmic-text-primary)' }}>Voice Interaction</h3>
              <p style={{ color: 'var(--cosmic-text-secondary)' }}>Speak naturally with our advanced voice recognition system</p>
            </div>
            
            <div className="p-6 rounded-2xl border glow" 
                 style={{ 
                   backgroundColor: 'rgba(26, 26, 58, 0.5)',
                   borderColor: 'var(--cosmic-border)',
                   backdropFilter: 'blur(10px)'
                 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                   style={{ 
                     backgroundColor: 'rgba(255, 107, 107, 0.2)',
                     color: '#ff6b6b'
                   }}>
                <BotIcon />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--cosmic-text-primary)' }}>Smart Responses</h3>
              <p style={{ color: 'var(--cosmic-text-secondary)' }}>Get intelligent answers powered by Google's Gemini AI</p>
            </div>
          </div>
          
          {/* Main Input Section */}
          <div className="w-full max-w-2xl relative group mb-8">
             <div className="absolute -inset-0.5 rounded-2xl opacity-70 glow-strong"></div>
             <form onSubmit={handleLandingTextSubmit} className="relative rounded-2xl flex flex-col md:flex-row items-center p-2 border" 
                   style={{ 
                     backgroundColor: 'var(--cosmic-bg-light)', 
                     borderColor: 'var(--cosmic-border)',
                     boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                   }}>
                
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isRecording ? "Listening..." : "Ask me anything..."}
                  className="flex-1 bg-transparent placeholder-slate-500 px-4 py-4 focus:outline-none text-lg w-full"
                  style={{ color: 'var(--cosmic-text-primary)' }}
                  disabled={isRecording}
                />
                
                <div className="flex items-center gap-2 p-2">
                   <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className="p-3 rounded-xl transition-all transform hover:scale-105"
                    style={{ 
                      backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                      color: isRecording ? '#ff4444' : 'var(--cosmic-text-secondary)',
                      border: isRecording ? '1px solid #ff4444' : '1px solid var(--cosmic-border)'
                    }}
                    title="Voice Input"
                   >
                     {isRecording ? <StopIcon /> : <MicIcon />}
                   </button>
                   
                   <button 
                     type="submit" 
                     className="p-3 rounded-xl transition-all transform hover:scale-105 glow"
                     style={{ 
                       backgroundColor: 'var(--cosmic-accent-primary)',
                       color: 'white'
                     }}
                     disabled={!inputText.trim() && !isRecording}
                   >
                     <SendIcon />
                   </button>
                </div>
             </form>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="relative w-full">
              <input 
                 type="file" 
                 className="hidden" 
                 ref={landingFileInputRef}
                 accept="application/pdf,image/*"
                 onChange={handleLandingFileUpload}
              />
              <button 
                onClick={() => landingFileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl transition-all transform hover:scale-[1.02] glow border"
                style={{ 
                  background: 'linear-gradient(135deg, var(--cosmic-bg-light) 0%, var(--cosmic-bg-medium) 100%)',
                  color: 'var(--cosmic-text-secondary)',
                  border: '1px solid var(--cosmic-border)',
                  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <UploadIcon />
                <span className="text-lg font-medium">Upload Document or Image</span>
              </button>
            </div>
            
            <p className="text-center" style={{ color: 'var(--cosmic-text-secondary)' }}>
              Supported formats: PDF, PNG, JPG, WEBP, HEIC
            </p>
          </div>

          {error && (
            <div className="mt-8 p-4 rounded-2xl flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-bottom-2"
                 style={{ 
                   backgroundColor: 'rgba(255, 0, 0, 0.1)',
                   border: '1px solid rgba(255, 0, 0, 0.3)',
                   color: '#ff8888'
                 }}>
              <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(255, 0, 0, 0.2)' }}><XIcon /></div>
              <span className="text-sm">{error}</span>
            </div>
          )}

        </div>
        
        <div className="absolute bottom-6 text-sm flex items-center gap-2" style={{ color: 'var(--cosmic-text-secondary)' }}>
          <span>Powered by</span>
          <span className="font-semibold" style={{ color: 'var(--cosmic-accent-primary)' }}>Gemini 2.5 Flash</span>
          <span>&</span>
          <span className="font-semibold" style={{ color: 'var(--cosmic-accent-secondary)' }}>Supabase</span>
        </div>
      </div>
    );
  }

  // --- Render: Main Chat Interface ---
  return (
    <div className="flex h-screen overflow-hidden" 
         style={{ 
           background: 'linear-gradient(135deg, var(--cosmic-bg-dark) 0%, var(--cosmic-bg-medium) 100%)',
           fontFamily: 'var(--font-family)'
         }}>
      
      {/* Left Panel: File Viewer (Only if file exists) */}
      {file && (
        <div className="hidden lg:flex flex-col border-r" 
             style={{ width: '50%', backgroundColor: 'var(--cosmic-bg-light)', borderColor: 'var(--cosmic-border)' }}>
          <div className="h-16 border-b flex items-center px-6 justify-between" 
               style={{ borderColor: 'var(--cosmic-border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" 
                   style={{ backgroundColor: 'rgba(106, 90, 249, 0.1)', color: 'var(--cosmic-accent-primary)' }}>
                <FileIcon />
              </div>
              <span className="font-medium truncate max-w-[300px]" title={file.name} 
                    style={{ color: 'var(--cosmic-text-primary)' }}>
                {file.name}
              </span>
            </div>
            {/* Close File button triggers reset, which goes back to landing page */}
            <button 
              onClick={resetSession}
              className="p-2 rounded-lg transition-colors transform hover:scale-110"
              style={{ color: 'var(--cosmic-text-secondary)' }}
              title="Close File"
            >
              <TrashIcon />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center overflow-hidden" 
               style={{ backgroundColor: 'var(--cosmic-bg-medium)' }}>
            {file.type === 'application/pdf' ? (
              <object data={file.url} type="application/pdf" className="w-full h-full">
                <div className="p-4 text-center" style={{ color: 'var(--cosmic-text-secondary)' }}>
                   Cannot display PDF. <a href={file.url} download className="underline" 
                                          style={{ color: 'var(--cosmic-accent-primary)' }}>Download</a>
                </div>
              </object>
            ) : (
               <img src={file.url} alt="Uploaded content" className="max-w-full max-h-full object-contain p-4" />
            )}
          </div>
        </div>
      )}

      {/* Right Panel: Chat Interface */}
      <div className={`flex flex-col h-full relative transition-all duration-300`}
           style={{ 
             width: '100%',
             backgroundColor: 'var(--cosmic-bg-dark)',
             ...(file && window.innerWidth >= 1024 ? { width: '50%' } : {})
           }}>
        
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-6" 
             style={{ 
               backgroundColor: 'rgba(26, 26, 58, 0.7)',
               borderColor: 'var(--cosmic-border)',
               backdropFilter: 'blur(10px)'
             }}>
           <div className="flex items-center gap-3">
              <button onClick={resetSession} className="lg:hidden transform hover:scale-110" 
                      style={{ color: 'var(--cosmic-text-secondary)' }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="font-semibold flex items-center gap-2 text-lg" 
                    style={{ color: 'var(--cosmic-text-primary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: 'var(--cosmic-accent-primary)' }}>
                  <SparkleIcon />
                </div>
                AI Assistant
              </span>
           </div>
           
           {/* If no file is open, show an "Exit" or "New Chat" button to go back to landing */}
           {!file && (
             <button onClick={resetSession} 
                     className="text-sm font-medium px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                     style={{ 
                       background: 'linear-gradient(135deg, var(--cosmic-accent-primary) 0%, var(--cosmic-accent-secondary) 100%)',
                       color: 'white'
                     }}>
               New Chat
             </button>
           )}
        </div>

        {/* Error Toast */}
        {error && (
            <div className="absolute top-20 left-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between backdrop-blur-sm animate-in fade-in slide-in-from-top-2 max-w-2xl mx-auto glow"
                 style={{ 
                   backgroundColor: 'rgba(255, 0, 0, 0.9)',
                   color: 'white'
                 }}>
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-3 p-1 rounded-lg transition-colors"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <XIcon />
              </button>
            </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" 
             style={{ backgroundColor: 'var(--cosmic-bg-dark)' }}>
          {/* Centered welcome message if empty history in chat mode (rare but possible) */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
               <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ 
                      backgroundColor: 'rgba(106, 90, 249, 0.1)',
                      color: 'var(--cosmic-text-secondary)'
                    }}>
                 <BotIcon />
               </div>
               <p className="text-xl" style={{ color: 'var(--cosmic-text-secondary)' }}>Start the conversation...</p>
               <p className="mt-2 text-center max-w-md" style={{ color: 'var(--cosmic-text-secondary)' }}>
                 Ask a question, upload a document, or use voice input to begin
               </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-4xl mx-auto w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'model' && (
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white glow" 
                     style={{ backgroundColor: 'var(--cosmic-accent-primary)' }}>
                  <BotIcon />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="User attachment" className="mb-2 max-w-full h-auto rounded-2xl border max-h-80" 
                       style={{ borderColor: 'var(--cosmic-border)' }} />
                )}

                {msg.audioUrl && (
                  <div className="mb-2">
                     <audio controls src={msg.audioUrl} className="h-12 w-72 rounded-lg" 
                            style={{ backgroundColor: 'var(--cosmic-bg-light)' }} />
                  </div>
                )}
                
                {msg.text && (
                  <div 
                    className={`rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${
                      msg.role === 'user' 
                        ? 'rounded-tr-sm' 
                        : 'rounded-tl-sm'
                    }`}
                    style={{ 
                      backgroundColor: msg.role === 'user' ? 'var(--cosmic-accent-primary)' : 'var(--cosmic-bg-light)',
                      color: msg.role === 'user' ? 'white' : 'var(--cosmic-text-primary)',
                      border: msg.role === 'model' ? `1px solid ${'var(--cosmic-border)'}` : 'none',
                      boxShadow: msg.role === 'user' ? '0 5px 15px rgba(106, 90, 249, 0.3)' : '0 5px 15px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {msg.text}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--cosmic-bg-medium)', color: 'var(--cosmic-text-secondary)' }}>
                  <UserIcon />
                </div>
              )}
            </div>
          ))}
          
          {isSending && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4 max-w-4xl mx-auto w-full">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white animate-pulse glow"
                   style={{ backgroundColor: 'var(--cosmic-accent-primary)' }}>
                <BotIcon />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-sm flex gap-2 items-center" 
                   style={{ 
                     backgroundColor: 'var(--cosmic-bg-light)',
                     border: `1px solid ${'var(--cosmic-border)'}`
                   }}>
                 <div className="w-3 h-3 rounded-full animate-bounce" 
                      style={{ backgroundColor: 'var(--cosmic-text-secondary)', animationDelay: '0s' }} />
                 <div className="w-3 h-3 rounded-full animate-bounce" 
                      style={{ backgroundColor: 'var(--cosmic-text-secondary)', animationDelay: '0.2s' }} />
                 <div className="w-3 h-3 rounded-full animate-bounce" 
                      style={{ backgroundColor: 'var(--cosmic-text-secondary)', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t" 
             style={{ 
               backgroundColor: 'rgba(26, 26, 58, 0.7)',
               borderColor: 'var(--cosmic-border)',
               backdropFilter: 'blur(10px)'
             }}>
          <div className="max-w-3xl mx-auto">
            {/* Attachment Preview */}
            {chatAttachment && (
               <div className="flex items-center gap-2 mb-3 p-3 rounded-xl w-fit border animate-in fade-in slide-in-from-bottom-2" 
                    style={{ 
                      backgroundColor: 'var(--cosmic-bg-medium)',
                      borderColor: 'var(--cosmic-border)'
                    }}>
                  <img src={chatAttachment.url} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-sm max-w-[180px] truncate" 
                        style={{ color: 'var(--cosmic-text-secondary)' }}>{chatAttachment.name}</span>
                  <button 
                    onClick={() => { setChatAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="ml-2 transform hover:scale-110"
                    style={{ color: 'var(--cosmic-text-secondary)' }}
                  >
                    <XIcon />
                  </button>
               </div>
            )}

            <div className="relative flex items-end gap-3">
              
              {/* Image Upload Button */}
              <div className="relative">
                <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef}
                   onChange={handleChatAttachment}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isRecording}
                  className="p-3 rounded-xl border transition-all transform hover:scale-110"
                  style={{ 
                    backgroundColor: 'var(--cosmic-bg-medium)',
                    color: 'var(--cosmic-text-secondary)',
                    borderColor: 'var(--cosmic-border)'
                  }}
                  title="Attach Image"
                >
                  <ImageIcon />
                </button>
              </div>

              {/* Mic / Text Input */}
              <form onSubmit={handleSendMessage} className="flex-1 relative">
                 <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isRecording ? "Listening..." : "Message AI Assistant..."}
                  className="w-full rounded-2xl pl-5 pr-14 py-4 focus:outline-none transition-all text-base"
                  style={{ 
                    backgroundColor: 'var(--cosmic-bg-medium)',
                    color: 'var(--cosmic-text-primary)',
                    border: `1px solid ${isRecording ? 'var(--cosmic-accent-primary)' : 'var(--cosmic-border)'}`
                  }}
                  disabled={isSending || isRecording}
                />
                
                <button 
                  type="submit"
                  disabled={(!inputText.trim() && !chatAttachment) || isSending || isRecording}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all transform hover:scale-110"
                  style={{ 
                    backgroundColor: 'var(--cosmic-accent-primary)',
                    color: 'white'
                  }}
                >
                  <SendIcon />
                </button>
              </form>

              {/* Voice Record Button */}
              <button
                 type="button"
                 onClick={isRecording ? stopRecording : startRecording}
                 disabled={isSending}
                 className="p-3 rounded-xl border transition-all transform hover:scale-110"
                 style={{ 
                   backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.1)' : 'var(--cosmic-bg-medium)',
                   color: isRecording ? '#ff4444' : 'var(--cosmic-text-secondary)',
                   borderColor: isRecording ? '#ff4444' : 'var(--cosmic-border)'
                 }}
                 title={isRecording ? "Stop Recording" : "Start Voice Input"}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </button>

            </div>
            
            <div className="text-center mt-3">
              <p className="text-xs" style={{ color: 'var(--cosmic-text-secondary)' }}>
                Powered by Gemini 2.5 Flash • Secure and Private
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);