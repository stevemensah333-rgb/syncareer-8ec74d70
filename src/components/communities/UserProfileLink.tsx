import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserRoute } from '@/hooks/useUserRoute';

interface UserProfileLinkProps {
  userId: string;
  displayName: string;
  className?: string;
}

export function UserProfileLink({ userId, displayName, className = '' }: UserProfileLinkProps) {
  const [route, setRoute] = useState(`/portfolio/${userId}`);

  useEffect(() => {
    const fetchRoute = async () => {
      const userRoute = await getUserRoute(userId);
      setRoute(userRoute);
    };
    fetchRoute();
  }, [userId]);

  return (
    <Link 
      to={route}
      className={className || "font-medium text-foreground hover:underline"}
    >
      {displayName}
    </Link>
  );
}
