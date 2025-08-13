import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { updateUserProfile } from "@/app/api/profile/profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, X, User, Phone, Calendar, Upload, Camera } from "lucide-react";
import {
  EditProfileModalProps,
  UpdateProfileRequest,
} from "@/app/types/profile/editProfile";
import Image from "next/image";

export function EditProfileModal({
  open,
  onClose,
  user,
  token,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarImg
  );
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    username: user.username,
    gender: user.gender || undefined,
    birthDay: user.birthDay || undefined,
    phoneNumber: user.phoneNumber || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState(false);

  // Cleanup function to revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setGeneralError("Image file must be smaller than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setGeneralError("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      setAvatarFile(file);
      setGeneralError(null);
      setImageLoading(true);
      
      // Use URL.createObjectURL for better performance
      const previewUrl = URL.createObjectURL(file);
      
      // Simulate loading for better UX
      setTimeout(() => {
        setAvatarPreview(previewUrl);
        setImageLoading(false);
      }, 500);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "phoneNumber") {
      // If empty, allow it
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [id]: undefined,
        }));
      } else if (/^\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
      } else {
        return;
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }

    // Clear error for this field
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 50) {
      newErrors.username = "Username must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9 _.-]+$/.test(formData.username)) {
      newErrors.username = "Username contains invalid characters";
    }

    if (formData.phoneNumber !== undefined && formData.phoneNumber !== null) {
      const phoneStr = formData.phoneNumber.trim();
      if (phoneStr !== "") {
        if (!/^[0-9]+$/.test(phoneStr)) {
          newErrors.phoneNumber = "Phone number must contain only digits";
        } else if (phoneStr.length < 9 || phoneStr.length > 15) {
          newErrors.phoneNumber =
            "Phone number must be between 9 and 15 digits";
        }
      }
    }

    if (formData.birthDay) {
      const birthDate = new Date(formData.birthDay);
      const today = new Date();

      if (isNaN(birthDate.getTime())) {
        newErrors.birthDay = "Please enter a valid date";
      } else {
        if (birthDate > today) {
          newErrors.birthDay = "Birthday cannot be in the future";
        }

        const maxAge = new Date();
        maxAge.setFullYear(today.getFullYear() - 120);
        if (birthDate < maxAge) {
          newErrors.birthDay = "Please enter a reasonable birth date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [generalError, setGeneralError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = await updateUserProfile(
        token,
        formData,
        avatarFile || undefined
      );
      onProfileUpdated(updatedProfile);
      
      // Cleanup object URL before closing
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (error instanceof Error) {
        setGeneralError(
          error.message || "Failed to update profile. Please try again."
        );
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Cleanup object URL when closing modal
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    onClose();
  };

  const clearAvatar = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(user.avatarImg);
    
    // Clear the file input
    const fileInput = document.getElementById('avatar') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-0 m-0">
      <Card className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto shadow-2xl border-0 bg-white animate-in slide-in-from-bottom-4 duration-300 sm:max-h-none">
        <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">Edit Profile</CardTitle>
          <CardDescription className="text-gray-600 mt-1 text-sm">
            Update your personal information and avatar
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={onSubmit}>
          <CardContent className="p-5 space-y-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-3 border-gray-200 overflow-hidden bg-gray-50 relative">
                  {imageLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  ) : avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover transition-all duration-300"
                      unoptimized={avatarPreview.startsWith('blob:')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Camera className="w-3 h-3" />
                </label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-700">Profile Picture</p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP • Max 5MB
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-blue-500" />
                  Username
                </label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <X className="w-3 h-3" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-blue-500" />
                  Gender
                </label>
                <Select
                  defaultValue={formData.gender || ""}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" className="cursor-pointer">👨 Male</SelectItem>
                    <SelectItem value="female" className="cursor-pointer">👩 Female</SelectItem>
                    <SelectItem value="other" className="cursor-pointer">🏳️‍⚧️ Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birthday */}
              <div className="space-y-1">
                <label htmlFor="birthDay" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Birthday
                </label>
                <Input
                  id="birthDay"
                  type="date"
                  value={formData.birthDay || ""}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                />
                {errors.birthDay && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <X className="w-3 h-3" />
                    {errors.birthDay}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={15}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <X className="w-3 h-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 bg-gray-50 rounded-b-lg">
            {generalError && (
              <div className="w-full mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center flex items-center justify-center gap-1">
                  <X className="w-4 h-4" />
                  {generalError}
                </p>
              </div>
            )}
            <div className="flex gap-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1 py-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 py-2 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                style={{ 
                  backgroundColor: isLoading ? '#9ca3af' : '#513deb'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#513deb';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
