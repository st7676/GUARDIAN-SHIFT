import { useState } from 'react';

const ROLES = {
  REGULAR: 'regular',
  HEAD: 'head'
};

export function useRoleSelection(defaultRole = ROLES.REGULAR) {
  const [role, setRole] = useState(defaultRole);

  const isHeadNurse = role === ROLES.HEAD;

  return {
    role,
    setRole,
    isHeadNurse,
    ROLES
  };
}

export default useRoleSelection;
