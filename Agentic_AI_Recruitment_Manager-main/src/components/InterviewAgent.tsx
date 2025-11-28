evaluation ?: {
  score: number;
  feedback: string;
};
questionNumber ?: number;
}

interface InterviewSession {
  id: string;
  sessionId: string;
  candidateId: string;
  candidateName: string;
  skills: string[];
  messages: Message[];
  currentQuestion: number;
  totalQuestions: number;
  status: 'active' | 'completed';
  currentScore?: number;
}

export default function InterviewAgent({
  candidates,
  onCandidatesUpdate,
}: InterviewAgentProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleStartInterview = async () => {
    if (!selectedCandidate || !skills.trim()) {
      alert('Please select a candidate and enter skills to test');
      return;
    }

    setIsLoading(true);

    try {
      const candidate = candidates.find(c => c.id === selectedCandidate);
      if (!candidate) return;

      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);

      const response = await fetch(getApiUrl('api/interview/start'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          skills: skillsArray,
          numQuestions: numQuestions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();

      // Fetch full session details
      const sessionResponse = await fetch(getApiUrl(`api/interview/session/${data.sessionId}`));
      const sessionData = await sessionResponse.json();

      setSession(sessionData.session);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !session) return;

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('api/interview/answer'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          answer: currentAnswer
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();

      // Fetch updated session
      const sessionResponse = await fetch(getApiUrl(`api/interview/session/${session.id}`));
      const sessionData = await sessionResponse.json();

      setSession(sessionData.session);
      setCurrentAnswer('');

      // If interview is completed, update the candidate
      if (data.completed && data.finalScore !== undefined) {
        const updatedCandidates = candidates.map(c =>
          c.id === session.candidateId
            ? { ...c, score: data.finalScore, status: 'interviewed' as const }
            : c
        );
        onCandidatesUpdate(updatedCandidates);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!session) return;

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('api/interview/end'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end interview');
      }

      const data = await response.json();

      // Update candidate score
      const updatedCandidates = candidates.map(c =>
        c.id === session.candidateId
          ? { ...c, score: data.finalScore, status: 'interviewed' as const }
          : c
      );
      onCandidatesUpdate(updatedCandidates);

      // Refresh session
      const sessionResponse = await fetch(getApiUrl(`api/interview/session/${session.id}`));
      const sessionData = await sessionResponse.json();
      setSession(sessionData.session);
    } catch (error) {
      console.error('Error ending interview:', error);
      alert('Failed to end interview.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Sparkles className="h-8 w-8 mr-3 text-blue-600" />
          AI Interview Agent
        </h1>
        <p className="mt-2 text-gray-600">Conduct skill-based interviews with AI-powered questions</p>
      </div>

      {!session ? (
        /* Setup Interview */
        <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Start New Interview</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="candidate" className="block text-sm font-medium text-gray-700 mb-2">
                Select Candidate
              </label>
              <select
                id="candidate"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a candidate...</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills to Test (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., React, TypeScript, Node.js"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported: React, JavaScript, TypeScript, Python, Node.js, SQL, and more
              </p>
            </div>

            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                id="numQuestions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleStartInterview}
              disabled={!selectedCandidate || !skills.trim() || isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Interview...
                </div>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interview Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Interview Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Candidate:</span>
                  <p className="font-medium text-gray-900">{session.candidateName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {session.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <p className="font-medium text-gray-900">
                    {session.currentQuestion} / {session.totalQuestions}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(session.currentQuestion / session.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className={`font-medium capitalize ${session.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {session.status}
                  </p>
                </div>
              </div>
            </div>

            {session.status === 'active' && (
              <button
                onClick={handleEndInterview}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Interview
              </button>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 bg-white shadow-sm rounded-lg border border-gray-200 flex flex-col" style={{ height: '600px' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'candidate' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'interviewer' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {message.role === 'interviewer' ? (
                        <Bot className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className={`rounded-lg px-4 py-2 ${message.role === 'interviewer' ? 'bg-gray-100' : 'bg-blue-600 text-white'}`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.evaluation && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <p className={`font-medium ${getScoreColor(message.evaluation.score)}`}>
                            Score: {message.evaluation.score}/10
                          </p>
                          <p className="text-gray-600 mt-1">{message.evaluation.feedback}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {session.status === 'active' && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer here..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            )}

            {session.status === 'completed' && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-center text-gray-600">Interview completed! Thank you for participating.</p>
                <button
                  onClick={() => setSession(null)}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Start New Interview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}