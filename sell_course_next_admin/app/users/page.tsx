"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  fetchAllUsers,
  updateUserAdmin,
  banUser,
  createUser,
  deleteUser,
} from "../api/user/users";
import { UserWithPermissions, UpdateUserData, BanUserData, CreateUserData } from "../types/users";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Edit, Trash2, UserCheck, UserX, Search, Calendar, Phone, User as UserIcon } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserWithPermissions | null;
  allRoles: string[];
}

// ADD THIS NEW INTERFACE
interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allRoles: string[];
}
interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allRoles: string[];
}
const ALLOWED_CREATION_ROLES = [
  // Removed 'ADMIN' to prevent creating new admin accounts
  "INSTRUCTOR",
  "CONTENTMANAGER",
  "MARKETINGMANAGER",
  "COURSEREVIEWER",
  "SUPPORT"
];

function CreateUserModal({
  open,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setUsername("");
      setEmail("");
      setPassword("");
      setGender("");
      setBirthDay("");
      setPhoneNumber("");
      setRole("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Username, email, and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const createData: CreateUserData = {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        gender: gender || undefined,
        birthDay: birthDay || undefined,
        phoneNumber: phoneNumber ? parseInt(phoneNumber) : undefined,
        role: role || undefined,
      };

      await createUser(createData, session.accessToken);
      toast.success("User created successfully!", {
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
        icon: '✅',
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err && typeof err === "object" && "message" in err)
        ? (err as { message?: string }).message || "Failed to create user."
        : "Failed to create user.";
      setError(msg);
      toast.error(msg, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="create-username">Username *</Label>
                <Input
                  id="create-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="create-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_specified">Not specified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-birthDay">Birth Date</Label>
                <Input
                  id="create-birthDay"
                  type="date"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="create-phoneNumber">Phone Number</Label>
                <Input
                  id="create-phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="create-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="create-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_CREATION_ROLES.map((roleOption: string) => (
                      <SelectItem key={roleOption} value={roleOption}>
                        {roleOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#513deb',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#4f46e5'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#513deb'; }}
                >
                  {loading ? "Creating..." : "Create Employee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function EditUserModal({
  open,
  onClose,
  onSuccess,
  user,
}: EditUserModalProps) {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && open) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setGender(user.gender || "");
      setBirthDay(user.birthDay || "");
      setPhoneNumber(user.phoneNumber ? String(user.phoneNumber) : "");
      setError("");
    } else if (!open) {
      setUsername("");
      setEmail("");
      setGender("");
      setBirthDay("");
      setPhoneNumber("");
      setError("");
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken || !user) return;
    if (!username.trim() || !email.trim()) {
      setError("Username and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updateData: UpdateUserData = {
        username: username.trim(),
        email: email.trim(),
        gender: gender || undefined,
        birthDay: birthDay || undefined,
        phoneNumber: phoneNumber || undefined,
      };

      await updateUserAdmin(user.user_id, updateData, session.accessToken);
      toast.success("User updated successfully!", {
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
        icon: '✅',
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err && typeof err === "object" && "message" in err)
        ? (err as { message?: string }).message || "Failed to update user."
        : "Failed to update user.";
      setError(msg);
      toast.error(msg, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="edit-gender">
                    <SelectValue placeholder="Select gender">
                      {gender === "male"
                        ? "Male"
                        : gender === "female"
                        ? "Female"
                        : gender === "other"
                        ? "Other"
                        : gender === "not_specified"
                        ? "Not specified"
                        : gender === "" ? "" : gender}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_specified">Not specified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-birthDay">Birth Date</Label>
                <Input
                  id="edit-birthDay"
                  type="date"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#513deb',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#513deb';
                    }
                  }}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  // Tabs: users (all users) vs employees (internal roles)
  const [activeTab, setActiveTab] = useState<'users' | 'employees'>("users");
  const employeeRoles = [
    "ADMIN",
    "INSTRUCTOR",
    "CONTENTMANAGER",
    "MARKETINGMANAGER",
    "COURSEREVIEWER",
    "SUPPORT",
  ];
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          setLoading(false);
          return;
        }
        const data = await fetchAllUsers(session.accessToken);
        setUsers(data);
      } catch {
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [session]);

  const handleDelete = async (user: UserWithPermissions) => {
    if (!session?.accessToken) return;

    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(user.user_id, session.accessToken);

      // Remove the deleted user from the local state
      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));

      toast.success("User deleted successfully!", {
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
        icon: '✅',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete user. Please try again.";
      toast.error(msg, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
        icon: '❌',
      });
    }
  };
  const handleBanToggle = async (user: UserWithPermissions) => {
    if (!session?.accessToken) return;
    const action = user.isBan ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const banData: BanUserData = { isBan: !user.isBan };
      await banUser(user.user_id, banData, session.accessToken);
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id
            ? { ...u, isBan: !u.isBan }
            : u
        )
      );
      toast.success(`User ${action}ned successfully!`, {
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
        icon: '✅',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : `Failed to ${action} user. Please try again.`;
      toast.error(msg, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
        icon: '❌',
      });
    }
  };

  const refreshUsers = async () => {
    if (!session?.accessToken) return;
    try {
      const data = await fetchAllUsers(session.accessToken);
      setUsers(data);
    } catch {
      setError("Failed to reload users.");
    }
  };

  const handleEdit = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const filteredUsers = users
    // Narrow by tab selection first
    .filter((user) =>
      activeTab === 'employees'
        ? employeeRoles.includes(user.role?.toUpperCase())
        : user.role?.toUpperCase() === 'USER'
    )
    .filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && !user.isBan) ||
        (statusFilter === "banned" && user.isBan);

      return matchesSearch && matchesRole && matchesStatus;
    });
  // Dynamic role list for filter dropdown
  const roleFilterOptions = activeTab === 'employees' ? employeeRoles : ['USER'];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const allRoles = Array.from(new Set(users.map((u: UserWithPermissions) => u.role).filter((role: string) => role !== "")));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b pb-2">
          {[{key:'users',label:'Users'},{key:'employees',label:'Employees'}].map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key as 'users' | 'employees'); setRoleFilter('all'); setStatusFilter('all'); setSearchTerm(''); }}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border transition-colors ${
                activeTab === t.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {activeTab === 'users' ? 'Users' : 'Employees'}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'users'
                ? 'View platform end-user accounts'
                : 'Manage internal employee / staff accounts.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'employees' && (
              <Button
                onClick={() => setShowCreateModal(true)}
                style={{ backgroundColor: '#513deb', color: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4f46e5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#513deb'; }}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Create Employee
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">Total: {filteredUsers.length}</Badge>
              <Badge variant="outline" className="text-sm">Active: {filteredUsers.filter(u => !u.isBan).length}</Badge>
              <Badge variant="outline" className="text-sm">Banned: {filteredUsers.filter(u => u.isBan).length}</Badge>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roleFilterOptions.map((roleOption: string) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                          ? "No users found matching your filters."
                          : "No users found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarImg || undefined} alt={user.username} />
                              <AvatarFallback className="text-xs">
                                {getUserInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.phoneNumber && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {user.phoneNumber}
                              </div>
                            )}
                            {user.gender && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <UserIcon className="h-3 w-3" />
                                {user.gender}
                              </div>
                            )}
                            {user.birthDay && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(user.birthDay)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isBan ? "destructive" : "default"}>
                            {user.isBan ? "Banned" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(user)}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {activeTab === 'employees' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(user)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleBanToggle(user)}
                              className={user.isBan ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                              title={user.isBan ? "Unban user" : "Ban user"}
                            >
                              {user.isBan ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                              <span className="sr-only">{user.isBan ? "Unban" : "Ban"}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users.
              </div>
            )}
          </div>
        )}
      </div>

      <EditUserModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={refreshUsers}
        user={selectedUser}
        allRoles={allRoles}
      />

      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refreshUsers}
        allRoles={allRoles}
      />
    </div>
  );
}