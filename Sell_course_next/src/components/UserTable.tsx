import { Table, Button } from 'react-bootstrap';
import { User } from '@/app/type/user/User';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import PermissionModal from '@/components/Permission/PermissionModal';
import { removePermission } from '@/app/api/user/User';
import { useTranslations } from 'next-intl';

interface UserTableProps {
    users: User[];
    onUpdateUsers: (updatedUsers: User[]) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUpdateUsers }) => {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('user');
  const handleOpenModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleRemovePermission = async (userId: string, permissionId: number) => {
    if (!session?.user.token) return;

    setLoading(true);

    try {
      await removePermission(session.user.token, userId, permissionId);
      const updatedUsers = users.map(user =>
        user.user_id === userId
          ? { ...user, permissions: user.permissions.filter(p => p.id !== permissionId) }
          : user
      );

      onUpdateUsers(updatedUsers);
    } catch (error) {
      console.error('Error removing permission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('email')}</th>
            <th>{t('username')}</th>
            <th>{t('role')}</th>
            <th>{t('permissions')}</th>
            <th>{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                {user.permissions.length > 0 ? (
                  <ul>
                    {user.permissions.map((p) => (
                      <li key={p.id} className={'li-table-user'}>
                        {p.name}
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={loading}
                          onClick={() => handleRemovePermission(user.user_id, p.id)}
                        >
                          {loading ? t('removing') : t('remove')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>{t('noPermisssion')}</span>
                )}
              </td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => handleOpenModal(user.user_id)}
                >
                  {t('addBtn')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selectedUserId && session?.user.token && (
        <PermissionModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          userId={selectedUserId}
          token={session.user.token}
        />
      )}
    </>
  );
};

export default UserTable;
