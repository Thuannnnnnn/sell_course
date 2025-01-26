'use client';
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updatePermission, deletePermission, addPermission } from '@/app/api/permission/Permission'; // Adjust import path for API calls
import { useTranslations } from 'next-intl';

// Interface for the Permission type
interface Permission {
    id: number;
    name: string;
    code: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    parentId: number | null;
    children: Permission[];
}

// Props type for PermissionsTable
interface PermissionsTableProps {
    permissions: Permission[];
    token: string;
    onPermissionUpdated: () => void;
    onPermissionDeleted: () => void;
    onPermissionAdded: () => void; // New callback for adding a permission
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({
    permissions,
    token,
    onPermissionUpdated,
    onPermissionDeleted,
    onPermissionAdded, // Callback for adding permission
}) => {
    const [expandedPermissions, setExpandedPermissions] = useState<Set<number>>(new Set());
    const [editPermission, setEditPermission] = useState<Permission | null>(null);
    const [deletePermissionData, setDeletePermissionData] = useState<Permission | null>(null);
    const [newPermission, setNewPermission] = useState<Permission>({
        id: 0,
        name: '',
        code: '',
        description: '',
        createdAt: '',
        updatedAt: '',
        parentId: null,
        children: [],
    }); // State for new permission
    const [showAddModal, setShowAddModal] = useState(false); // Modal visibility for adding a new permission
    const t = useTranslations('permission');

    // Toggle expansion of child permissions
    const togglePermission = (id: number) => {
        setExpandedPermissions((prevExpanded) => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }
            return newExpanded;
        });
    };

    // Render permissions with possible nested children
    const renderPermissions = (permissions: Permission[], level = 0) =>
        permissions.map((permission) => (
            <React.Fragment key={permission.id}>
                <tr>
                    <td style={{ paddingLeft: `${level * 20}px`, cursor: 'pointer' }} onClick={() => permission.children.length > 0 && togglePermission(permission.id)}>
                        {permission.children.length > 0 && (
                            <span>{expandedPermissions.has(permission.id) ? '[-] ' : '[+] '}</span>
                        )}
                        {permission.name}
                    </td>
                    <td>{permission.code}</td>
                    <td>{permission.description || 'N/A'}</td>
                    <td>{new Date(permission.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(permission.updatedAt).toLocaleDateString()}</td>
                    <td>
                        <div className="d-flex">
                            <Button variant="primary" size="sm" className="mr-2" onClick={() => setEditPermission(permission)}>
                                {t('edit')}
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setDeletePermissionData(permission)}>
                                {t('delete')}
                            </Button>
                        </div>
                    </td>
                </tr>
                {expandedPermissions.has(permission.id) && permission.children.length > 0 && renderPermissions(permission.children, level + 1)}
            </React.Fragment>
        ));

    // Handle closing the edit modal
    const closeEditModal = () => setEditPermission(null);

    // Handle closing the delete confirmation modal
    const closeDeleteModal = () => setDeletePermissionData(null);

    // Handle permission deletion
    const handleDelete = async () => {
        if (deletePermissionData) {
            try {
                await deletePermission(token, deletePermissionData.id);
                console.log(`Permission with ID: ${deletePermissionData.id} deleted`);
                onPermissionDeleted(); // Refresh the list of permissions after delete
            } catch (error) {
                console.error('Error deleting permission:', error);
            }
        }
        closeDeleteModal();
    };

    // Handle permission edit
    const handleEdit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent form submission
        if (editPermission) {
            const permissionData = {
                id: editPermission.id,
                name: editPermission.name,
                code: editPermission.code,
                parentId: editPermission.parentId ?? 0,
                description: editPermission.description || '',
            };
            try {
                await updatePermission(token, permissionData);
                console.log(`Permission with ID: ${editPermission.id} updated`);
                onPermissionUpdated();
            } catch (error) {
                console.error('Error updating permission:', error);
            }
        }
        closeEditModal();
    };

    // Handle new permission submission
    const handleAddPermission = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const permissionData = {
                name: newPermission.name,
                code: newPermission.code,
                parentId: newPermission.parentId ?? 0,
                description: newPermission.description || '',
            };
            await addPermission(token, permissionData); // Call add API
            console.log('New permission added');
            onPermissionAdded(); // Refresh the list of permissions after adding
            setShowAddModal(false); // Close the modal
        } catch (error) {
            console.error('Error adding permission:', error);
        }
    };

    return (
        <div>
            <Button variant="success" onClick={() => setShowAddModal(true)} className="mb-3">
                {t('addPermission')}
            </Button>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>{t('name')}</th>
                        <th>{t('code')}</th>
                        <th>{t('description')}</th>
                        <th>{t('createdAt')}</th>
                        <th>{t('updatedAt')}</th>
                        <th>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>{renderPermissions(permissions)}</tbody>
            </table>

            {/* Add Permission Modal */}
            {showAddModal && (
                <Modal show={true} onHide={() => setShowAddModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('addPermission')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddPermission}>
                            <Form.Group controlId="newPermissionName">
                                <Form.Label>{t('name')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newPermission.name}
                                    onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="newPermissionCode">
                                <Form.Label>{t('code')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newPermission.code}
                                    onChange={(e) => setNewPermission({ ...newPermission, code: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="newPermissionDescription">
                                <Form.Label>{t('description')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newPermission.description || ''}
                                    onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="newPermissionParentId">
                                <Form.Label>{t('parent')}</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={newPermission.parentId || ''}
                                    onChange={(e) =>
                                        setNewPermission({
                                            ...newPermission,
                                            parentId: e.target.value === '' ? null : parseInt(e.target.value),
                                        })
                                    }
                                >
                                    <option value="">{t('none')}</option>
                                    {permissions
                                        .filter((permission) => permission.id !== newPermission.id) // Exclude current permission from being selected as parent
                                        .map((permission) => (
                                            <option key={permission.id} value={permission.id}>
                                                {permission.name}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                                {t('cancel')}
                            </Button>
                            <Button variant="primary" type="submit">
                                {t('save')}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            {/* Edit Modal */}
            {editPermission && (
                <Modal show={true} onHide={closeEditModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('editPermission')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEdit}>
                            <Form.Group controlId="editPermissionName">
                                <Form.Label>{t('name')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editPermission.name}
                                    onChange={(e) => setEditPermission({ ...editPermission, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="editPermissionCode">
                                <Form.Label>{t('code')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editPermission.code}
                                    onChange={(e) => setEditPermission({ ...editPermission, code: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="editPermissionDescription">
                                <Form.Label>{t('description')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editPermission.description || ''}
                                    onChange={(e) => setEditPermission({ ...editPermission, description: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="editPermissionParentId">
                                <Form.Label>{t('parent')}</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={editPermission.parentId || ''}
                                    onChange={(e) =>
                                        setEditPermission({
                                            ...editPermission,
                                            parentId: e.target.value === '' ? null : parseInt(e.target.value),
                                        })
                                    }
                                >
                                    <option value="">{t('none')}</option>
                                    {permissions
                                        .filter((permission) => permission.id !== editPermission.id)
                                        .map((permission) => (
                                            <option key={permission.id} value={permission.id}>
                                                {permission.name}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                            <Button variant="secondary" onClick={closeEditModal}>
                                {t('cancel')}
                            </Button>
                            <Button variant="primary" type="submit">
                                {t('save')}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletePermissionData && (
                <Modal show={true} onHide={closeDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('confirmDelete')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{t('deleteConfirmation')}</p>
                        <Button variant="secondary" onClick={closeDeleteModal}>
                            {t('cancel')}
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            {t('delete')}
                        </Button>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
};

export default PermissionsTable;
