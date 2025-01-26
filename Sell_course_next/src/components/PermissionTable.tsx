import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

// Interface for the Permission type
interface Permission {
    id: number;
    name: string;
    code: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    children: Permission[];
}

// Props type for PermissionsTable
interface PermissionsTableProps {
    permissions: Permission[];
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({ permissions }) => {
    const [expandedPermissions, setExpandedPermissions] = useState<Set<number>>(new Set());
    const [editPermission, setEditPermission] = useState<Permission | null>(null);
    const [deletePermission, setDeletePermission] = useState<Permission | null>(null);
    const t = useTranslations('permission');
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
                            <Button variant="danger" size="sm" onClick={() => setDeletePermission(permission)}>
                                {t('delete')}
                            </Button>
                        </div>
                    </td>
                </tr>
                {expandedPermissions.has(permission.id) && permission.children.length > 0 && renderPermissions(permission.children, level + 1)}
            </React.Fragment>
        ));
    const closeEditModal = () => setEditPermission(null);
    const closeDeleteModal = () => setDeletePermission(null);
    const handleDelete = () => {
        if (deletePermission) {
            console.log(`Deleting permission with ID: ${deletePermission.id}`);
        }
        closeDeleteModal();
    };


    const handleEdit = () => {
        if (editPermission) {
            console.log(`Editing permission with ID: ${editPermission.id}`);
        }
        closeEditModal();
    };

    return (
        <div>
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
            {editPermission && (
                <Modal show={true} onHide={closeEditModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('editPermission')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="editPermissionName">
                                <Form.Label>{t('name')}</Form.Label>
                                <Form.Control type="text" value={editPermission.name} readOnly />
                            </Form.Group>
                            <Form.Group controlId="editPermissionCode">
                                <Form.Label>{t('code')}</Form.Label>
                                <Form.Control type="text" value={editPermission.code} readOnly />
                            </Form.Group>
                            <Form.Group controlId="editPermissionDescription">
                                <Form.Label>{t('description')}</Form.Label>
                                <Form.Control type="text" value={editPermission.description || ''} readOnly />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeEditModal}>
                            {t('cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleEdit}>
                            {t('save')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            {deletePermission && (
                <Modal show={true} onHide={closeDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('confirmDelete')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{t('confirmDeleteMessage', { permissionName: deletePermission.name })}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeDeleteModal}>
                            {t('cancel')}
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            {t('confirm')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default PermissionsTable;
