import { Table, Button } from 'react-bootstrap';
import { User } from '@/app/type/user/User';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import PermissionModal from '@/components/Permission/PermissionModal';
import { removePermission } from '@/app/api/user/User'; // Import hàm removePermission

interface UserTableProps {
    users: User[];
    onUpdateUsers: (updatedUsers: User[]) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUpdateUsers }) => {
    const { data: session } = useSession();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpenModal = (userId: string) => {
        setSelectedUserId(userId);
        setShowModal(true);
    };

    const handleRemovePermission = async (userId: string, permissionId: number) => {
        if (!session?.user.token) return;

        setLoading(true);

        try {
            await removePermission(session.user.token, userId, permissionId); // Gọi API removePermission

            // Cập nhật UI sau khi xóa thành công
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
                        <th>Email</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Permissions</th>
                        <th>Action</th>
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
                                            <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {p.name}
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    disabled={loading}
                                                    onClick={() => handleRemovePermission(user.user_id, p.id)}
                                                >
                                                    {loading ? 'Removing...' : 'Remove'}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>No permissions</span>
                                )}
                            </td>
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => handleOpenModal(user.user_id)}
                                >
                                    Add Permission
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
