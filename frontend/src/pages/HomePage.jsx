import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOutgoingRequests,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriends from "../components/NoFriends";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [loadedImages, setLoadedImages] = useState({});

  // Handle image loading
  const handleImageLoad = (userId) => {
    setLoadedImages(prev => ({
      ...prev,
      [userId]: true
    }));
  };

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingRequests } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingRequests,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] }),
  });

  useEffect(() => {
    if (outgoingRequests && outgoingRequests.length > 0) {
      const outgoingIds = new Set();
      outgoingRequests.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingRequests]);

  // Capitalize function moved to the top for reuse
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6 sm:space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : friends.length === 0 ? (
          <NoFriends />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70 text-sm sm:text-base">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-8 sm:py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : recommendedUsers.length == 0 ? (
            <div className="card bg-base-200 p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No Recommendations available
              </h3>
              <p className="text-base-content opacity-70 text-sm sm:text-base">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                const isImageLoaded = loadedImages[user._id];
                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-3 sm:p-5 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="avatar size-12 sm:size-16 rounded-full bg-base-300 relative">
                          {!isImageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="loading loading-spinner loading-sm"></span>
                            </div>
                          )}
                          <img 
                            src={user.profilePic} 
                            alt={user.fullName} 
                            onLoad={() => handleImageLoad(user._id)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://avatar.iran.liara.run/public/1.png";
                              handleImageLoad(user._id);
                            }}
                            className={`rounded-full ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
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

                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        <span className="badge badge-secondary text-xs">
                          {getLanguageFlag(user.nativeLanguage)}
                          <span className="hidden xs:inline">Native:</span> {capitalize(user.nativeLanguage)}
                        </span>

                        <span className="badge badge-outline text-xs">
                          {getLanguageFlag(user.learningLanguage)}
                          <span className="hidden xs:inline">Learning:</span> {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-xs sm:text-sm opacity-70 line-clamp-2">{user.bio}</p>}

                      <button className={`btn btn-sm sm:btn-md w-full mt-1 sm:mt-2 ${
                        hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`} onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}>
                          {hasRequestBeenSent ? (
                            <>
                            <CheckCircleIcon className="size-3 sm:size-4 mr-1 sm:mr-2"/>
                            Request Sent
                            </>
                          ) : (
                            <>
                            <UserPlusIcon className="size-3 sm:size-4 mr-1 sm:mr-2"/>
                            Send Friend Request
                            </>
                          )}
                      </button>
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