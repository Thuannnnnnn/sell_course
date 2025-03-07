'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { fetchPermissions } from '@/app/api/permission/Permission';
import { AssignPermission } from '@/app/api/user/User';
import { NotificationManager } from 'react-notifications';
import '../../style/PermissionModal.css';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('permission'); // Hook for translations

  useEffect(() => {
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
    if (show) {
      loadPermissions();
    }
  }, [show, token]);

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
      NotificationManager.success(t('assignPermissionsSuccess')); // Use translation for success message
      handleClose();
    } catch (error) {
      console.error('Error assigning permissions:', error);
      NotificationManager.error(t('assignPermissionsFail')); // Use translation for error message
    }
  };

  const renderPermissions = (permissions: Permission[], level = 0) => (
    permissions.map((perm) => (
      <div key={perm.id} className={`permission-container level-${level}`}>
        {perm.children.length > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => toggleExpandPermission(perm.id)}
            className="expand-button"
          >
            {expandedPermissions.has(perm.id) ? '[-]' : '[+]'}
          </Button>
        )}
        <Form.Check
          type="checkbox"
          label={perm.name}
          checked={selectedPermissions.includes(perm.id)}
          onChange={() => togglePermissionSelection(perm.id)}
          className="permission-checkbox"
        />
        {expandedPermissions.has(perm.id) && perm.children.length > 0 && (
          <div className="permission-indent">
            {renderPermissions(perm.children, level + 1)}
          </div>
        )}
      </div>
    ))
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('assignPermissions')}</Modal.Title> {/* Use translation */}
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="spinner-container">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form>
            {renderPermissions(permissions)}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>{t('cancel')}</Button> {/* Use translation */}
        <Button variant="primary" onClick={handleAssignPermissions} disabled={loading} className="modal-footer-button">
          {t('assignPermissions')} {/* Use translation */}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermissionModal;
