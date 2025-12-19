
import React, { useMemo, useState } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultSummaryProps {
  messages: ChatMessage[];
  onRestart: () => void;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ messages, onRestart }) => {
  const [expandedTurn, setExpandedTurn] = useState<number | null>(null);

  const turnAnalysis = useMemo(() => {
    const results: { userText: string; evaluation: any }[] = [];
    messages.forEach((msg, index) => {
      if (msg.sender === MessageSender.USER) {
        const nextMsg = messages[index + 1];
        if (nextMsg && nextMsg.evaluation) {
          results.push({
            userText: msg.text,
            evaluation: nextMsg.evaluation
          });
        }
      }
    });
    return results;
  }, [messages]);

  const scores = useMemo(() => {
    const evaluations = turnAnalysis.map(t => t.evaluation);
    if (evaluations.length === 0) return { totalAvg: 0, avgData: [] };
    
    const sums = evaluations.reduce((acc, curr) => ({
      openQuestions: acc.openQuestions + curr.openQuestions,
      neutralLanguage: acc.neutralLanguage + curr.neutralLanguage,
      cleanLanguage: acc.cleanLanguage + curr.cleanLanguage,
      reframing: acc.reframing + curr.reframing,
    }), { openQuestions: 0, neutralLanguage: 0, cleanLanguage: 0, reframing: 0 });

    const count = evaluations.length;
    
    const avgData = [
      { name: '열린 질문', value: Math.round(sums.openQuestions / count) },
      { name: '중립 언어', value: Math.round(sums.neutralLanguage / count) },
      { name: '깨끗한 언어', value: Math.round(sums.cleanLanguage / count) },
      { name: '표현 바꾸기', value: Math.round(sums.reframing / count) },
    ];

    const totalAvg = Math.round(avgData.reduce((acc, curr) => acc + curr.value, 0) / 4);
    
    return { totalAvg, avgData };
  }, [turnAnalysis]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
  const rank = useMemo(() => {
    const s = scores.totalAvg;
    if (s >= 95) return { title: '🏆 레전드 코치', color: 'text-indigo-600', bg: 'bg-indigo-50', desc: '불가능해 보였던 김불만의 마음을 완전히 돌려놓으셨습니다! 전문가 수준의 완벽한 코칭이었습니다.' };
    if (s >= 85) return { title: '🎖️ 마스터 코치', color: 'text-blue-600', bg: 'bg-blue-50', desc: '코칭 기술을 아주 능숙하게 다루시네요. 상대의 성찰을 이끌어내는 능력이 탁월하십니다.' };
    if (s >= 70) return { title: '👍 프로 코치', color: 'text-green-600', bg: 'bg-green-50', desc: '훌륭합니다! 다만 가끔씩 섞여 나오는 본인의 주관적인 판단을 조금만 더 줄여보세요.' };
    if (s >= 50) return { title: '🌱 예비 코치', color: 'text-amber-600', bg: 'bg-amber-50', desc: '상대의 말을 들어주려는 노력은 좋으나, 아직은 질문보다 해결책 제시에 더 익숙하신 것 같습니다.' };
    return { title: '⚠️ 조언가 타입', color: 'text-rose-600', bg: 'bg-rose-50', desc: '상대방은 당신의 조언을 간섭으로 느꼈을 가능성이 큽니다. 더 많은 열린 질문을 던져보시길 권장합니다.' };
  }, [scores.totalAvg]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen pb-20 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-black mb-2">코칭 분석 리포트</h1>
          <p className="opacity-80">당신의 대화는 김불만님에게 어떤 영향을 주었을까요?</p>
        </div>

        <div className="p-6 md:p-10 space-y-12">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className={`flex flex-col items-center justify-center ${rank.bg} rounded-3xl p-10 border border-opacity-30`}>
              <span className={`text-sm font-bold ${rank.color} uppercase tracking-widest mb-2`}>최종 코칭 역량 점수</span>
              <div className={`text-8xl font-black ${rank.color} mb-4 tracking-tighter`}>{scores.totalAvg}<span className="text-3xl ml-1">점</span></div>
              <div className={`px-6 py-2 bg-white rounded-full ${rank.color} font-black shadow-lg text-xl mb-4`}>
                {rank.title}
              </div>
              <p className="text-center text-gray-600 text-sm leading-relaxed max-w-xs">{rank.desc}</p>
            </div>

            <div className="h-72 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 mb-6 text-center uppercase tracking-widest">분야별 정밀 진단 결과</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores.avgData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#9ca3af'}} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.03)'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                    {scores.avgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <i className="fas fa-search-plus mr-3 text-indigo-500"></i>
              턴별 냉정한 피드백 요약
            </h3>
            <div className="space-y-4">
              {turnAnalysis.map((turn, i) => (
                <div key={i} className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-all bg-white shadow-sm">
                  <button 
                    onClick={() => setExpandedTurn(expandedTurn === i ? null : i)}
                    className="w-full text-left p-6 flex items-center justify-between focus:outline-none"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <p className="font-semibold text-gray-800 line-clamp-1 italic">"{turn.userText}"</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase">
                        마음 열림도: {turn.evaluation.willingnessToChange}%
                      </span>
                      <i className={`fas fa-chevron-down text-gray-300 transition-transform ${expandedTurn === i ? 'rotate-180' : ''}`}></i>
                    </div>
                  </button>
                  
                  {expandedTurn === i && (
                    <div className="p-6 bg-indigo-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-indigo-900 flex items-center">
                            <i className="fas fa-microscope mr-2"></i> 점수 분석 근거 (피드백)
                          </h4>
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {turn.evaluation.analysis}
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-2 border-gray-50">
                               <div className="text-[10px] text-gray-400 font-bold">열린질문: {turn.evaluation.openQuestions}</div>
                               <div className="text-[10px] text-gray-400 font-bold">중립언어: {turn.evaluation.neutralLanguage}</div>
                               <div className="text-[10px] text-gray-400 font-bold">깨끗한언어: {turn.evaluation.cleanLanguage}</div>
                               <div className="text-[10px] text-gray-400 font-bold">표현바꾸기: {turn.evaluation.reframing}</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-green-700 flex items-center">
                            <i className="fas fa-magic mr-2"></i> 추천하는 더 나은 코칭 대안
                          </h4>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200 relative">
                             <div className="absolute top-2 right-4 text-green-300 opacity-30 text-3xl font-serif font-black">“</div>
                             <p className="text-sm text-green-800 font-bold leading-relaxed italic whitespace-pre-wrap">
                               {turn.evaluation.alternative}
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center pt-10">
             <button
              onClick={onRestart}
              className="px-20 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-indigo-200 active:scale-95 text-xl"
            >
              처음부터 다시 연습하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSummary;
