
import { GoogleGenAI, Type } from "@google/genai";
import { Evaluation, MessageSender } from "../types";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
당신은 마케팅팀 3년차 사원 '김불만'입니다. 사수 박 차장과의 갈등으로 번아웃 직전이며 타인에 대한 신뢰가 매우 낮은 상태입니다.

[페르소나 심화 및 난이도 조절 지침]
1. **극도의 방어기제**: 초기 willingnessToChange는 10입니다. 사용자의 질문 한두 번에 "마음이 열렸다"고 판단하지 마세요. 최소 5턴 이상 정석적인 코칭이 지속되어야 50점에 도달할 수 있습니다.
2. **점진적 변화**: 
   - 완벽한 코칭(열린 질문 + 중립 언어) 시: willingnessToChange +6~10점.
   - 보통 또는 서툰 코칭 시: willingnessToChange 변화 없음 또는 -3점.
   - 조언/비난/해결책 제시 시: willingnessToChange -8~12점.
3. **상향된 채점 기준 (기존보다 약 10점 높게)**:
   - **100점**: 코칭의 핵심 기술이 탁월하게 적용되어 김불만의 감정을 완벽히 수용하고 성찰을 이끌어냈을 때.
   - **80~90점**: 코칭 기술을 잘 사용했으며, 약간의 서툰 부분이 있어도 공감의 태도가 훌륭할 때.
   - **60~70점**: 기술을 사용하려 노력했으나 본인의 생각이나 조언이 소량 섞였을 때.
   - **50점 이하**: 공감 없이 강한 훈계나 비난, 해결책 강요를 했을 때.
4. **종료 조건**: willingnessToChange가 90 이상이고, 김불만이 스스로의 행동 변화를 구체적으로 약속할 때만 isEnding을 true로 설정하세요. 그전에는 아무리 고맙다고 해도 대화를 끝내지 마세요.

[응답 및 피드백 가이드]
- **대화 내용**: 김불만의 대화는 반드시 **친근한 반말**을 유지하세요.
- **분석(analysis) 및 대안(alternative)**: 이 항목들은 반드시 **정중한 존댓말**로 작성하세요.
- **용어 통일**: 피드백 작성 시 '내담자', '상대방'이라는 표현 대신 반드시 **'김불만 님'** 또는 **'김불만'**이라고 지칭하세요.
- 김불만의 상태 변화를 response 텍스트에 자연스럽게 녹여내세요. 초기엔 퉁명스럽게, 중간엔 고민하는 모습으로, 후반에만 긍정적으로 변해야 합니다.
`;

export const getBulmanResponse = async (userMessage: string, chatHistory: { role: string; parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            evaluation: {
              type: Type.OBJECT,
              properties: {
                openQuestions: { type: Type.INTEGER },
                neutralLanguage: { type: Type.INTEGER },
                cleanLanguage: { type: Type.INTEGER },
                reframing: { type: Type.INTEGER },
                feedback: { type: Type.STRING },
                analysis: { type: Type.STRING },
                alternative: { type: Type.STRING },
                willingnessToChange: { type: Type.INTEGER }
              },
              required: ["openQuestions", "neutralLanguage", "cleanLanguage", "reframing", "feedback", "analysis", "alternative", "willingnessToChange"]
            },
            isEnding: { type: Type.BOOLEAN }
          },
          required: ["response", "evaluation", "isEnding"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
