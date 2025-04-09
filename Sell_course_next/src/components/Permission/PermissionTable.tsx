"use client";
import React, { useState, useMemo } from "react";
import { Modal, Button, Form, Pagination } from "react-bootstrap";
import {
  updatePermission,
  deletePermission,
  addPermission,
} from "@/app/api/permission/Permission";
import { useTranslations } from "next-intl";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { Table } from "react-bootstrap";
import "@/style/Permissions.css";

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

interface PermissionsTableProps {
  permissions: Permission[];
  token: string;
  onPermissionUpdated: () => void;
  onPermissionDeleted: () => void;
  onPermissionAdded: () => void;
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({
  permissions,
  token,
  onPermissionUpdated,
  onPermissionDeleted,
  onPermissionAdded,
}) => {
  const [expandedPermissions, setExpandedPermissions] = useState<Set<number>>(
    new Set()
  );
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [deletePermissionData, setDeletePermissionData] =
    useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState<Permission>({
    id: 0,
    name: "",
    code: "",
    description: "",
    createdAt: "",
    updatedAt: "",
    parentId: null,
    children: [],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  // New states for filter, sort, and pagination
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Permission>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const t = useTranslations("permission");

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

  // Filter, sort, and paginate permissions
  const processedPermissions = useMemo(() => {
    let result = [...permissions];

    // Filter
    if (filter) {
      const filterLower = filter.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(filterLower) ||
          p.code.toLowerCase().includes(filterLower) ||
          (p.description && p.description.toLowerCase().includes(filterLower))
      );
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return result;
  }, [permissions, filter, sortField, sortOrder]);

  // Pagination
  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPermissions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPermissions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedPermissions.length / itemsPerPage);

  const handleSort = (field: keyof Permission) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderPermissions = (perms: Permission[], level = 0) =>
    perms.map((permission) => (
      <React.Fragment key={permission.id}>
        <tr>
          <td
            className={`permission-name permission-name-level-${level}`}
            onClick={() =>
              permission.children.length > 0 && togglePermission(permission.id)
            }
          >
            {permission.children.length > 0 && (
              <span>
                {expandedPermissions.has(permission.id) ? "[-] " : "[+] "}
              </span>
            )}
            {permission.name}
          </td>
          <td>{permission.code}</td>
          <td>{permission.description || "N/A"}</td>
          <td>{new Date(permission.createdAt).toLocaleDateString()}</td>
          <td>{new Date(permission.updatedAt).toLocaleDateString()}</td>
          <td>
            <div className="permission-actions">
              <Button
                variant="primary"
                size="sm"
                className="btn"
                onClick={() => setEditPermission(permission)}
              >
                {t("edit")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="btn"
                onClick={() => setDeletePermissionData(permission)}
              >
                {t("delete")}
              </Button>
            </div>
          </td>
        </tr>
        {expandedPermissions.has(permission.id) &&
          permission.children.length > 0 &&
          renderPermissions(permission.children, level + 1)}
      </React.Fragment>
    ));

  const closeEditModal = () => setEditPermission(null);
  const closeDeleteModal = () => setDeletePermissionData(null);

  const handleDelete = async () => {
    if (deletePermissionData) {
      try {
        await deletePermission(token, deletePermissionData.id);
        console.log(`Permission with ID: ${deletePermissionData.id} deleted`);
        onPermissionDeleted();
        createNotification("success", t("permissionDeletedSuccess"))();
      } catch (error) {
        console.error("Error deleting permission:", error);
        createNotification("error", t("permissionDeletedError"))();
      }
    }
    closeDeleteModal();
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editPermission) {
      const permissionData = {
        id: editPermission.id,
        name: editPermission.name,
        code: editPermission.code,
        parentId: editPermission.parentId ?? 0,
        description: editPermission.description || "",
      };
      try {
        await updatePermission(token, permissionData);
        console.log(`Permission with ID: ${editPermission.id} updated`);
        onPermissionUpdated();
        createNotification("success", t("permissionUpdatedSuccess"))();
      } catch (error) {
        console.error("Error updating permission:", error);
        createNotification("error", t("permissionUpdatedError"))();
      }
    }
    closeEditModal();
  };

  const handleAddPermission = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const permissionData = {
        name: newPermission.name,
        code: newPermission.code,
        parentId: newPermission.parentId ?? 0,
        description: newPermission.description || "",
      };
      await addPermission(token, permissionData);
      console.log("New permission added");
      onPermissionAdded();
      createNotification("success", t("permissionAddedSuccess"))();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding permission:", error);
      createNotification("error", t("permissionAddedError"))();
    }
  };

