'use client';

import React, { useEffect, useState } from 'react';
import PermissionsTable from '@/components/PermissionTable';
import { fetchPermissions } from '@/app/api/permission/Permission'
import { useTranslations } from 'next-intl';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState('');
  const t = useTranslations('permission');
  useEffect(() => {
    const getData = async () => {
      try {
        setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTVkYjUwNmYtMmU2OS00ZDBjLWJlMDgtOTk4Yzc0NTYxNmJlIiwiZW1haWwiOiJ0cmFucXVvY3RodWFuMjAwM0BnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRodWFuIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzM3ODczMjgyLCJleHAiOjE3Mzc4ODA0ODJ9.X26Vzy4CNJbutm11Jdi0q8y2lvrir6RoMwZK87WnOGA');
        const data = await fetchPermissions(token);
        setPermissions(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    getData();
  }, [token]);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">{t('title')}</h1>
      <PermissionsTable permissions={permissions} />
    </div>
  );
};

export default PermissionsPage;
