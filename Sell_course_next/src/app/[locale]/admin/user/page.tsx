'use client';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import UserTable from '@/components/UserTable';
import { fetchUsers } from '@/app/api/user/User';
import { User } from '@/app/type/user/User';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/SideBar';
import '@/style/User.css';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const getUsers = async () => {
      const token = session?.user.token;
      if (!token) return;

      const usersData = await fetchUsers(token);
      setUsers(usersData);
      setLoading(false);
    };

    getUsers();
  }, [session]);
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };
  return (
    <div className="page-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="content-container">
        <h3 className="page-title">User List</h3>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <UserTable users={users} onUpdateUsers={handleUpdateUsers} />
        )}
      </div>
    </div>
  );
};
export default UsersPage;
