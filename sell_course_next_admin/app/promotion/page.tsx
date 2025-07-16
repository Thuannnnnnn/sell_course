"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { fetchPromotions, deletePromotion, createPromotion, updatePromotion } from "../api/promotion/promotion";
import { fetchCourses } from "../api/courses/course";
import { Promotion } from "../types/promotion";
import { Course } from "../types/course";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Edit, Trash2, Plus, Search, Percent, Tag, Calendar } from "lucide-react";
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

interface AddPromotionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  courses: Course[];
  promotions: Promotion[];
}

interface EditPromotionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  promotion: Promotion | null;
  courses: Course[];
  promotions: Promotion[];
}

function toDatetimeLocal(dt: string | undefined) {
  if (!dt) return "";
  const date = new Date(dt);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function isDuplicateCode(code: string, courseId: string, promotions: Promotion[], excludeId?: string) {
  if (!code || !courseId) return false;
  return promotions.some(
    (p) =>
      p.id !== excludeId &&
      p.code.trim().toLowerCase() === code.trim().toLowerCase() &&
      // So sánh cả p.courseId và p.course?.courseId để chắc chắn
      (p.courseId === courseId || p.course?.courseId === courseId)
  );
}

function getAddPromotionError({ name, discount, code, courseId, startDate, endDate, promotions }: {
  name: string;
  discount: string;
  code: string;
  courseId: string;
  startDate: string;
  endDate: string;
  promotions: Promotion[];
}) {
  if (!name.trim() || !discount.trim() || !code.trim() || !courseId) {
    return "All fields are required.";
  }
  const discountNum = parseFloat(discount);
  if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
    return "Discount must be a number between 1 and 100.";
  }
  if (!startDate) {
    return "Start date is required.";
  }
  if (!endDate) {
    return "End date is required.";
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  if (start >= end) {
    return "End date must be after start date.";
  }
  if (end <= now) {
    return "End date must be in the future.";
  }
  if (start < now) {
    return "Start date cannot be in the past.";
  }
  if (isDuplicateCode(code, courseId, promotions)) {
    return "This code already exists for the selected course.";
  }
  return "";
}

function getEditPromotionError({ name, discount, code, courseId, startDate, endDate, promotions, promotion }: {
  name: string;
  discount: string;
  code: string;
  courseId: string;
  startDate: string;
  endDate: string;
  promotions: Promotion[];
  promotion: Promotion | null;
}) {
  if (!name.trim() || !discount.trim() || !code.trim() || !courseId) {
    return "All fields are required.";
  }
  const discountNum = parseFloat(discount);
  if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
    return "Discount must be a number between 1 and 100.";
  }
  if (!startDate) {
    return "Start date is required.";
  }
  if (!endDate) {
    return "End date is required.";
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  if (start >= end) {
    return "End date must be after start date.";
  }
  if (end <= now) {
    return "End date must be in the future.";
  }
  if (!promotion?.isPending && start < now) {
    return "Start date cannot be in the past for active or expired promotions.";
  }
  if (isDuplicateCode(code, courseId, promotions, promotion?.id)) {
    return "This code already exists for the selected course.";
  }
  return "";
}

function EditPromotionModal({
  open,
  onClose,
  onSuccess,
  promotion,
  courses,
  promotions,
}: EditPromotionModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("");
  const [code, setCode] = useState("");
  const [courseId, setCourseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (promotion && open) {
      setName(promotion.name || "");
      setDiscount(promotion.discount ? promotion.discount.toString() : "");
      setCode(promotion.code || "");
      setCourseId(promotion.course?.courseId || promotion.courseId || "");
      setStartDate(toDatetimeLocal(promotion.startDate));
      setEndDate(toDatetimeLocal(promotion.endDate));
      setError("");
    } else if (!open) {
      setName("");
      setDiscount("");
      setCode("");
      setCourseId("");
      setStartDate("");
      setEndDate("");
      setError("");
    }
  }, [promotion, open]);

  // Listen for code or courseId changes to check duplicate (exclude current promotion id)
  useEffect(() => {
    if (code && courseId && isDuplicateCode(code, courseId, promotions, promotion?.id)) {
      setError("This code already exists for the selected course.");
    } else if (error === "This code already exists for the selected course.") {
      setError("");
    }
  }, [code, courseId, promotions, promotion?.id, error]);

  useEffect(() => {
    const err = getEditPromotionError({ name, discount, code, courseId, startDate, endDate, promotions, promotion });
    setError(err);
  }, [name, discount, code, courseId, startDate, endDate, promotions, promotion]);

  useEffect(() => {
    console.log('[EditPromotionModal] Form state:', { name, discount, code, courseId, startDate, endDate, error });
  }, [name, discount, code, courseId, startDate, endDate, error]);

  const validateForm = () => {
    return !error;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    console.log('[EditPromotionModal] Code change:', newCode);
    setCode(newCode);
    if (newCode && courseId && isDuplicateCode(newCode, courseId, promotions, promotion?.id)) {
      setError("This code already exists for the selected course.");
    } else if (error) {
      setError("");
    }
  };

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    if (code && value && isDuplicateCode(code, value, promotions, promotion?.id)) {
      setError("This code already exists for the selected course.");
    } else if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken || !promotion) return;
    if (promotion.isExpired) {
      setError("Cannot update an expired promotion.");
      toast.error("Cannot update an expired promotion.");
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        discount: parseFloat(discount),
        code: code.trim(),
        courseId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      console.log("Updating promotion with payload:", payload);
      await updatePromotion(promotion.id, payload, session.accessToken);
      toast.success("Promotion updated successfully!");
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Update error:", err);
      const msg = err && typeof err === "object" && "message" in err
        ? (err as { message?: string }).message || "Failed to update promotion."
        : "Failed to update promotion.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !promotion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Edit Promotion</CardTitle>
            {promotion.isExpired && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                ⚠️ This promotion has expired and cannot be edited
              </div>
            )}
            {promotion.isPending && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                ⏰ This promotion is pending and will start on {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('vi-VN') : 'the scheduled date'}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="edit-name">Promotion Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={promotion.isExpired}
                />
              </div>
              <div>
                <Label htmlFor="edit-discount">Discount (%)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                  disabled={promotion.isExpired}
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Promotion Code</Label>
                <Input
                  id="edit-code"
                  value={code}
                  onChange={handleCodeChange}
                  required
                  disabled={promotion.isExpired}
                />
              </div>
              <div>
                <Label htmlFor="edit-courseId">Course</Label>
                {courses.length === 0 ? (
                  <div className="text-sm text-gray-500">No courses available</div>
                ) : (
                  <Select
                    key={`edit-course-${promotion?.id}-${courseId}`}
                    value={courseId}
                    onValueChange={handleCourseChange}
                    disabled={promotion.isExpired}
                  >
                    <SelectTrigger id="edit-courseId">
                      <SelectValue placeholder="Select course">
                        {courseId && courses.find(c => c.courseId === courseId)?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="edit-startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                    disabled={promotion.isExpired}
                    min={promotion.isPending ? undefined : new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="edit-endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                    disabled={promotion.isExpired}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
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
                    if (!loading && !promotion.isExpired && !error) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !promotion.isExpired && !error) {
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

function AddPromotionModal({
  open,
  onClose,
  onSuccess,
  courses,
  promotions,
}: AddPromotionModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("");
  const [code, setCode] = useState("");
  const [courseId, setCourseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setDiscount("");
      setCode("");
      setCourseId("");
      setStartDate("");
      setEndDate("");
      setError("");
    }
  }, [open]);

  // Listen for code or courseId changes to check duplicate
  useEffect(() => {
    console.log('[AddPromotionModal] Check duplicate:', { code, courseId, promotions });
    if (code && courseId) {
      const isDup = isDuplicateCode(code, courseId, promotions);
      console.log('isDuplicateCode:', isDup);
      if (isDup) {
        setError("This code already exists for the selected course.");
      } else if (error === "This code already exists for the selected course.") {
        setError("");
      }
    }
  }, [code, courseId, promotions, error]);

  useEffect(() => {
    const err = getAddPromotionError({ name, discount, code, courseId, startDate, endDate, promotions });
    setError(err);
  }, [name, discount, code, courseId, startDate, endDate, promotions]);

  useEffect(() => {
    console.log('[AddPromotionModal] Form state:', { name, discount, code, courseId, startDate, endDate, error });
  }, [name, discount, code, courseId, startDate, endDate, error]);

  const validateForm = () => {
    return !error;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (newCode && courseId && isDuplicateCode(newCode, courseId, promotions)) {
      setError("This code already exists for the selected course.");
    } else if (error) {
      setError("");
    }
  };

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    if (code && value && isDuplicateCode(code, value, promotions)) {
      setError("This code already exists for the selected course.");
    } else if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        discount: parseFloat(discount),
        code: code.trim(),
        courseId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      console.log("Creating promotion with payload:", payload);
      await createPromotion(payload, session.accessToken);
      toast.success("Promotion created successfully!");
      await onSuccess(); // Ensure promotions are refreshed before closing
      onClose();
    } catch (err: unknown) {
      console.error("Create error:", err);
      const msg = err && typeof err === "object" && "message" in err
        ? (err as { message?: string }).message || "Failed to create promotion."
        : "Failed to create promotion.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Add New Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="add-name">Promotion Name</Label>
                <Input
                  id="add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-discount">Discount (%)</Label>
                <Input
                  id="add-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-code">Promotion Code</Label>
                <Input
                  id="add-code"
                  value={code}
                  onChange={handleCodeChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-courseId">Course</Label>
                {courses.length === 0 ? (
                  <div className="text-sm text-gray-500">No courses available</div>
                ) : (
                  <Select
                    value={courseId}
                    defaultValue={courseId}
                    onValueChange={handleCourseChange}
                  >
                    <SelectTrigger id="add-courseId">
                      {courseId ? (
                        courses.find((c) => c.courseId === courseId)?.title || "Select course"
                      ) : (
                        <SelectValue placeholder="Select course" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="add-startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="add-startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="add-endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="add-endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || !!error}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{
                    backgroundColor:  '#513deb',
                    color: 'white',
                  }}
                  disabled={loading || !!error}
                  onMouseEnter={(e) => {
                    if (!loading && !error) {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !error) {
                      e.currentTarget.style.backgroundColor = '#513deb';
                    }
                  }}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PromotionManagementPage() {
  const { data: session, status } = useSession();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const loadPromotions = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const data = await fetchPromotions(session.accessToken);
      setPromotions(data);
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const loadCourses = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await fetchCourses(session.accessToken);
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.accessToken) {
      loadPromotions();
      loadCourses();
    }
  }, [session, status, loadPromotions, loadCourses]);

  const handleAdd = () => {
    if (courses.length === 0) {
      toast.error("No courses available. Please wait for courses to load.");
      return;
    }
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.accessToken) return;
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await deletePromotion(id, session.accessToken);
      toast.success("Promotion deleted successfully!");
      await loadPromotions();
    } catch {
      toast.error("Failed to delete promotion");
    }
  };

  const refreshPromotions = useCallback(async () => {
    await loadPromotions();
  }, [loadPromotions]);

  const handleEdit = (promotion: Promotion) => {
    const latest = promotions.find(p => p.id === promotion.id) || promotion;
    setEditingPromotion(latest);
  };

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && promotion.status === 'active') ||
      (statusFilter === 'expired' && promotion.isExpired) ||
      (statusFilter === 'pending' && promotion.isPending);
    return matchesSearch && matchesStatus;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
          <p className="text-gray-600 mt-2">Manage course promotions and discount codes</p>
        </div>
        <Button
          onClick={handleAdd}
          style={{
            backgroundColor: '#513deb',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4f46e5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#513deb';
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Promotion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Promotions</CardTitle>
              <div className="text-sm text-gray-500 mt-1">
                {promotions.filter(p => p.status === 'active').length} active • {promotions.filter(p => p.isPending).length} pending • {promotions.filter(p => p.isExpired).length} expired
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search promotions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'expired' | 'pending') => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={refreshPromotions}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No promotions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <TableRow
                      key={promotion.id}
                      className={promotion.isExpired ? "opacity-50 bg-gray-50" : promotion.isPending ? "opacity-75 bg-yellow-50" : ""}
                    >
                      <TableCell>
                        <div className={`font-medium ${promotion.isExpired ? "text-gray-500" : promotion.isPending ? "text-yellow-700" : ""}`}>
                          {promotion.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`font-mono ${promotion.isExpired ? "bg-gray-300 text-gray-600" : promotion.isPending ? "bg-yellow-200 text-yellow-800" : ""}`}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {promotion.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            promotion.isExpired ? "text-gray-500 border-gray-400" : 
                            promotion.isPending ? "text-yellow-600 border-yellow-600" :
                            "text-green-600 border-green-600"
                          }`}
                        >
                          <Percent className="w-3 h-3 mr-1" />
                          {promotion.discount}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${
                          promotion.isExpired ? "text-gray-400" : 
                          promotion.isPending ? "text-yellow-600" :
                          "text-gray-600"
                        }`}>
                          {promotion.course?.title || "Unknown Course"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${
                          promotion.isExpired ? "text-gray-400" : 
                          promotion.isPending ? "text-yellow-600" :
                          "text-gray-600"
                        }`}>
                          {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('vi-VN') : "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${
                          promotion.isExpired ? "text-gray-400" : 
                          promotion.isPending ? "text-yellow-600" :
                          "text-gray-600"
                        }`}>
                          {promotion.endDate ? new Date(promotion.endDate).toLocaleDateString('vi-VN') : "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative group">
                          <Badge 
                            variant={promotion.isExpired ? "secondary" : promotion.isPending ? "secondary" : "default"}
                            className={`${
                              promotion.isExpired ? "bg-red-100 text-red-800" : 
                              promotion.isPending ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}
                          >
                            {promotion.isExpired ? "Expired" : promotion.isPending ? "Pending" : "Active"}
                          </Badge>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {promotion.isExpired ? 
                              (promotion.endDate ? `Expired on ${new Date(promotion.endDate).toLocaleDateString('vi-VN')}` : 'Expired') :
                              promotion.isPending ?
                              (promotion.startDate ? `Starts on ${new Date(promotion.startDate).toLocaleDateString('vi-VN')}` : 'Pending') :
                              (promotion.startDate && promotion.endDate ? 
                                `Valid until ${new Date(promotion.endDate).toLocaleDateString('vi-VN')}` : 
                                'No expiration date')
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(promotion)}
                            disabled={promotion.isExpired || courses.length === 0}
                            className={promotion.isExpired || courses.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(promotion.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddPromotionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshPromotions}
        courses={courses}
        promotions={promotions}
      />

      <EditPromotionModal
        open={!!editingPromotion}
        onClose={() => setEditingPromotion(null)}
        onSuccess={refreshPromotions}
        promotion={editingPromotion}
        courses={courses}
        promotions={promotions}
      />
    </div>
  );
}