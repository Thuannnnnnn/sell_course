"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Card, CardContent } from "../../../../components/ui/card";
import Image from "next/image";
import { Category } from "app/types/category";
import { CourseStatus } from "app/types/course.d";
import { fetchCategories } from "app/api/categories/category";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { fetchCourseById, updateCourse } from "app/api/courses/course";

const LEVELS = [
  { id: 1, name: "Beginner" },
  { id: 2, name: "Intermediate" },
  { id: 3, name: "Advanced" },
];

const isBrowser = typeof window !== "undefined";

const formSchema = z.object({
  title: z.string().min(3),
  short_description: z.string().min(10),
  description: z.string().min(50),
  duration: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  videoIntro: isBrowser
    ? z.instanceof(FileList).optional()
    : z.any().optional(),
  thumbnail: isBrowser ? z.instanceof(FileList).optional() : z.any().optional(),
  skill: z.string(),
  level: z.string(),
  status: z.string(),
  instructorId: z.string(),
  categoryId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Check if user can edit courses
  const canEditCourse = session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR';
  
  // Block access for course reviewers
  if (session && !canEditCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to edit courses.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <EditCourseForm params={params} session={session} />;
}

function EditCourseForm({ params, session }: { params: { id: string }, session: Session | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      short_description: "",
      description: "",
      duration: 60,
      price: 0,
      skill: "",
      level: "",
      status:"",
      instructorId: session?.user?.id || "",
      categoryId: "",
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session?.accessToken) return;
      try {
        const [course, fetchedCategories] = await Promise.all([
          fetchCourseById(session.accessToken, params.id),
          fetchCategories(session.accessToken),
        ]);
        setCategories(fetchedCategories);
        form.reset({
          title: course.title || "",
          short_description: course.short_description || "",
          description: course.description || "",
          duration: course.duration || 60,
          price: course.price || 0,
          skill: course.skill || "Beginner",
          level: course.level?.toString() || "",
          status: course.status?.toString() || "",
          instructorId: course.instructorId || session?.user?.id || "",
          categoryId: course.categoryId?.toString() || "",
        });
        if (course.thumbnail && typeof course.thumbnail === "string") {
          setThumbnailPreview(course.thumbnail);
        }
      } catch (error) {
        console.error("Failed to load course data:", error);
        toast.error("Failed to load course data. Please refresh the page.");
      }
    };
    fetchInitialData();
  }, [session, params.id, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("short_description", data.short_description);
    formData.append("description", data.description);
    formData.append("duration", data.duration.toString());
    formData.append("price", data.price.toString());
    formData.append("skill", data.skill);
    formData.append("level", data.level);
    formData.append("status", data.status);
    formData.append("instructorId", data.instructorId);
    formData.append("categoryId", data.categoryId);
    if (data.thumbnail?.[0]) formData.append("thumbnail", data.thumbnail[0]);
    if (data.videoIntro?.[0]) formData.append("videoIntro", data.videoIntro[0]);

    try {
      if (!session?.accessToken) {
        toast.error("Please log in to update the course");
        return;
      }
      await updateCourse(params.id, formData, session.accessToken);
      toast.success("Course updated successfully!");
      router.push("/course");
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const clearThumbnail = () => {
    form.setValue("thumbnail", undefined);
    setThumbnailPreview(null);
  };

  form.watch((value) => {
    if (value.thumbnail?.[0]) {
      handleThumbnailChange({
        target: { files: value.thumbnail },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Course</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief overview of the course (50-100 words)"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the course content and outcomes"
                        {...field}
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g., 120"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Price (VND)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g., 1.000.000"
                            onChange={(e) => {
                              onChange(e);
                            }}
                            {...rest}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground">₫</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="skill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select
                        value={field.value} // ✅ cần có value để hiện trạng thái
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEVELS.map((level) => (
                            <SelectItem
                              key={level.id}
                              value={level.id.toString()}
                            >
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Course Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {form.getValues('status') === CourseStatus.REJECTED && (
                          <>
                            <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                            <SelectItem value={CourseStatus.PENDING_REVIEW}>Submit for Review</SelectItem>
                          </>
                        )}
                        {(form.getValues('status') === CourseStatus.DRAFT || !form.getValues('status')) && (
                          <>
                            <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                            <SelectItem value={CourseStatus.PENDING_REVIEW}>Submit for Review</SelectItem>
                          </>
                        )}
                        {form.getValues('status') === CourseStatus.PENDING_REVIEW && (
                          <>
                            <SelectItem value={CourseStatus.DRAFT}>Back to Draft</SelectItem>
                            <SelectItem value={CourseStatus.PENDING_REVIEW}>Pending Review</SelectItem>
                          </>
                        )}
                        {form.getValues('status') === CourseStatus.PUBLISHED && (
                          <SelectItem value={CourseStatus.PUBLISHED} disabled>Published (Contact Admin to Modify)</SelectItem>
                        )}
                        {form.getValues('status') === CourseStatus.ARCHIVED && (
                          <SelectItem value={CourseStatus.ARCHIVED} disabled>Archived (Contact Admin to Modify)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {form.getValues('status') === CourseStatus.REJECTED && 
                        "Your course was rejected. You can edit and resubmit for review."}
                      {form.getValues('status') === CourseStatus.DRAFT && 
                        "Course is in draft mode. Submit for review when ready."}
                      {form.getValues('status') === CourseStatus.PENDING_REVIEW && 
                        "Course is pending admin review."}
                      {form.getValues('status') === CourseStatus.PUBLISHED && 
                        "Course is live and available to students."}
                      {form.getValues('status') === CourseStatus.ARCHIVED && 
                        "Course is archived and not visible to students."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Right Column */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          className={thumbnailPreview ? "hidden" : "block"}
                          onChange={(e) => {
                            onChange(e.target.files);
                            handleThumbnailChange(e);
                          }}
                          {...fieldProps}
                        />
                        {thumbnailPreview && (
                          <Card className="overflow-hidden">
                            <div className="relative aspect-video">
                              <Image
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                fill
                                unoptimized
                                className="object-cover w-full h-full"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={clearThumbnail}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardContent className="p-2">
                              <p className="text-xs text-muted-foreground">
                                {value?.[0]?.name || "Uploaded preview"}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {!thumbnailPreview && (
                          <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground">
                            <Upload className="h-8 w-8 mb-2" />
                            <p className="text-sm font-medium">
                              Drag and drop or click to upload
                            </p>
                            <p className="text-xs">
                              Recommended size: 1280x720 (16:9 ratio)
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoIntro"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Intro Video</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => onChange(e.target.files)}
                          {...fieldProps}
                        />
                        <FormDescription>
                          Upload a short introduction video (optional)
                        </FormDescription>
                        {value?.[0] && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {value[0].name}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {categories.length > 0 && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.categoryId}
                              value={category.categoryId.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              onClick={() => router.back()}
              variant="outline"
            >
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : "Edit Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
