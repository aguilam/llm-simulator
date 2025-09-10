export type Message = {
  role: string;
  content: string;
};

export type TopLogProb = { 
    token: string; 
    score?: number 
};

export type LogProbItem = {
  token: string;
  top_logprobs: TopLogProb[];
};
