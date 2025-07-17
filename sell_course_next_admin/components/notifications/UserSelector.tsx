'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, User, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface UserData {
  user_id: string;
  name?: string; // Make name optional since it might not exist
  email: string;
  username: string;
  avatarImg?: string;
  role: string;
}

interface UserSelectorProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  className?: string;
}

interface SearchResponse {
  users: UserData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onUsersChange,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserData[]>([]); // Store all users
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]); // Store filtered results
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const hasFetchedRef = useRef(false); // Track if we've already fetched

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Helper function to get user display name
  const getUserDisplayName = (user: UserData) => {
    return user.name || user.username || user.email;
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch ALL users once
  const fetchAllUsers = useCallback(async () => {
    console.log('🔍 Fetching ALL users...');
    
    // Prevent multiple simultaneous requests and duplicate fetches
    if (isLoading || hasFetchedRef.current) return;
    
    hasFetchedRef.current = true; // Mark as fetched
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/admin/user/search?query=&page=1&limit=0`; // limit=0 means no limit
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      console.log('📡 API Response - Total users:', data.total);
      
      setAllUsers(data.users);
      setFilteredUsers(data.users); // Initially show all users
      setTotal(data.total);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      setAllUsers([]);
      setFilteredUsers([]);
      hasFetchedRef.current = false; // Reset on error to allow retry
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, isLoading]);

  // Fetch user details for selected users
  const fetchSelectedUserDetails = useCallback(async () => {
    if (selectedUsers.length === 0) {
      setSelectedUserDetails([]);
      return;
    }

    console.log('🔍 Fetching selected user details for:', selectedUsers);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/user/view_user`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const allUsers: UserData[] = await response.json();
      console.log('📡 All users response:', allUsers);
      const selectedDetails = allUsers.filter(user => selectedUsers.includes(user.user_id));
      console.log('📡 Selected user details:', selectedDetails);
      setSelectedUserDetails(selectedDetails);
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
    }
  }, [selectedUsers, API_BASE_URL]);

  // Load ALL users when component mounts or dropdown opens
  useEffect(() => {
    if (isOpen && !hasFetchedRef.current && !isLoading) {
      fetchAllUsers(); // Load ALL users once
    }
  }, [isOpen, fetchAllUsers, isLoading]);

  // Client-side filtering effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers); // Show all users when no search
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const delayedSearch = setTimeout(() => {
      const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
      setIsSearching(false);
    }, 300); // Reduced since it's client-side filtering

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, allUsers]);

  // Fetch selected user details when selectedUsers changes
  useEffect(() => {
    fetchSelectedUserDetails();
  }, [fetchSelectedUserDetails]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hasFetchedRef.current = false; // Reset fetch flag on unmount
    };
  }, []);

  // Handle user selection
  const handleUserSelect = useCallback((userId: string) => {
    const newSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    
    onUsersChange(newSelectedUsers);
  }, [selectedUsers, onUsersChange]);

  // Handle remove user
  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(id => id !== userId));
  };

  // No need for load more since we load all users at once

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery && !isOpen) {
        setIsOpen(true);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Users Display */}
      {selectedUserDetails.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Selected Users ({selectedUserDetails.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedUserDetails.map((user) => (
              <Badge
                key={user.user_id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={user.avatarImg} alt={user.name || 'User'} />
                  <AvatarFallback className="text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name || 'Unknown User'}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    handleRemoveUser(user.user_id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Search Users
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          {isSearching && (
            <div className="absolute right-12 top-3 h-4 w-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              const newIsOpen = !isOpen;
              setIsOpen(newIsOpen);
              
              // Reset search when closing
              if (!newIsOpen) {
                setSearchQuery('');
                setFilteredUsers(allUsers); // Reset to show all users
              }
            }}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (
        <Card className="border-2 border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading all users...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <div className="text-red-400 mb-2">⚠️</div>
                  <p className="font-medium">Error loading users</p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      hasFetchedRef.current = false; // Reset fetch flag
                      fetchAllUsers();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.user_id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.user_id)
                          ? 'bg-blue-50 border-blue-200 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={(e) => {
                        // Only handle click if not clicking on checkbox
                        if (e.target !== e.currentTarget.querySelector('input[type="checkbox"]')) {
                          handleUserSelect(user.user_id);
                        }
                      }}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedUsers.includes(user.user_id)}
                          onCheckedChange={() => handleUserSelect(user.user_id)}
                        />
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarImg} alt={user.name || user.username} />
                        <AvatarFallback>
                          {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getUserDisplayName(user)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {truncateText(user.email, 30)}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No users found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try adjusting your search query' : 'No users available'}
                  </p>
                  <p className="text-xs mt-1">
                    Total users in system: {total}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSelector;