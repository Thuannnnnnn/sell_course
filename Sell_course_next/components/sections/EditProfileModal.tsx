import { useState, FormEvent, ChangeEvent } from "react";
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
import { Loader2 } from "lucide-react";
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
    phoneNumber: user.phoneNumber !== null ? user.phoneNumber : undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
          [id]: value ? parseInt(value, 10) : undefined,
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
      const phoneStr = formData.phoneNumber.toString();
      if (phoneStr.trim() !== "") {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-[425px] mx-4">
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>
            Update your profile information here. Click save when you&apos;re
            done.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-right">Avatar</div>
                <div className="col-span-3">
                  {avatarPreview && (
                    <div className="mb-2">
                      <Image
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-right">Username</div>
                <div className="col-span-3">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="3-50 characters"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-right">Gender</div>
                <div className="col-span-3">
                  <Select
                    defaultValue={formData.gender || ""}
                    onValueChange={handleGenderChange}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-right">Birthday</div>
                <div className="col-span-3">
                  <Input
                    id="birthDay"
                    type="date"
                    value={formData.birthDay || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.birthDay && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.birthDay}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-right">Phone</div>
                <div className="col-span-3">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Enter your phone number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={15}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {generalError && (
              <div className="w-full text-center">
                <p className="text-red-500 text-sm">{generalError}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 w-full">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
