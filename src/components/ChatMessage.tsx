import type { Message } from '../types';

export default function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={`
                    p-3 rounded-lg break-words max-w-[75%] w-fit
                    ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white self-end ml-auto'
                        : 'bg-gray-200 self-start'
                    }
                  `}
    >
      {message.content}
    </div>
  );
}
