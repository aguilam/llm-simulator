import React from "react";
import { Message } from "@/app/types/types";

interface PreviousMessagesProps {
  messages: Message[];
}
const PreviousMessages: React.FC<PreviousMessagesProps> = ({ messages }) => {
  return (
    <>
      {messages?.map((message) => (
        <div
          className="flex flex-col gap-10 items-end w-[640px]"
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
    </>
  );
};
export default PreviousMessages;
