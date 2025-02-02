'use client';
import React, { useState, useEffect } from 'react';
import PermissionsTable from '@/components/Permission/PermissionTable';
import { fetchPermissions } from '@/app/api/permission/Permission';
import { useTranslations } from 'next-intl';
import Sidebar from '@/components/SideBar'; // Assuming you have Sidebar imported
import '@/style/Permissions.css';
import { useSession } from 'next-auth/react';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const t = useTranslations('permission');
  const { data: session } = useSession();

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const token = session?.user.token;
        if (!token) {
          return;
        }
        const data = await fetchPermissions(token);
        setPermissions(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    if (session) {
      getPermissions();
    }
  }, [session]);

  const onPermissionUpdated = async () => {
    const token = session?.user.token;
    if (token) {
      const data = await fetchPermissions(token);
      setPermissions(data);
    }
  };

  const onPermissionDeleted = async () => {
    const token = session?.user.token;
    if (token) {
      const data = await fetchPermissions(token);
      setPermissions(data);
    }
  };

  const onPermissionAdded = async () => {
    const token = session?.user.token;
    if (token) {
      const data = await fetchPermissions(token);
      setPermissions(data);
    }
  };

  return (
    <div className="page-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="content-container">
        <h3 className="page-title">{t('title')}</h3>
        <PermissionsTable
          permissions={permissions}
          token={session?.user.token || ''}
          onPermissionUpdated={onPermissionUpdated}
          onPermissionDeleted={onPermissionDeleted}
          onPermissionAdded={onPermissionAdded}
        />
      </div>
    </div>
  );
};

export default PermissionsPage;