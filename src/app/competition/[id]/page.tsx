// app/competition/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // Import useParams

// Define interfaces for better type safety
import {AddPenaltyModal} from '@/components/AddPenaltyModal'; // Import the new modal component


interface CompetitionDetails {
  id: string;
  name: string;
  passphrase?: string; // Passphrase might not be needed on the frontend after joining
  users: Array<{ name: string; totalPenalty: number }>; // Array of user objects with penalties
  // Add other competition fields as needed
}

interface Penalty {
  id: string; // Penalty document ID
  competitionId: string;
  penalizingUser: string; // The user who issued the penalty
  penalizedUser: string;
  reason: string;
  amount: number;
  status: 'pending' | 'confirmed'; // Status field
  createdAt?: Date; // Assuming you added this field, make it optional for now if not always present
}


const CompetitionDetailsPage = () => {
  const router = useRouter();
  const params = useParams(); // Get route parameters
  const competitionId = params.id as string; // Extract competition ID from params

  const [userName, setUserName] = useState<string | null>(null);
  const [competitionDetails, setCompetitionDetails] = useState<CompetitionDetails | undefined>(undefined);
  const [userPenalties, setUserPenalties] = useState<Penalty[]>([]); // State to hold all penalties for the current user
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [penaltyFilter, setPenaltyFilter] = useState<'all' | 'pending' | 'confirmed'>('all'); // State for penalty filter
  const [isAddPenaltyModalOpen, setIsAddPenaltyModalOpen] = useState<boolean>(false); // State to control modal visibility

  const fetchData = async () => {
    if (!competitionId || !userName) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch competition details
      const competitionResponse = await fetch(`/api/get-competition-details?competitionId=${competitionId}`);
      if (!competitionResponse.ok) {
        const errorData = await competitionResponse.json();
        throw new Error(errorData.error || 'Failed to fetch competition details');
      }
      const competitionData: CompetitionDetails = await competitionResponse.json();
      setCompetitionDetails(competitionData);

      // Fetch all penalties for the current user using the refactored API
      const penaltiesResponse = await fetch(`/api/get-penalties?competitionId=${competitionId}&userName=${userName}`);
       if (!penaltiesResponse.ok) {
          const errorData = await penaltiesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch penalties');
       }
       const penaltiesData: Penalty[] = (await penaltiesResponse.json()); // Assuming API returns { penalties: [...] }
       setUserPenalties(penaltiesData); // Store all penalties


    } catch (err: any) {
      setError((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user name from local storage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      router.push('/'); // Redirect if user name is not found
    }
  }, [router]);

  // Fetch competition details and pending penalties
  useEffect(() => {
    fetchData();
     // You might want to set up real-time listeners here for live updates
     // on competition details and pending penalties
  }, [competitionId, userName]); // Refetch when competitionId or userName changes

   const handleConfirmPenalty = async (penalty: Penalty) => {
      if (!userName) {
         alert('User not logged in.');
         router.push('/');
         return;
      }
      try {
         const response = await fetch('/api/confirm-penalty', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               penaltyId: penalty.id,
               competitionId: penalty.competitionId ?? competitionId,
               penalizedUser: userName, // The user confirming is the penalized user
               amount: penalty.amount,
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to confirm penalty');
         }

         // Re-fetch competition details to update total penalty display
         // Re-fetch all penalties to update the list status
         fetchData();


         // const competitionResponse = await fetch(`/api/get-competition-details?competitionId=${competitionId}`);
         // if (competitionResponse.ok) {
         //    const competitionData: CompetitionDetails = await competitionResponse.json();
         //    setCompetitionDetails(competitionData);
         // }


      } catch (err: any) {
         setError(err.message);
      }
   };


  // Callback function to re-fetch penalties after a penalty is successfully added
  const handlePenaltyAdded = () => {
    fetchData(); // Re-fetch both competition details and penalties
  };

   const openAddPenaltyModal = () => {
    setIsAddPenaltyModalOpen(true);
  };

  const closeAddPenaltyModal = () => {
    setIsAddPenaltyModalOpen(false);
  };

   // Filter penalties based on the selected filter
   const filteredPenalties = userPenalties.filter(penalty => {
     if (penaltyFilter === 'all') {
       return true; // Show all penalties
     } else if (penaltyFilter === 'pending') {
       return penalty.status === 'pending'; // Show penalties where status is 'pending'
     } else if (penaltyFilter === 'confirmed') {
       return penalty.status === 'confirmed'; // Show penalties where status is 'confirmed'
     }
     return true; // Default to all if filter is invalid
  });

   const selfUser = competitionDetails?.users?.find(user => user.name === userName);
 
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading competition...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!competitionDetails) {
    return <div className="flex justify-center items-center min-h-screen">Competition not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Competition: {competitionDetails?.name}
        </h1>

                {/* Self User Information */}
                 {selfUser && (
            <div className="mb-8">
               <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Penalties</h2>
               <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                    <p className="font-medium text-blue-800">Your Total Penalty: <span className="font-bold">{selfUser.totalPenalty}</span></p>
                    <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Your Penalties</h3>

                    {/* Filter Buttons */}
                    <div className="mb-4 flex gap-2">
                        <button
                            onClick={() => setPenaltyFilter('all')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${penaltyFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >All ({userPenalties.length})</button>
                        <button
                            onClick={() => setPenaltyFilter('pending')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${penaltyFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >Pending ({userPenalties.filter(p => p.status === 'pending').length})</button>
                       <button
                            onClick={() => setPenaltyFilter('confirmed')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${penaltyFilter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >Confirmed ({userPenalties.filter(p => p.status === 'confirmed').length})</button>
                    </div>
                    {filteredPenalties.length === 0 ? (
                       <p className="text-gray-600">You have no penalties recorded for this filter.</p>
                     ) : (
                       <ul className="flex flex-col gap-3">
                         {filteredPenalties.map(penalty => (
                           <li
                             key={penalty.id}
                             className={`p-3 rounded-md ${penalty.status === 'confirmed' ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}
                            >
                             <p className="text-gray-700">From <span className="font-medium">{penalty.penalizingUser}</span>: "{penalty.reason}" - <span className="font-bold text-red-600">{penalty.amount}</span></p>
                             {penalty.status === 'confirmed' ? (
                               <span className="mt-2 inline-block text-sm font-medium text-green-700">Confirmed</span>
                             ) : (
                                 <button
                                 onClick={() => handleConfirmPenalty(penalty)}
                                 className="mt-2 bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                               >
                                 Confirm
                               </button>
                             )}
                           </li>
                         ))}
                       </ul>
                     )}
                     {/*
                     <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Penalties Awaiting Your Confirmation</h3>
                     // Filter userPenalties to show only pending ones here
                     */}


               </div>
            </div>
        )}

        {/* List of Users and Penalties */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Participants and Penalties</h2>
          {competitionDetails?.users.length === 0 ? (
            <p className="text-gray-600">No users in this competition yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competitionDetails?.users.map(user => (
                <li key={user.name} className="bg-gray-50 p-4 rounded-md shadow-sm">
                  <span className="font-medium text-gray-800">{user.name}</span>: Total Penalty - <span className="font-bold text-red-600">{user.totalPenalty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>


        <hr className="my-8 border-gray-200" />

        {/* Add Penalty Section Button */}
         <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Penalty to User</h2>
           <button
            onClick={openAddPenaltyModal}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Add New Penalty
          </button>
        </div>
      </div>

      {/* Add Penalty Modal */}
      {competitionDetails?.users && userName && competitionId && ( // Ensure users data, userName, and competitionId are available
         <AddPenaltyModal
            isOpen={isAddPenaltyModalOpen}
            onClose={closeAddPenaltyModal}
            competitionId={competitionId}
            currentUser={userName}
            users={competitionDetails?.users?.filter(user => user.name !== userName).map(user => user.name)} // Pass only user names excluding self
            onPenaltyAdded={handlePenaltyAdded} // Pass the callback to re-fetch data
         />
      )}

    </div>
  );
};
 
 

//   if (loading) {
//     return <div className="flex justify-center items-center min-h-screen">Loading competition...</div>;
//   }

//   if (error) {
//     return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
//   }

//   if (!competitionDetails) {
//     return <div className="flex justify-center items-center min-h-screen">Competition not found.</div>;
//   }

//   // Filter penalties based on the selected filter
//   const filteredPenalties = userPenalties.filter(penalty => {

//   const selfUser = competitionDetails.users.find(user => user.name === userName);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
//         <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
//           Competition: {competitionDetails.name}
//         </h1>

//                  {/* Self User Information */}
//                  {selfUser && (
//             <div className="mb-8">
//                <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Penalties</h2>
//                <div className="bg-blue-50 p-4 rounded-md shadow-sm">
//                     <p className="font-medium text-blue-800">Your Total Penalty: <span className="font-bold">{selfUser.totalPenalty}</span></p>
//                     <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Your Penalties</h3>

//                     {/* Filter Buttons */}
//                     <div className="mb-4 flex gap-2">
//                         <button
//                             onClick={() => setPenaltyFilter('all')}
//                             className={`px-3 py-1 rounded-md text-sm font-medium ${penaltyFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
//                         >All ({userPenalties.length})</button>
//                         <button
//                             onClick={() => setPenaltyFilter('pending')}
//                             className={`px-3 py-1 rounded-md text-sm font-medium ${penaltyFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
//                         >Pending ({userPenalties.filter(p => p.status === 'pending').length})</button>
//                         <button
//                             onClick={() => setPenaltyFilter('confirmed')}
//                             className={`px-3 py-1 rounded-md text-sm font-medium ${penaltyFilter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
//                         >Confirmed ({userPenalties.filter(p => p.status === 'confirmed').length})</button>
//                     </div>
//                      {filteredPenalties.length === 0 ? (
//                        <p className="text-gray-600">You have no penalties recorded.</p>
//                      ) : (
//                        <ul className="flex flex-col gap-3">
//                          {userPenalties.map(penalty => (
//                            <li
//                              key={penalty.id}
//                              className={`p-3 rounded-md ${penalty.status === 'confirmed' ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}
//                            > {
//                              <p className="text-gray-700">From <span className="font-medium">{penalty.penalizingUser}</span>: "{penalty.reason}" - <span className="font-bold text-red-600">{penalty.amount}</span></p>
//                              {penalty.status === 'confirmed' ? (
//                                <span className="mt-2 inline-block text-sm font-medium text-green-700">Confirmed</span>
//                              ) : (
//                                <button
//                                  onClick={() => handleConfirmPenalty(penalty)}
//                                  className="mt-2 bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
//                                >
//                                  Confirm
//                                </button>
//                              )}
//                      {/*
//                      <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Penalties Awaiting Your Confirmation</h3>
//                      // Filter userPenalties to show only pending ones here
//                      */}


//                </div>
//             </div>
//          )}

//         {/* List of Users and Penalties */}
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4">Participants and Penalties</h2>
//           {competitionDetails.users.length === 0 ? (
//             <p className="text-gray-600">No users in this competition yet.</p>
//           ) : (
//             <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {competitionDetails.users.map(user => (
//                 <li key={user.name} className="bg-gray-50 p-4 rounded-md shadow-sm">
//                   <span className="font-medium text-gray-800">{user.name}</span>: Total Penalty - <span className="font-bold text-red-600">{user.totalPenalty}</span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>


//         <hr className="my-8 border-gray-200" />

//         {/* Add Penalty Section */}
//         <div>
//           <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Penalty to User</h2>
//           <form onSubmit={handleAddPenalty} className="flex flex-col gap-4">
//             <div>
//               <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">Select User:</label>
//               <select
//                 id="user-select"
//                 value={selectedUserToPenalize}
//                 onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedUserToPenalize(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">-- Select a User --</option>
//                 {competitionDetails.users
//                    .filter(user => user.name !== userName) // Cannot penalize self
//                    .map(user => (
//                   <option key={user.name} value={user.name}>{user.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//                <label htmlFor="penalty-reason" className="block text-sm font-medium text-gray-700 mb-1">Reason:</label>
//                <input
//                  type="text"
//                  id="penalty-reason"
//                  placeholder="Reason for penalty"
//                  value={penaltyReason}
//                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPenaltyReason(e.target.value)}
//                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                />
//             </div>

//             <div>
//                 <label htmlFor="penalty-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount:</label>
//                 <input
//                   type="number"
//                   id="penalty-amount"
//                   placeholder="Penalty amount"
//                   value={penaltyAmount}
//                   onChange={(e: ChangeEvent<HTMLInputElement>) => setPenaltyAmount(Number(e.target.value))}
//                   min="0" // Ensure non-negative amount
//                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//             </div>

//             <button
//               type="submit"
//               className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//             >
//               Add Penalty
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

export default CompetitionDetailsPage;
