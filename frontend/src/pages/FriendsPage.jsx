import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriends from "../components/NoFriends";
import { SearchIcon, UsersIcon, UserIcon, MessageSquareIcon } from "lucide-react";
import ImageLoader from "../components/ImageLoader";

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort friends based on selected sort option
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (sortBy === "name") {
      return a.fullName.localeCompare(b.fullName);
    } else if (sortBy === "recent") {
      // This would ideally use a lastInteraction timestamp
      // For now, just use the _id as a proxy for recency
      return b._id.localeCompare(a._id);
    } else if (sortBy === "language") {
      return a.learningLanguage.localeCompare(b.learningLanguage);
    }
    return 0;
  });

  // Function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-base-100">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <UsersIcon className="size-7 text-primary" />
              My Language Partners
            </h1>
            <p className="text-base-content/70 mt-1">
              Connect and practice with your language exchange partners
            </p>
          </div>
          
          {/* View toggle buttons */}
          <div className="flex gap-2">
            <button 
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Search and sort controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-base-content opacity-50" />
            </div>
            <input
              type="text"
              placeholder="Search friends by name..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="select select-bordered w-full sm:w-48"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
            <option value="language">Sort by Language</option>
          </select>
        </div>

        {/* Friends list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : friends.length === 0 ? (
          <NoFriends />
        ) : filteredFriends.length === 0 ? (
          <div className="card bg-base-200 p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">No matching friends</h3>
            <p className="text-base-content opacity-70">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-base-content/70">
                Showing {filteredFriends.length} of {friends.length} friends
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedFriends.map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedFriends.map((friend) => (
                  <div key={friend._id} className="card card-side bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="avatar m-3 sm:m-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <ImageLoader 
                          src={friend.profilePic} 
                          alt={friend.fullName} 
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div className="card-body py-3 px-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="card-title text-lg">{friend.fullName}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="badge badge-sm">
                              Native: {capitalize(friend.nativeLanguage)}
                            </span>
                            <span className="badge badge-sm badge-outline">
                              Learning: {capitalize(friend.learningLanguage)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <a href={`/chat/${friend._id}`} className="btn btn-primary btn-sm">
                            <MessageSquareIcon className="size-4 mr-1" />
                            Message
                          </a>
                          <a href={`/profile/${friend._id}`} className="btn btn-outline btn-sm">
                            <UserIcon className="size-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;