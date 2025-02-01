'use client';
import React, { useState, useEffect } from 'react';
import PermissionsTable from '@/components/PermissionTable';
import { fetchPermissions } from '@/app/api/permission/Permission';
import { useTranslations } from 'next-intl';
import Sidebar from '@/components/SideBar'; // Assuming you have Sidebar imported
import '@/style/Permissions.css';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [token] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTVkYjUwNmYtMmU2OS00ZDBjLWJlMDgtOTk4Yzc0NTYxNmJlIiwiZW1haWwiOiJ0cmFucXVvY3RodWFuMjAwM0BnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRodWFuIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzM3ODc2NTA1LCJleHAiOjE3Mzc4ODM3MDV9.n6XZU9bSSroqq2-b_nR93W2Q7oC3eJszgXKmjw1c2I0'); // Replace with your token logic
  const t = useTranslations('permission');

  // Fetch permissions on page load
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const data = await fetchPermissions(token);
        setPermissions(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    if (token) {
      getPermissions();
    }
  }, [token]);

  // Handlers for updating/deleting permissions
  const onPermissionUpdated = () => {
    fetchPermissions(token).then(data => setPermissions(data));
  };
  const onPermissionDeleted = () => {
    fetchPermissions(token).then(data => setPermissions(data));
  };
  const onPermissionAdded = () => {
    fetchPermissions(token).then(data => setPermissions(data));
  };

  return (
    <div className="page-container">
      {/* Sidebar Section */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="content-container">
        <h3 className="page-title">{t('title')}</h3>
        <PermissionsTable
          permissions={permissions}
          token={token}
          onPermissionUpdated={onPermissionUpdated}
          onPermissionDeleted={onPermissionDeleted}
          onPermissionAdded={onPermissionAdded}
        />
      </div>
    </div>
  );
};

export default PermissionsPage;
