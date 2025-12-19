
import React from 'react';

const CoachingGuide: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
        <i className="fas fa-graduation-cap mr-2"></i>
        코칭 개입 가이드
      </h2>
      
      <div className="space-y-6 text-sm text-gray-700">
        <section className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2 flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            현재 상황 개요
          </h3>
          <p className="text-xs leading-relaxed text-indigo-800">
            <strong>김불만(32세/남)</strong>: 마케팅팀 3년차.<br/>
            사수인 <strong>박 차장</strong>이 퇴근 직전 업무 지시, 불분명한 피드백, 성과 가로채기를 일삼아 매우 분노한 상태입니다.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">1. 코칭 개입이란?</h3>
          <p className="leading-relaxed">
            리더가 조력자로서 당사자 스스로 해결책을 찾도록 돕는 방법입니다. 해답을 주기보다 <strong>질문</strong>을 통해 통찰을 유도하세요.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">2. 핵심 스킬</h3>
          <ul className="list-disc pl-4 space-y-2">
            <li>
              <span className="font-semibold text-indigo-600">중립 언어 사용:</span>
              "왜 그렇게 생각해요?" 보다 "어떤 상황이 있었나요?"처럼 사실 중심 전달.
            </li>
            <li>
              <span className="font-semibold text-indigo-600">깨끗한 언어 사용:</span>
              "제 생각엔~" 같은 조언 대신 상대의 감정과 표현을 그대로 수용.
            </li>
            <li>
              <span className="font-semibold text-indigo-600">표현 바꾸기:</span>
              "짜증난다"는 부정적 언어를 "바라는 점"이나 "성장 지점"으로 전환 유도.
            </li>
            <li>
              <span className="font-semibold text-indigo-600">열린 질문:</span>
              "기분 나쁘죠?" 보다는 "그 상황에서 무엇이 가장 힘들었나요?"
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CoachingGuide;
