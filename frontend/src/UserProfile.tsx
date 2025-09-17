import React from 'react';

interface UserProfileProps {
  name: string;
  role?: string;
}

// Function to get user initials
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Function to get background color based on name
const getBackgroundColor = (name: string, role?: string): string => {
  if (role === 'admin') {
    return 'bg-blue-600';
  }
  
  // Generate consistent color based on name
  const colors = [
    'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
  ];
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const UserProfile: React.FC<UserProfileProps> = ({ name, role }) => {
  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name, role);
  
  return (
    <div
      className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm border border-gray-200 ${bgColor}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default UserProfile;
