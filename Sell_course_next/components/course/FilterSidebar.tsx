"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { CourseResponseDTO } from "../../app/types/Course/Course";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface FilterState {
  categories: string[];
  skills: string[];
  priceRange: {
    min: number;
    max: number;
  };
  durationRange: {
    min: number;
    max: number;
  };
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  courses: CourseResponseDTO[];
}

export default function FilterSidebar({ filters, setFilters, courses }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    skills: true,
    price: true,
    duration: true,
  });

  // Extract unique values from courses
  const uniqueCategories = useMemo(() => {
    const categories = Array.from(
      new Set(courses.map(course => course.categoryId))
    ).map(categoryId => {
      const course = courses.find(c => c.categoryId === categoryId);
      return {
        id: categoryId,
        name: course?.categoryName || categoryId,
        count: courses.filter(c => c.categoryId === categoryId).length
      };
    });
    return categories.sort((a, b) => b.count - a.count);
  }, [courses]);

  const uniqueSkills = useMemo(() => {
    const skills = Array.from(new Set(courses.map(course => course.skill)));
    return skills.map(skill => ({
      value: skill,
      count: courses.filter(c => c.skill === skill).length
    })).sort((a, b) => b.count - a.count);
  }, [courses]);

  const priceRange = useMemo(() => {
    const prices = courses.map(course => course.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [courses]);

  const durationRange = useMemo(() => {
    const durations = courses.map(course => course.duration);
    return {
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }, [courses]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }));
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      skills: checked
        ? [...prev.skills, skill]
        : prev.skills.filter(s => s !== skill)
    }));
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact"
    }).format(price / 25000); // Convert VND to USD roughly
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}m`;
    return `${Math.floor(duration / 60)}h`;
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      skills: [],
      priceRange: { min: priceRange.min, max: priceRange.max },
      durationRange: { min: durationRange.min, max: durationRange.max },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <Collapsible open={openSections.categories}>
          <CollapsibleTrigger
            className="flex items-center justify-between w-full p-0 text-left"
            onClick={() => toggleSection('categories')}
          >
            <span className="font-medium text-gray-900">Categories</span>
            {openSections.categories ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {uniqueCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Skills */}
        <Collapsible open={openSections.skills}>
          <CollapsibleTrigger
            className="flex items-center justify-between w-full p-0 text-left"
            onClick={() => toggleSection('skills')}
          >
            <span className="font-medium text-gray-900">Skills</span>
            {openSections.skills ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {uniqueSkills.map((skill) => (
              <div key={skill.value} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={skill.value}
                    checked={filters.skills.includes(skill.value)}
                    onCheckedChange={(checked) => 
                      handleSkillChange(skill.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={skill.value}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {skill.value}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {skill.count}
                </Badge>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible open={openSections.price}>
          <CollapsibleTrigger
            className="flex items-center justify-between w-full p-0 text-left"
            onClick={() => toggleSection('price')}
          >
            <span className="font-medium text-gray-900">Price Range</span>
            {openSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              <Slider
                value={[filters.priceRange.min, filters.priceRange.max]}
                min={priceRange.min}
                max={priceRange.max}
                step={100000}
                onValueChange={(value) => 
                  setFilters(prev => ({
                    ...prev,
                    priceRange: { min: value[0], max: value[1] }
                  }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatPrice(filters.priceRange.min)}</span>
                <span>{formatPrice(filters.priceRange.max)}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Duration Range */}
        <Collapsible open={openSections.duration}>
          <CollapsibleTrigger
            className="flex items-center justify-between w-full p-0 text-left"
            onClick={() => toggleSection('duration')}
          >
            <span className="font-medium text-gray-900">Duration</span>
            {openSections.duration ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              <Slider
                value={[filters.durationRange.min, filters.durationRange.max]}
                min={durationRange.min}
                max={durationRange.max}
                step={15}
                onValueChange={(value) => 
                  setFilters(prev => ({
                    ...prev,
                    durationRange: { min: value[0], max: value[1] }
                  }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatDuration(filters.durationRange.min)}</span>
                <span>{formatDuration(filters.durationRange.max)}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
