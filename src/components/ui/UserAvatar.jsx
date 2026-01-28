"use client"

import { useEffect, useState } from "react"

const UserAvatar = ({ 
  user, 
  size = "sm",
  className = "",
  onClick,
  showTooltip = false 
}) => {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl"
  };
  
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  // Get image URL from user object
  const getImageUrl = () => {
    if (!user) return null;
    
    // Check multiple possible image properties
    const imageSources = [
      user.photoURL,
      user.profileImage,
      user.avatar,
      user.imageUrl,
      user.profilePicture,
      user.picture,
      user.image
    ];
    
    return imageSources.find(src => src && typeof src === 'string' && src.trim() !== '');
  };
  
  const imageUrl = getImageUrl();
  
  // Get user initials for fallback
  const getInitials = () => {
    if (!user?.name) return "?";
    
    // Clean and split name
    const name = user.name.trim();
    if (name.length === 0) return "?";
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length >= 2) {
      // Get first and last initial
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    
    // Single name - get first 2 characters
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  };
  
  // Get background color based on name or email
  const getColorFromName = () => {
    if (!user) return 'bg-blue-500';
    
    const name = user.name || user.email || 'User';
    const colors = [
      'bg-blue-500', 
      'bg-green-500', 
      'bg-purple-500', 
      'bg-red-500', 
      'bg-yellow-500', 
      'bg-indigo-500',
      'bg-pink-500', 
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Create a simple hash from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const initials = getInitials();
  const bgColor = getColorFromName();
  const sizeClass = sizes[size] || sizes.sm;
  
  // Reset when user or image changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Show fallback if no image URL
    if (!imageUrl) {
      setShowFallback(true);
    } else {
      setShowFallback(false);
    }
  }, [imageUrl, user]);
  
  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    setShowFallback(true);
  };
  
  // Determine what to show
  const shouldShowFallback = showFallback || imageError || !imageLoaded;
  
  return (
    <div 
      className={`
        ${sizeClass} 
        rounded-full 
        overflow-hidden 
        flex 
        items-center 
        justify-center 
        flex-shrink-0 
        ${shouldShowFallback ? `${bgColor} text-white` : 'bg-gray-100'}
        ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
      title={showTooltip ? user?.name || user?.email || 'User' : undefined}
    >
      {imageUrl && !imageError ? (
        <>
          <img
            src={imageUrl}
            alt={user?.name || user?.email || "User"}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
            </div>
          )}
        </>
      ) : null}
      
      {/* Fallback with initials */}
      {shouldShowFallback && (
        <div className="flex items-center justify-center w-full h-full font-semibold select-none">
          {initials}
        </div>
      )}
    </div>
  );
};

// Optional: Add a group avatar component
const UserAvatarGroup = ({ 
  users = [], 
  max = 3,
  size = "sm",
  className = "",
  spacing = "-space-x-2"
}) => {
  if (!users.length) return null;
  
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  return (
    <div className={`flex items-center ${spacing} ${className}`}>
      {visibleUsers.map((user, index) => (
        <div key={index} className="relative">
          <UserAvatar 
            user={user} 
            size={size}
            className="border-2 border-white"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className={`
          ${sizes[size] || sizes.sm}
          rounded-full 
          bg-gray-200 
          border-2 
          border-white 
          flex 
          items-center 
          justify-center 
          text-xs 
          font-semibold 
          text-gray-700
        `}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { UserAvatar, UserAvatarGroup };
export default UserAvatar;