  const createNotification = (
    type: "info" | "success" | "warning" | "error",
    message: string
  ) => {
    return () => {
      switch (type) {
        case "info":
          NotificationManager.info(message || "Info message");
          break;
        case "success":
          NotificationManager.success(message || "Success!");
          break;
        case "warning":
          NotificationManager.warning(message || "Warning!", 3000);
          break;
        case "error":
          NotificationManager.error(message || "Error occurred", 5000);
          break;
      }
    };
  };

  return (
    <div>
      <div className="table-controls" style={{ marginBottom: "1rem" }}>
        <Button
          variant="success"
          onClick={() => setShowAddModal(true)}
          className="add-modal-button"
          style={{ marginRight: "1rem" }}
        >
          {t("addPermission")}
        </Button>
        <Form.Control
          type="text"
          placeholder={t("filterPlaceholder")}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "200px",
            display: "inline-block",
            marginBottom: "1.1rem",
          }}
        />
      </div>

      <Table striped>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer" }}
            >
              {t("name")}{" "}
              {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("code")}
              style={{ cursor: "pointer" }}
            >
              {t("code")}{" "}
              {sortField === "code" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("description")}
              style={{ cursor: "pointer" }}
            >
              {t("description")}{" "}
              {sortField === "description" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("createdAt")}
              style={{ cursor: "pointer" }}
            >
              {t("createdAt")}{" "}
              {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("updatedAt")}
              style={{ cursor: "pointer" }}
            >
              {t("updatedAt")}{" "}
              {sortField === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>{renderPermissions(paginatedPermissions)}</tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      {showAddModal && (
        <Modal show={true} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t("addPermission")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddPermission}>
              <Form.Group controlId="newPermissionName">
                <Form.Label>{t("name")}</Form.Label>
                <Form.Control
                  type="text"
                  value={newPermission.name}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="newPermissionCode">
                <Form.Label>{t("code")}</Form.Label>
                <Form.Control
                  type="text"
                  value={newPermission.code}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, code: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="newPermissionDescription">
                <Form.Label>{t("description")}</Form.Label>
                <Form.Control
                  type="text"
                  value={newPermission.description || ""}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="newPermissionParentId">
                <Form.Label>{t("parent")}</Form.Label>
                <Form.Control
                  as="select"
                  value={newPermission.parentId || ""}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      parentId:
                        e.target.value === "" ? null : parseInt(e.target.value),
                    })
                  }
                >
                  <option value="">{t("none")}</option>
                  {permissions
                    .filter((permission) => permission.id !== newPermission.id)
                    .map((permission) => (
                      <option key={permission.id} value={permission.id}>
                        {permission.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              <Button
                variant="secondary"
                className="modal-button"
                onClick={() => setShowAddModal(false)}
              >
                {t("cancel")}
              </Button>
              <Button variant="primary" className="modal-button" type="submit">
                {t("save")}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {editPermission && (
        <Modal show={true} onHide={closeEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>{t("editPermission")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEdit}>
              <Form.Group controlId="editPermissionName">
                <Form.Label>{t("name")}</Form.Label>
                <Form.Control
                  type="text"
                  value={editPermission.name}
                  onChange={(e) =>
                    setEditPermission({
                      ...editPermission,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editPermissionCode">
                <Form.Label>{t("code")}</Form.Label>
                <Form.Control
                  type="text"
                  value={editPermission.code}
                  onChange={(e) =>
                    setEditPermission({
                      ...editPermission,
                      code: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editPermissionDescription">
                <Form.Label>{t("description")}</Form.Label>
                <Form.Control
                  type="text"
                  value={editPermission.description || ""}
                  onChange={(e) =>
                    setEditPermission({
                      ...editPermission,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editPermissionParentId">
                <Form.Label>{t("parent")}</Form.Label>
                <Form.Control
                  as="select"
                  value={editPermission.parentId || ""}
                  onChange={(e) =>
                    setEditPermission({
                      ...editPermission,
                      parentId:
                        e.target.value === "" ? null : parseInt(e.target.value),
                    })
                  }
                >
                  <option value="">{t("none")}</option>
                  {permissions
                    .filter((permission) => permission.id !== editPermission.id)
                    .map((permission) => (
                      <option key={permission.id} value={permission.id}>
                        {permission.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              <Button
                variant="secondary"
                className="modal-button"
                onClick={closeEditModal}
              >
                {t("cancel")}
              </Button>
              <Button variant="primary" className="modal-button" type="submit">
                {t("save")}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {deletePermissionData && (
        <Modal show={true} onHide={closeDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>{t("confirmDelete")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t("deleteConfirmation")}</p>
            <Button
              variant="secondary"
              className="modal-button"
              onClick={closeDeleteModal}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              className="modal-button"
              onClick={handleDelete}
            >
              {t("delete")}
            </Button>
          </Modal.Body>
        </Modal>
      )}

      <NotificationContainer />
    </div>
  );
};

export default PermissionsTable;
