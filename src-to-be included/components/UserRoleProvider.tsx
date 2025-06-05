
import React, { useState, ReactNode } from 'react';
import { UserRoleContext, UserRole } from '../hooks/useUserRole';

interface UserRoleProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ 
  children, 
  defaultRole = 'primary-caregiver' 
}) => {
  const [userRole, setUserRole] = useState<UserRole>(defaultRole);

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export default UserRoleProvider;
