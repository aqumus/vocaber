// app/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('userName', userName.trim());
      router.push('/competition-select');
    } else {
      alert('Please enter your name.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Welcome to the Vocaber
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Please enter your name to get started.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={handleNameChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
