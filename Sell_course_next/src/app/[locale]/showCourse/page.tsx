"use client";
import React, { useEffect, useState, useMemo } from "react";
import CourseCard from "@/components/course/CourseCard";
import "@/style/CourseCard.css";
import "@/style/SearchCourse.css";
import { Course } from "@/app/type/course/Course";
import { fetchCourses } from "@/app/api/course/CourseAPI";
import { FaSearch, FaTimes, FaSort } from "react-icons/fa";
import { useTranslations } from "next-intl";

type SortOption =
  | "newest"
  | "oldest"
  | "price-low"
  | "price-high"
  | "name-asc"
  | "name-desc";

const ShowCoursePage: React.FC = () => {
  const t = useTranslations("showCourse");
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses();
        setCourses(data);
        console.log("Loaded courses:", data);
      } catch (error) {
        console.log("Loaded courses error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    courses.forEach((course) => {
      if (course.categoryName) {
        uniqueCategories.add(course.categoryName);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.categoryName.toLowerCase().includes(query);

      const matchesCategory = selectedCategory
        ? course.categoryName === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [filteredCourses, sortOption]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortOption("newest");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  return (
    <div className="course-page-container">
      <div className="header-section">
        <h1 className="page-title">{t("pageTitle")}</h1>
        <p className="page-subtitle">{t("pageSubtitle")}</p>
      </div>

      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery ? (
              <FaTimes
                className="search-icon clear-icon"
                onClick={() => setSearchQuery("")}
              />
            ) : (
              <FaSearch className="search-icon" />
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t("loading")}</p>
        </div>
      ) : (
        <>
          <div className="results-sort-section">
            <div className="results-count">
              {searchQuery || selectedCategory ? (
                <p>
                  <span dangerouslySetInnerHTML={{
                    __html: t.raw('resultsFound').replace('{count}', `<strong>${filteredCourses.length}</strong>`)
                  }} />
                  {searchQuery && (
                    <span>{t('withKeyword', { keyword: searchQuery })}</span>
                  )}
                  {selectedCategory && (
                    <span>{t('inCategory', { category: selectedCategory })}</span>
                  )}
                </p>
              ) : (
                <p>
                  <span dangerouslySetInnerHTML={{
                    __html: t.raw('showingAll').replace('{count}', `<strong>${courses.length}</strong>`)
                  }} />
                </p>
              )}
            </div>

            <div className="sort-container">
              <FaSort className="sort-icon" />
              <select
                className="sort-select"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="newest">{t("sortOptions.newest")}</option>
                <option value="oldest">{t("sortOptions.oldest")}</option>
                <option value="price-low">{t("sortOptions.priceLow")}</option>
                <option value="price-high">{t("sortOptions.priceHigh")}</option>
                <option value="name-asc">{t("sortOptions.nameAsc")}</option>
                <option value="name-desc">{t("sortOptions.nameDesc")}</option>
              </select>
            </div>
          </div>

          <div className="course-grid">
            {sortedCourses.length > 0 ? (
              sortedCourses.map((course) => (
                <CourseCard key={course.courseId} course={course} />
              ))
            ) : (
              <div className="no-results">
                <h3>{t("noResults")}</h3>
                <p>{t("noResultsMessage")}</p>
                {(searchQuery || selectedCategory) && (
                  <button onClick={clearFilters} className="clear-filters-btn">
                    {t("clearFilters")}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShowCoursePage;
