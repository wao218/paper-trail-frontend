import { PlusIcon } from '@heroicons/react/24/outline';
import { ArrowUpCircleIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import { useRef, useState } from 'react';
import type { ChatResponse, Message } from '../types';

type ChatInputProps = {
  isChatLoading: boolean;
  setIsChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setUploadStatus: React.Dispatch<
    React.SetStateAction<'uploading' | 'success' | 'error' | 'idle'>
  >;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatInput({
  isChatLoading,
  setIsChatLoading,
  isUploading,
  setIsUploading,
  messages,
  setMessages,
  setUploadStatus,
}: ChatInputProps) {
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
    setUploadStatus('uploading');
    setIsUploading(true);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('success');
      console.log('Upload Success:', res.data);
    } catch (error) {
      setUploadStatus('error');
      console.log('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
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
    setIsChatLoading(true);

    try {
      const res = await axios.post<ChatResponse>(`${API_URL}/chat`, {
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
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (isChatLoading || !userInput.trim()) {
        return;
      }

      const fakeFormEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;
      void handleUserInput(fakeFormEvent);
    }
  };

  return (
    <form
      className='mt-3 mb-6 p-4 flex flex-col max-w-3xl w-full mx-auto shrink-0 shadow-md rounded-4xl border border-gray-300'
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
        onKeyDown={handleKeyDown}
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
            disabled={isUploading}
          />
          <PlusIcon
            className={`${isUploading ? 'opacity-50 cursor-default' : ''}`}
          />
        </label>

        <button
          type='submit'
          className='w-10 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-default'
          disabled={isChatLoading || isUploading}
        >
          <ArrowUpCircleIcon />
        </button>
      </div>
    </form>
  );
}
