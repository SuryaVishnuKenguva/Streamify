import React, { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendRequests, logout } from "../lib/api";
import { BellIcon, LogOutIcon, MenuIcon, ShipWheelIcon, XIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch notification count
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const notificationCount = friendRequests?.incomingRequests?.length || 0;

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        {/* Logo section */}
        <div className={`flex items-center ${!isChatPage ? 'lg:hidden' : ''}`}>
          <Link to="/" className="flex items-center gap-2">
            <ShipWheelIcon className="size-7 sm:size-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </Link>
        </div>
        
        {/* This empty div helps with spacing when logo is not shown on large screens */}
        {!isChatPage && <div className="hidden lg:block"></div>}

        {/* Mobile menu button */}
        <button 
          className="lg:hidden btn btn-ghost btn-sm p-1 ml-auto mr-2" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>

        {/* Right-aligned items - desktop */}
        <div className="hidden lg:flex items-center gap-5">
          <Link to="/notifications">
            <button className="btn btn-ghost btn-circle relative">
              <BellIcon className="h-5 w-5 text-base-content opacity-80" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold">
                  {notificationCount}
                </div>
              )}
            </button>
          </Link>

          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full bg-base-300">
              <img
                src={authUser?.profilePic}
                alt="User Avatar"
                rel="noreferrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://avatar.iran.liara.run/public/1.png";
                }}
              />
            </div>
          </div>

          <button 
            className="btn btn-ghost btn-circle" 
            onClick={logoutMutation}
            disabled={isPending}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <LogOutIcon className="h-5 w-5 text-base-content opacity-80"/>
            )}
          </button>
        </div>

        {/* Mobile menu - slide down when open */}
        <div className={`lg:hidden absolute top-16 left-0 right-0 bg-base-200 border-b border-base-300 shadow-md transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-60 py-3' : 'max-h-0 py-0 overflow-hidden'
        }`}>
          <div className="container mx-auto px-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full bg-base-300">
                    <img
                      src={authUser?.profilePic}
                      alt="User Avatar"
                      rel="noreferrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://avatar.iran.liara.run/public/1.png";
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">{authUser?.fullName}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="size-2 rounded-full bg-success inline-block" />
                    Online
                  </p>
                </div>
              </div>
              
              <ThemeSelector />
            </div>
            
            <div className="divider my-1"></div>
            
            <div className="flex justify-between">
              <Link 
                to="/notifications" 
                className="btn btn-ghost btn-sm relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BellIcon className="h-5 w-5 mr-2" />
                Notifications
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold">
                    {notificationCount}
                  </div>
                )}
              </Link>
              
              <button 
                className="btn btn-ghost btn-sm text-error" 
                onClick={logoutMutation}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <LogOutIcon className="h-5 w-5 mr-2" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;