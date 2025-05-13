import React from "react";
import { LANGUAGE_TO_FLAG } from "../constants/index.js";
import { Link } from "react-router";
import ImageLoader from "./ImageLoader.jsx";

const FriendCard = ({ friend }) => {
  // Function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-3 sm:p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="avatar size-10 sm:size-12 rounded-full relative overflow-hidden">
            <ImageLoader 
              src={friend.profilePic} 
              alt={friend.fullName} 
              className="rounded-full"
            />
          </div>
          <h3 className="font-semibold truncate text-sm sm:text-base">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="hidden xs:inline">Native: </span> {capitalize(friend.nativeLanguage)}
          </span>

          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="hidden xs:inline">Learning: </span> {capitalize(friend.learningLanguage)}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline btn-sm sm:btn-md w-full">
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
}