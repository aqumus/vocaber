'use client';

import { useState, FormEvent, useEffect } from 'react';
// Ensure all necessary UI components are imported
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Add Input import
import { Label } from '@/components/ui/label'; // Add Label import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AddPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
  currentUser: string; // Changed from userName to currentUser for clarity
  users: string[];
  onPenaltyAdded: () => void; // Callback to notify parent on success
}

// Assuming a simple Select component structure for illustration
// If you have a specific Select component from your UI library, use that instead
// This is a basic placeholder
export const AddPenaltyModal: React.FC<AddPenaltyModalProps> = ({
  isOpen,
  onClose,
  competitionId,
  currentUser,
  onPenaltyAdded,
  users
}) => {
  const [penalizedUser, setPenalizedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Set initial penalized user to the first user in the list if available
  useEffect(() => {
    if (users && users.length > 0) {
 setPenalizedUser(users[0]);
    } else {
 setPenalizedUser(''); // Clear selection if no users
 }
  }, [users]);

  const handleAddPenalty = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/add-penalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId,
          penalizedUser: penalizedUser, // Use selected penalizedUser
          penalizingUser: currentUser, // Assuming the current user is the one adding the penalty
          amount: parseInt(amount, 10), // Convert amount to number
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add penalty');
      }

      setSuccessMessage('Penalty added successfully!');
      setPenalizedUser('');
      setAmount('');
      setReason('');
      onPenaltyAdded(); // Notify parent
      setIsLoading(false)

      // Close modal after 1 second
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Error adding penalty:', err);
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
 } finally {
 }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Penalty</DialogTitle>
        </DialogHeader>
        {!successMessage ? (
          <form onSubmit={handleAddPenalty}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="penalizedUser" className="text-right">
                  User
                </Label>
                {/* Use a styled select element */}
                <select
                  // Apply Tailwind classes for styling
                  className="col-span-3 text-black block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 text-gray-900 bg-white"
                  id="penalizedUser"
                  value={penalizedUser}
                  onChange={(e) => setPenalizedUser(e.target.value)}
                  required
                >
                  {users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <DialogFooter className='flex flex-row justify-center gap-4'>
              <Button type="submit" variant='secondary' disabled={isLoading} className='text-white bg-red-500 hover:text-red-800 w-1/2 h-[32px]'>
                {isLoading ? 'Adding...' : 'Add Penalty'}
              </Button>
              <Button variant="secondary" onClick={onClose} className="mt-0 text-black border border-grey-600 w-1/2 h-[32px]">Cancel</Button> {/* Ensure no top margin */}
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center text-green-600 py-8">
            {successMessage}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};