import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFriendRequests,
  getOutgoingRequests,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  MessageSquareIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriends from "../components/NoFriends";
import ImageLoader from "../components/ImageLoader";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("all");

  // Fetch friends data
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Fetch recommended users
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  // Fetch outgoing friend requests
  const { data: outgoingRequests } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingRequests,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const notificationCount = friendRequests?.incomingRequests?.length || 0;

  // Send friend request mutation
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
  });

  // Update outgoing requests IDs when data changes
  useEffect(() => {
    if (outgoingRequests && outgoingRequests.length > 0) {
      const outgoingIds = new Set();
      outgoingRequests.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingRequests]);

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Get unique languages from friends for filtering
  const uniqueLanguages = [
    ...new Set(friends.map((friend) => friend.learningLanguage)),
  ];

  // Filter friends based on selected language
  const filteredFriends =
    selectedLanguageFilter === "all"
      ? friends
      : friends.filter(
          (friend) =>
            friend.learningLanguage.toLowerCase() ===
            selectedLanguageFilter.toLowerCase()
        );

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-base-100">
      <div className="container mx-auto space-y-6 sm:space-y-10">
        {/* FRIENDS SECTION */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-6 sm:size-7 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Your Language Partners
              </h2>
            </div>
            <Link
              to="/notifications"
              className="btn btn-outline btn-sm relative"
            >
              <UserPlusIcon className="mr-2 size-4" />
              Friend Requests
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold">
                  {notificationCount}
                </div>
              )}
            </Link>
          </div>

          {/* Language filters */}
          {friends.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              <button
                className={`btn btn-sm ${
                  selectedLanguageFilter === "all"
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => setSelectedLanguageFilter("all")}
              >
                All Partners
              </button>

              {uniqueLanguages.map((language) => (
                <button
                  key={language}
                  className={`btn btn-sm ${
                    selectedLanguageFilter === language.toLowerCase()
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  onClick={() =>
                    setSelectedLanguageFilter(language.toLowerCase())
                  }
                >
                  {getLanguageFlag(language)}
                  {capitalize(language)}
                </button>
              ))}
            </div>
          )}

          {loadingFriends ? (
            <div className="flex justify-center py-8 sm:py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : friends.length === 0 ? (
            <NoFriends />
          ) : filteredFriends.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No matching language partners
              </h3>
              <p className="text-base-content opacity-70">
                Try selecting a different language filter
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-base-content opacity-70 mb-3">
                Showing {filteredFriends.length} of {friends.length} language
                partners
              </p>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredFriends.map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* RECOMMENDED USERS SECTION */}
        <section className="pt-4 border-t border-base-300">
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <UserPlusIcon className="size-6 sm:size-7 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Meet New Learners
              </h2>
            </div>
            <p className="opacity-70 text-sm sm:text-base">
              Discover perfect language exchange partners based on your profile
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-8 sm:py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No Recommendations Available
              </h3>
              <p className="text-base-content opacity-70 text-sm sm:text-base">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-3 sm:p-5 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="avatar size-12 sm:size-16 rounded-full overflow-hidden">
                          <ImageLoader
                            src={user.profilePic}
                            alt={user.fullName}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary badge-sm">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline badge-sm">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-80 line-clamp-2">
                          {user.bio}
                        </p>
                      )}

                      <div className="flex gap-2 mt-2">
                        {hasRequestBeenSent ? (
                          <button
                            className="btn btn-outline btn-sm flex-1"
                            disabled
                          >
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm flex-1"
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <UserPlusIcon className="size-4 mr-2" />
                            )}
                            Connect
                          </button>
                        )}
                        <Link
                          to={`/chat/${user._id}`}
                          className="btn btn-outline btn-sm"
                        >
                          <MessageSquareIcon className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
