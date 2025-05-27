// app/competition-select/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Define interfaces for better type safety
interface Competition {
  id: string;
  name: string;
  passphrase: string;
  users: string[];
}

const CompetitionSelectPage = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [competitionName, setCompetitionName] = useState<string>('');
  const [competitionPassphrase, setCompetitionPassphrase] = useState<string>('');
  const [joinPassphrase, setJoinPassphrase] = useState<string>('');

  const router = useRouter();

  // Fetch user name from local storage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // If user name is not found, redirect to landing page
      router.push('/');
    }
  }, [router]); // Dependency array includes router to avoid lint warnings

  // Fetch competitions the user is part of
  useEffect(() => {
    const fetchUserCompetitions = async () => {
      if (!userName) return; // Don't fetch if user name is not available yet

      try {
        setLoading(true);
        // In a real app, you'd have an API route to fetch competitions by user name.
        // For now, we'll simulate fetching all competitions and filtering.
        // Replace with your actual API call later.
        const response = await fetch('/api/get-all-competitions'); // Assuming you'll create this API
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch competitions');
        }
        const allCompetitions: Competition[] = await response.json();
        const userCompetitions = allCompetitions.filter(comp => comp.users.includes(userName));
        setCompetitions(userCompetitions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCompetitions();
  }, [userName]); // Refetch when user name is available

  const handleCreateCompetition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!competitionName.trim() || !competitionPassphrase.trim()) {
      alert('Please enter competition name and passphrase.');
      return;
    }
    if (!userName) {
      alert('User name not found. Please go back to the landing page.');
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/create-competition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: competitionName,
          passphrase: competitionPassphrase,
          userName: userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create competition');
      }

      const data = await response.json();
      // Navigate to the newly created competition's UI page
      router.push(`/competition/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoinCompetition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinPassphrase.trim()) {
      alert('Please enter the competition passphrase.');
      return;
    }
     if (!userName) {
      alert('User name not found. Please go back to the landing page.');
      router.push('/');
      return;
    }


    try {
      const response = await fetch('/api/join-competition', { // Assuming you'll create this API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passphrase: joinPassphrase,
          userName: userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
         if (response.status === 404) {
             throw new Error('Competition not found with that passphrase.');
         }
        throw new Error(errorData.error || 'Failed to join competition');
      }

      const data = await response.json();
      // Navigate to the joined competition's UI page
      router.push(`/competition/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!userName) {
      return <div>Loading user data...</div>; // Or a loading spinner
  }

  if (loading) {
    return <div>Loading competitions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome, {userName}!
        </h1>

        {/* List of Competitions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Competitions</h2>
          {competitions.length === 0 ? (
            <p className="text-gray-600">You are not part of any competitions yet.</p>
          ) : (
            <ul>
              {competitions.map(comp => (
                <li key={comp.id} className="mb-2">
                  <button
                    onClick={() => router.push(`/competition/${comp.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    {comp.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Join Competition Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Join Competition</h2>
          <form onSubmit={handleJoinCompetition} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter competition passphrase"
              value={joinPassphrase}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setJoinPassphrase(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-300"
            />
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Join
            </button>
          </form>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Create Competition Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Create Competition</h2>
          <form onSubmit={handleCreateCompetition} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Competition Name"
              value={competitionName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCompetitionName(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-300"
            />
             <input
              type="text"
              placeholder="Competition Passphrase (8 chars)"
              value={competitionPassphrase}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCompetitionPassphrase(e.target.value)}
              maxLength={8} // Limit passphrase length
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-300"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompetitionSelectPage;
