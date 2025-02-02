'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { fetchPermissions } from '@/app/api/permission/Permission';
import { AssignPermission } from '@/app/api/user/User';
import { NotificationManager } from 'react-notifications';

interface Permission {
    id: number;
    name: string;
    code: string;
    description: string | null;
    parentId: number | null;
    children: Permission[];
}

interface PermissionModalProps {
    show: boolean;
    handleClose: () => void;
    userId: string;
    token: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ show, handleClose, userId, token }) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [expandedPermissions, setExpandedPermissions] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            loadPermissions();
        }
    }, [show]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const data = await fetchPermissions(token);
            setPermissions(data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermissionSelection = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((permId) => permId !== id) : [...prev, id]
        );
    };

    const toggleExpandPermission = (id: number) => {
        setExpandedPermissions((prev) => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }
            return newExpanded;
        });
    };

    const handleAssignPermissions = async () => {
        try {
            await AssignPermission(token, userId, selectedPermissions);
            NotificationManager.success('Permissions assigned successfully!');
            handleClose();
        } catch (error) {
            console.error('Error assigning permissions:', error);
            NotificationManager.error('Failed to assign permissions');
        }
    };

    const renderPermissions = (permissions: Permission[], level = 0) => (
        permissions.map((perm) => (
            <div key={perm.id} style={{ marginLeft: level * 20, display: 'flex', alignItems: 'center' }}>
                {perm.children.length > 0 && (
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => toggleExpandPermission(perm.id)}
                        style={{ textDecoration: 'none' }}
                    >
                        {expandedPermissions.has(perm.id) ? '[-]' : '[+]'}
                    </Button>
                )}
                <Form.Check
                    type="checkbox"
                    label={perm.name}
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermissionSelection(perm.id)}
                />
                {expandedPermissions.has(perm.id) && perm.children.length > 0 && (
                    <div style={{ marginLeft: 20 }}>
                        {renderPermissions(perm.children, level + 1)}
                    </div>
                )}
            </div>
        ))
    );

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Assign Permissions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <Form>
                        {renderPermissions(permissions)}
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleAssignPermissions} disabled={loading}>
                    Assign Permissions
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PermissionModal;
