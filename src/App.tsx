import { PlusIcon } from '@heroicons/react/24/outline';
import { ArrowUpCircleIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import { useState } from 'react';

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
    <main className='h-screen overflow-hidden'>
      {/* Header section w/ Icon and Title */}
      <header className='flex items-center ml-2 mt-1'>
        <img
          src='/paper-trail-logo.svg'
          alt='paper trail logo'
          width={35}
          height={35}
        />
        <p className='ml-1'>PaperTrail</p>
      </header>

      {/* Container for everything to center in the screen */}
      <div className='h-screen w-screen flex justify-center items-center'>
        {/* Container for text input and where the chat area will eventually be */}
        <div className='flex-col'>
          <h1 className='text-3xl text-neutral-900 mb-6'>
            Upload a PDF and let's talk about it!
          </h1>

          <div>
            {messages.map((message) => {
              return (
                <div
                  key={message.id}
                  className={`${
                    message.role === 'user'
                      ? 'bg-blue-200 text-right'
                      : 'bg-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              );
            })}
          </div>

          {/* Container for input controls */}
          <div>
            <form
              onSubmit={(e) => {
                void handleUserInput(e);
              }}
            >
              <textarea
                className='w-full resize-none'
                name='userInput'
                placeholder='Ask anything'
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                }}
              />
              <div className='flex justify-between'>
                <label className='cursor-pointer w-8 h-8'>
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
                  className='w-9 h-9 disabled:opacity-50'
                  disabled={loading}
                >
                  <ArrowUpCircleIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
