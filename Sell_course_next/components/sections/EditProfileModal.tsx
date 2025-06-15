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
    phoneNumber: user.phoneNumber || undefined,
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
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [id]: undefined,
        }));
      } else if (/^\d{0,9}$/.test(value)) {
        const numValue = parseInt(value, 10);
        setFormData((prev) => ({
          ...prev,
          [id]: numValue,
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
        if (!/^9\d{8}$/.test(phoneStr)) {
          newErrors.phoneNumber =
            "Số điện thoại phải bắt đầu bằng số 9 và có đúng 9 chữ số";
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

  try {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
        <Card className="w-full max-w-[425px] mx-4 relative max-h-[90vh] overflow-y-auto">
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
                          width={64}
                          height={64}
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
                  <div className="col-span-3 relative">
                    <Select
                      defaultValue={formData.gender || ""}
                      onValueChange={handleGenderChange}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={4}
                        className="z-[60]"
                      >
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">
                          +84
                        </span>
                      </div>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={
                          formData.phoneNumber
                            ? formData.phoneNumber.toString()
                            : ""
                        }
                        onChange={handleInputChange}
                        className="pl-8"
                        placeholder="912345678"
                        pattern="9[0-9]{8}"
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 9 digits (e.g: +84 912345678)
                    </p>
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
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
  } catch (error) {
    console.error("EditProfileModal render error:", error);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-[425px] mx-4">
          <CardContent className="p-6">
            <p className="text-red-500">
              Error loading edit profile form. Please try again.
            </p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
