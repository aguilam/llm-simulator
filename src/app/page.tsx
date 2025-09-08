"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { shuffle } from "./helpers";

type TopLogProb = { token: string; score?: number };
type LogProbItem = {
  token: string;
  top_logprobs: TopLogProb[];
};
export default function Home() {
  const [assistantLogProbs, setAssistantLogProbs] = useState<
    LogProbItem[] | null
  >(null);
  const [assistantAnswer, setAssistantAnswer] = useState<string[]>([]);
  const [currentToken, setCurrentToken] = useState<number>(-1);
  const [currentLogTokens, setLogTokens] = useState<string[]>([]);
  const [userPredictedAnswer, setUserPredictedAnswer] = useState<string[]>([]);
  const [AssistantLogProbslength, setAssistantLogProbslength] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [predictedPercent, setPredictedPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const startGame = async () => {
    setIsRoundFinished(false);
    setAnswerTime(0);
    if (userPredictedAnswer.length !== 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: userPredictedAnswer.join(""),
        },
      ]);
    }
    setIsLoading(true);
    setAssistantAnswer([])

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const response = await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });
    const data = await response.json();
    data.response.choices[0].logprobs.content.forEach(
      (logProb: LogProbItem) => {
        if (logProb.token !== "<|eot_id|>" && logProb.token !== "<|eot|>") {
          setAssistantAnswer((prev) => [...prev, logProb.token]);
        }
      }
    );
    setAssistantLogProbs(data.response.choices[0].logprobs.content);
    setAssistantLogProbslength(
      data.response.choices[0].logprobs.content.length
    );
    setUserPredictedAnswer([]);
    
    setCurrentToken(0);
    setIsGameStarted(true);
    intervalRef.current = setInterval(() => {
      setAnswerTime((prev) => prev + 1);
    }, 1000);
    setIsLoading(false);
  };

  const currentVariant = () => {
    if (!assistantLogProbs) return;
    const variants: string[] = [];
    for (const logProb of assistantLogProbs[currentToken].top_logprobs) {
      if (logProb.token !== "<|eot_id|>" && logProb.token !== "<|eot|>") {
        variants.push(logProb.token);
      }
    }
    const mainToken = assistantLogProbs[currentToken].token;
    if (
      mainToken !== "<|eot_id|>" &&
      mainToken !== "<|eot|>" &&
      !variants.includes(mainToken)
    ) {
      variants.push(mainToken);
    }
    setLogTokens(shuffle(variants));
  };

  const selectToken = async (token: string) => {
    setUserPredictedAnswer((prev) => [...prev, token]);
    setCurrentToken((prev) => prev + 1);
  };
  useEffect(() => {
    if (currentToken + 1 == AssistantLogProbslength && isGameStarted) {
      FinishGame();
    } else {
      currentVariant();
    }
  }, [currentToken]);

  const FinishGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPredictedPercent(checkCorrectTokens());
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: prompt,
      },
    ]);
    setPrompt("");
    setIsRoundFinished(true);
    setIsGameStarted(false);
  };
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  const checkCorrectTokens = () => {
    let correct = 0;
    for (let i = 0; i < AssistantLogProbslength; i++) {
      if (userPredictedAnswer[i] == assistantAnswer[i]) {
        correct++;
      }
    }

    return Math.round((correct / AssistantLogProbslength) * 100);
  };
  return (
    <main className="w-screen h-full flex flex-col items-center relative">
      <div className="h-full flex flex-col items-center relative max-w-[640px]">
        <div className="pt-14 flex flex-col gap-12 pb-[200px]">
          {messages?.map((message) => (
            <div
              className="flex flex-col items-end w-[640px]"
              key={Math.random()}
            >
              {message.role == "user" && message.content !== "" ? (
                <div className="bg-[#323232d9] max-w-[448px] text-white px-4 py-[12px] h-fit rounded-[18px]">
                  <p className=" text-white break-words">{message.content}</p>
                </div>
              ) : (
                <div className="w-full">
                  <p className=" text-white">{message.content}</p>
                </div>
              )}
            </div>
          ))}
          <div className=" flex flex-col gap-10 items-end w-[640px]">
            {(isLoading || isGameStarted) && (
              <div className="bg-[#323232d9] max-w-[448px] text-white px-4 py-[12px] h-fit rounded-[18px]">
                <p className=" text-white break-words">{prompt}</p>
              </div>
            )}
            <div className=" w-full">
              {currentToken + 1 == AssistantLogProbslength &&
                isRoundFinished == true && (
                  <div className="flex gap-4 mb-2">
                    <p className="text-white">
                      Думал на протяжении {answerTime}s
                    </p>
                    <p className="text-white">
                      Токены верно угаданы на {predictedPercent}%
                    </p>
                  </div>
                )}
              {isLoading && <Skeleton className="h-4 w-[250px]" />}
              {userPredictedAnswer !== undefined && isLoading !== true && (
                <p className=" text-white">{userPredictedAnswer.join("")}</p>
              )}
              {isGameStarted && (
                <div className="flex gap-4 items-center flex-col sm:flex-row">
                  <div className=" flex gap-4">
                    {currentLogTokens.map((token) => (
                      <Button
                        key={Math.random()}
                        onClick={() => selectToken(token)}
                        className="bg-[#ffffff1a] rounded-[38px]"
                      >
                        {token}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className=" bg-[#303030] px-5 py-[16px] sticky rounded-[28px] bottom-8  w-[640px] h-fit items-end flex flex-col">
        <Textarea
          name="prompt"
          id="prompt"
          value={prompt}
          disabled={isGameStarted || isLoading}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Задайте вопрос что-бы начать игру..."
          className=" text-white border-0 placeholder:text-gray-500 w-full hover resize-none overflow-hidden break-words focus-visible:ring-0  focus:outline-none focus:ring-0"
        />
        <Button
          onClick={startGame}
          size={"icon"}
          disabled={isGameStarted || isLoading}
          className="bg-white rounded-full w-9 h-9 hover:bg-[#ffffff1a]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="black"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
          </svg>
        </Button>
      </div>
    </main>
  );
}
