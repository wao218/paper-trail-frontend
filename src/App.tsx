import { useEffect, useRef, useState } from 'react';
import ChatMessage from './components/ChatMessage';
import type { Message } from './types';
import ChatInput from './components/ChatInput';

function App() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isFirstInteraction = messages.length === 0;

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

      <div
        className={`flex-1 flex flex-col max-w-3xl w-full mx-auto
          ${
            isFirstInteraction
              ? 'justify-center items-center text-center space-y-6'
              : ''
          }
        `}
      >
        {isFirstInteraction && (
          <h1 className='text-3xl text-neutral-900 mb-6 text-center'>
            Upload a PDF and let's talk about it!
          </h1>
        )}

        {!isFirstInteraction && (
          <div className='flex-1 overflow-y-auto px-4 py-6 space-y-8 invisible-scrollbar w-full'>
            {messages.map((message) => {
              return <ChatMessage key={message.id} message={message} />;
            })}

            {loading && (
              <p className='p-3 rounded-lg bg-gray-100 text-gray-500 max-w-[75%] w-fit self-start italic'>
                AI is thinking...
              </p>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {uploadStatus !== 'idle' && (
          <div className='text-sm mb-2 px-2 text-gray-500'>
            {uploadStatus === 'uploading' && 'Uploading document...'}
            {uploadStatus === 'success' && '✅ Document uploaded successfully'}
            {uploadStatus === 'error' && '❌ Failed to upload document'}
          </div>
        )}

        <ChatInput
          loading={loading}
          setLoading={setLoading}
          messages={messages}
          setMessages={setMessages}
          setUploadStatus={setUploadStatus}
        />
      </div>
    </main>
  );
}

export default App;
