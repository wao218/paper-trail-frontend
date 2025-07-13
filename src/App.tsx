import { PlusIcon } from '@heroicons/react/24/outline';
import { ArrowUpCircleIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import { useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

type ChatResponse = {
  answer: string;
};

function App() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload Success:', res.data);
    } catch (error) {
      console.log('Upload failed:', error);
    }
  };

  const handleUserInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userInput.trim()) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const res = await axios.post<ChatResponse>('http://localhost:3000/chat', {
        question: userMessage.content,
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: res.data.answer || 'No response..',
      };
      setMessages((prev) => [...prev, aiMessage]);

      console.log(messages);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'ai',
          content: 'Error getting a response... try again.',
        },
      ]);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='flex flex-col h-screen'>
      <header className='flex items-center p-2 shrink-0'>
        <img
          src='/paper-trail-logo.svg'
          alt='paper trail logo'
          width={35}
          height={35}
        />
        <p className='ml-2 text-lg font-semibold'>PaperTrail</p>
      </header>

      <div className='flex-1 overflow-y-scroll px-4 py-6 space-y-8 max-w-3xl w-full mx-auto invisible-scrollbar'>
        {messages.length === 0 && (
          <h1 className='text-3xl text-neutral-900 mb-6 text-center'>
            Upload a PDF and let's talk about it!
          </h1>
        )}

        {messages.map((message) => {
          return (
            <div
              key={message.id}
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
        })}
      </div>

      <form
        className='mt-3 mb-3 p-4 flex flex-col max-w-3xl w-full mx-auto shrink-0 shadow-md rounded-4xl border border-gray-300'
        onSubmit={(e) => {
          void handleUserInput(e);
        }}
      >
        <textarea
          className='w-full overflow-y-auto resize-none focus:outline-none max-h-48'
          name='userInput'
          placeholder='Ask anything'
          value={userInput}
          ref={textareaRef}
          rows={1}
          onChange={(e) => {
            setUserInput(e.target.value);
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto'; // reset height
              textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // grow
            }
          }}
        />
        <div className='mt-1 flex justify-between items-center'>
          <label className='cursor-pointer w-6 h-6'>
            <input
              type='file'
              name='document'
              className='hidden'
              onChange={(e) => {
                void handleFileUpload(e);
              }}
            />
            <PlusIcon />
          </label>

          <button
            type='submit'
            className='w-10 h-10 disabled:opacity-50'
            disabled={loading}
          >
            <ArrowUpCircleIcon />
          </button>
        </div>
      </form>
    </main>
  );
}

export default App;
