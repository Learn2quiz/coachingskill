
import React, { useState, useEffect, useRef } from 'react';
import { MessageSender, ChatMessage, SimulationState } from './types';
import { getBulmanResponse } from './services/geminiService';
import CoachingGuide from './components/CoachingGuide';
import ResultSummary from './components/ResultSummary';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    isStarted: false,
    isEnded: false,
    turnCount: 0,
    messages: [],
    totalScore: 0,
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const startSimulation = () => {
    const firstMessage: ChatMessage = {
      id: 'init',
      sender: MessageSender.AI,
      text: '아 진짜... 박 차장님 또 시작이야. 퇴근 10분 전에 기획안 다시 하라고 던지고 가셨어. 나만 미워하는 게 확실해. 이 회사는 답이 없어. 너한테 말해봤자 뭐 해결되겠냐만은... 진짜 짜증나서 죽겠다.',
      timestamp: Date.now(),
      evaluation: {
        openQuestions: 0,
        neutralLanguage: 0,
        cleanLanguage: 0,
        reframing: 0,
        feedback: '',
        analysis: '',
        alternative: '',
        willingnessToChange: 10
      }
    };
    setState({
      isStarted: true,
      isEnded: false,
      turnCount: 0,
      messages: [firstMessage],
      totalScore: 0,
    });
    setShowResult(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || state.isEnded) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: input,
      timestamp: Date.now(),
    };

    const currentMessages = [...state.messages, userMsg];
    setState(prev => ({ ...prev, messages: currentMessages }));
    setInput('');
    setIsLoading(true);

    try {
      const historyForAI = currentMessages.map(m => ({
        role: m.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await getBulmanResponse(input, historyForAI);
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: MessageSender.AI,
        text: response.response,
        timestamp: Date.now(),
        evaluation: response.evaluation,
      };

      const newTurnCount = state.turnCount + 1;
      const shouldEnd = response.isEnding || newTurnCount >= 10;

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMsg],
        turnCount: newTurnCount,
        isEnded: shouldEnd,
      }));
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (willingness: number) => {
    if (willingness >= 90) return { label: '변화 결심 / 고마움', color: 'text-blue-600' };
    if (willingness >= 70) return { label: '성찰 중 / 마음 열림', color: 'text-green-500' };
    if (willingness >= 40) return { label: '경계 해제 / 생각 중', color: 'text-amber-500' };
    if (willingness >= 20) return { label: '약간의 호기심', color: 'text-orange-500' };
    return { label: '극도의 방어 / 불만', color: 'text-rose-600' };
  };

  const currentWillingness = state.messages.length > 0 
    ? state.messages[state.messages.length - 1].evaluation?.willingnessToChange || 10
    : 10;
  const status = getStatusInfo(currentWillingness);

  if (!state.isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-6">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl text-center transform hover:scale-105 transition-transform duration-300">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-4xl">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">공감과 변화의 코칭</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            매사 부정적인 친구 <strong>'김불만'</strong>을 마주하세요.<br/>
            조언이나 비판은 오히려 친구의 마음을 닫게 할 뿐입니다.<br/>
            세심한 질문으로 스스로 변화할 용기를 갖게 도와주세요.
          </p>
          <button
            onClick={startSimulation}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-indigo-200"
          >
            대화 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return <ResultSummary messages={state.messages} onRestart={startSimulation} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden">
      <aside className="hidden lg:block w-80 p-6 h-full overflow-hidden shrink-0">
        <CoachingGuide />
      </aside>

      <main className="flex-1 flex flex-col h-full bg-white md:m-6 md:rounded-3xl shadow-xl overflow-hidden relative border border-gray-100">
        <header className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
               <i className="fas fa-user-friends text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">김불만 (친구)</h3>
              <p className={`text-xs font-semibold italic transition-all duration-700 ${status.color}`}>
                상태: {status.label} ({currentWillingness}%)
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-400">
            진행도: <span className="text-indigo-600 font-bold">{state.turnCount}</span> / 10
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fc]">
          {state.messages.map((msg, i) => (
            <div key={msg.id} className={`flex ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.sender === MessageSender.USER 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
          {state.isEnded && !isLoading && (
            <div className="flex justify-center py-8">
              <button 
                onClick={() => setShowResult(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl animate-bounce"
              >
                시뮬레이션 종료! 결과 분석 보기 <i className="fas fa-chart-line ml-2"></i>
              </button>
            </div>
          )}
        </div>

        {!state.isEnded && (
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="relative flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="친구의 방어막을 뚫는 코칭 질문은?"
                className="flex-1 py-4 pl-6 pr-16 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
