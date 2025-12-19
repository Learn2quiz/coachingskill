
export enum MessageSender {
  AI = 'ai',
  USER = 'user'
}

export interface Evaluation {
  openQuestions: number;   // 0-100
  neutralLanguage: number; // 0-100
  cleanLanguage: number;   // 0-100
  reframing: number;       // 0-100
  feedback: string;        // 짧은 총평
  analysis: string;        // 왜 이런 점수가 나왔는지에 대한 구체적 분석
  alternative: string;     // 더 나은 코칭 대안 표현
  willingnessToChange: number; // 0-100 (현재 친구의 마음이 열린 정도)
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  evaluation?: Evaluation;
}

export interface SimulationState {
  isStarted: boolean;
  isEnded: boolean;
  turnCount: number;
  messages: ChatMessage[];
  totalScore: number;
}
