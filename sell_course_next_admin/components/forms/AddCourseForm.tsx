import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";

const INSTRUCTORS = [
  {
    id: 1,
    name: "Sarah Johnson",
  },
  {
    id: 2,
    name: "Michael Chen",
  },
  {
    id: 3,
    name: "Jessica Williams",
  },
  {
    id: 4,
    name: "David Miller",
  },
];
const CATEGORIES = [
  {
    id: 1,
    name: "Web Development",
  },
  {
    id: 2,
    name: "Mobile Development",
  },
  {
    id: 3,
    name: "Data Science",
  },
  {
    id: 4,
    name: "UI/UX Design",
  },
  {
    id: 5,
    name: "Machine Learning",
  },
];
const LEVELS = [
  {
    id: 1,
    name: "Beginner",
  },
  {
    id: 2,
    name: "Intermediate",
  },
  {
    id: 3,
    name: "Advanced",
  },
];
// Form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Course title must be at least 3 characters",
  }),
  shortDescription: z.string().min(10, {
    message: "Short description must be at least 10 characters",
  }),
  fullDescription: z.string().min(50, {
    message: "Full description must be at least 50 characters",
  }),
  duration: z.coerce.number().min(1, {
    message: "Duration must be at least 1 minute",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number",
  }),
  introVideo: z.instanceof(FileList).optional(),
  thumbnail: z.instanceof(FileList).optional(),
  skill: z.string({
    required_error: "Please select a skill level",
  }),
  level: z.string({
    required_error: "Please select a difficulty level",
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  instructorId: z.string({
    required_error: "Please select an instructor",
  }),
  categoryId: z.string({
    required_error: "Please select a category",
  }),
});
type FormValues = z.infer<typeof formSchema>;
export function AddCourseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      duration: 60,
      price: 0,
      skill: "",
      level: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      instructorId: "",
      categoryId: "",
    },
  });
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Convert FileList to File for handling
    const thumbnailFile = data.thumbnail?.[0];
    const videoFile = data.introVideo?.[0];
    // Simulate API request
    console.log("Form data:", {
      ...data,
      thumbnail: thumbnailFile,
      introVideo: videoFile,
    });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Reset form (optional)
    // form.reset()
    // setThumbnailPreview(null)
  };
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };
  const clearThumbnail = () => {
    form.setValue("thumbnail", undefined);
    setThumbnailPreview(null);
  };
  const formatPrice = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    // Format with thousand separators
    if (numericValue) {
      const number = parseInt(numericValue, 10);
      return new Intl.NumberFormat("vi-VN").format(number);
    }
    return "";
  };
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Add New Course</h1>
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
                name="shortDescription"
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
                name="fullDescription"
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
                              const formatted = formatPrice(e.target.value);
                              e.target.value = formatted;
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                          className={cn(thumbnailPreview ? "hidden" : "block")}
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
                                {value?.[0]?.name}
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
                name="introVideo"
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Created At</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INSTRUCTORS.map((instructor) => (
                          <SelectItem
                            key={instructor.id}
                            value={instructor.id.toString()}
                          >
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
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
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setThumbnailPreview(null);
              }}
            >
              Reset Form
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : "Add Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
