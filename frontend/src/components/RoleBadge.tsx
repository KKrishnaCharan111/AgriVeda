import React from 'react';
import type { UserRole } from '../types';
import { ShieldCheck, Tractor, Users, ShoppingBag, Briefcase } from 'lucide-react';

export const RoleBadge: React.FC<{ role: UserRole; isVerified?: boolean }> = ({ role, isVerified }) => {
  switch (role) {
    case 'farmer':
      return (
        <span className="badge badge-green">
          <Tractor size={12} />
          Farmer
        </span>
      );
    case 'labour':
      return (
        <span className="badge badge-amber">
          <Users size={12} />
          Labour
        </span>
      );
    case 'buyer':
      return (
        <span className="badge badge-blue">
          <Briefcase size={12} />
          Buyer
        </span>
      );
    case 'shop':
      return (
        <span className="badge badge-purple">
          <ShoppingBag size={12} />
          Agri Shop {isVerified && <ShieldCheck size={12} className="text-green-600" />}
        </span>
      );
    case 'admin':
      return (
        <span className="badge badge-red">
          <ShieldCheck size={12} />
          Admin
        </span>
      );
    default:
      return null;
  }
};
