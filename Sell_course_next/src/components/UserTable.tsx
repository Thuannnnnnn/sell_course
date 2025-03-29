"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { User } from "@/app/type/user/User";
import { useSession } from "next-auth/react";
import PermissionModal from "@/components/Permission/PermissionModal";
import {
  removePermission,
  updateUserProfile,
  banUser,
  fetchUsers,
} from "@/app/api/user/User";
import { useTranslations } from "next-intl";
const UserTable: React.FC = () => {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("user");
  const fetchAndSetUsers = useCallback(async () => {
    const token = session?.user?.token;
    if (!token) return;
    setLoading(true);
    try {
      const usersData = await fetchUsers(token);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    fetchAndSetUsers();
  }, [fetchAndSetUsers]);
  if (!session?.user?.role) {
    return null;
  }
  if (session.user.role !== "ADMIN") {
    return <div className="text-center mt-5">{t("noAccess")}</div>;
  }
  const handleOpenModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };
  const handleOpenEditModal = (user: User) => {
    setEditUser(user);
    setShowEditModal(true);
  };
  const handleEditUserChange = (field: keyof User, value: string) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };
  const handleSaveEdit = async () => {
    if (!session?.user.token || !editUser.user_id) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", editUser.user_id);
      if (editUser.email) formData.append("email", editUser.email);
      if (editUser.username) formData.append("username", editUser.username);
      if (editUser.role) formData.append("role", editUser.role);
      await updateUserProfile(formData, session.user.token);
      await fetchAndSetUsers();
      setShowEditModal(false);
      setEditUser({});
    } catch (error) {
      console.error("Error updating user:", error);
      alert(t("updateError"));
    } finally {
      setLoading(false);
    }
  };
  const handleRemovePermission = async (
    userId: string,
    permissionId: number
  ) => {
    if (!session?.user.token) return;
    try {
      setLoading(true);
      await removePermission(session.user.token, userId, permissionId);
      await fetchAndSetUsers();
    } catch (error) {
      console.error("Error removing permission:", error);
      alert(t("permissionError"));
    } finally {
      setLoading(false);
    }
  };
  const handleBanUser = async (userId: string, isBan: boolean) => {
    if (!session?.user.token) return;
    try {
      setLoading(true);
      await banUser(session.user.token, userId, isBan);
      await fetchAndSetUsers();
      alert(t(isBan ? "banSuccess" : "unbanSuccess"));
    } catch (error) {
      console.error("Error banning/unbanning user:", error);
      alert(t("banError"));
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <h2 className="text-center mb-4">{t("userManagement")}</h2>
          <Form.Control
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
            disabled={loading}
          />
          {loading && <div className="text-center">{t("loading")}</div>}
          {!loading && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>{t("email")}</th>
                  <th>{t("username")}</th>
                  <th>{t("role")}</th>
                  <th>{t("permissions")}</th>
                  <th>{t("status")}</th>
                  <th>{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                      {Array.isArray(user.permissions) &&
                      user.permissions.length > 0 ? (
                        <ul className="list-unstyled">
                          {user.permissions.map((p) => (
                            <li
                              key={p.id}
                              className="d-flex justify-content-between m-2 align-items-center"
                            >
                              {p.name}
                              <Button
                                variant="danger"
                                size="sm"
                                className="ms-2"
                                disabled={loading}
                                onClick={() =>
                                  handleRemovePermission(user.user_id, p.id)
                                }
                              >
                                {t("remove")}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>{t("noPermission")}</span>
                      )}
                    </td>
                    <td>
                      {user.isBan ? (
                        <span className="text-danger">{t("banned")}</span>
                      ) : (
                        <span className="text-success">{t("active")}</span>
                      )}
                    </td>
                    <td className="btn-action d-flex flex-column flex-md-row gap-1">
                      <Button
                        variant="primary"
                        onClick={() => handleOpenModal(user.user_id)}
                        disabled={loading}
                        className="me-2 w-100 md"
                      >
                        {t("addBtn")}
                      </Button>
                      {user.role !== "ADMIN" && (
                        <div className="d-flex flex-column flex-md-row gap-1">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenEditModal(user)}
                            disabled={loading}
                            className="me-2 w-100 md"
                          >
                            {t("edit")}
                          </Button>
                          <Button
                            variant={user.isBan ? "success" : "danger"}
                            onClick={() =>
                              handleBanUser(user.user_id, !user.isBan)
                            }
                            disabled={loading}
                            className="w-100 md"
                          >
                            {user.isBan ? t("unban") : t("ban")}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
      {selectedUserId && session?.user.token && (
        <PermissionModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
          token={session.user.token}
          onPermissionsAssigned={fetchAndSetUsers}
        />
      )}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("editUser")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t("email")}</Form.Label>
              <Form.Control
                type="email"
                value={editUser.email || ""}
                onChange={(e) => handleEditUserChange("email", e.target.value)}
                disabled={loading}
                readOnly
                className="opacity-50"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("username")}</Form.Label>
              <Form.Control
                type="text"
                value={editUser.username || ""}
                onChange={(e) =>
                  handleEditUserChange("username", e.target.value)
                }
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("role")}</Form.Label>
              <Form.Select
                value={editUser.role || ""}
                onChange={(e) => handleEditUserChange("role", e.target.value)}
                disabled={loading}
              >
                <option value="STAFF">{t("staff")}</option>
                <option value="CUSTOMER">{t("customer")}</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={loading}>
            {loading ? t("saving") : t("save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
export default UserTable;
