import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaYoutube, FaCog } from 'react-icons/fa'
import './App.css'
import VideoInput from './components/VideoInput'
import Settings from './components/Settings'
import Summary from './components/Summary'

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [apiKey, setApiKey] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [error, setError] = useState(null)

  // Function to validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  }

  const handleSubmit = async () => {
    if (!apiKey) {
      setError('Please add your OpenAI API key in settings')
      setIsSettingsOpen(true)
      return
    }
    
    if (!isValidYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube URL')
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('Making request to:', API_URL); // Debug log
      
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          video_url: videoUrl,
          api_key: apiKey
        })
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData); // Debug log
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>YouTube Video Summarizer</h1>
        <button 
          className="settings-button"
          onClick={() => setIsSettingsOpen(true)}
        >
          <FaCog />
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="content-container"
      >
        <VideoInput 
          videoUrl={videoUrl} 
          setVideoUrl={setVideoUrl} 
          icon={<FaYoutube />} 
        />
        <motion.button 
          onClick={handleSubmit}
          disabled={isLoading || !isValidYouTubeUrl(videoUrl)}
          whileHover={isValidYouTubeUrl(videoUrl) ? { scale: 1.02 } : {}}
          whileTap={isValidYouTubeUrl(videoUrl) ? { scale: 0.98 } : {}}
          className={`submit-button ${isValidYouTubeUrl(videoUrl) ? 'active' : ''}`}
        >
          {isLoading ? (
            <div className="loading-dots">
              Generating Summary<span></span><span></span><span></span>
            </div>
          ) : (
            'Get Summary'
          )}
        </motion.button>
        <AnimatePresence>
          {summary && <Summary summary={summary} />}
        </AnimatePresence>
      </motion.div>

      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  )
}

export default App 