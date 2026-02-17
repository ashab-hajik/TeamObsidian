import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialResources, initialReviews, initialUsers } from "../data/mockData";

const STORAGE_KEYS = {
  users: "campus_users",
  resources: "campus_resources",
  reviews: "campus_reviews",
  currentUserId: "campus_current_user_id",
  darkMode: "campus_dark_mode",
  examMode: "campus_exam_mode",
  recentlyViewed: "campus_recently_viewed",
  downloadHistory: "campus_download_history",
};

const AppContext = createContext(null);

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const normalizeUsers = (loadedUsers = []) =>
  loadedUsers.map((user) => ({
    ...user,
    role: user.role ?? (user.id === "u2" ? "ADMIN" : "USER"),
    password: user.password ?? (user.id === "u2" ? "admin1234" : "pass1234"),
    email:
      user.email ??
      `${String(user.name ?? user.id)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ".")}@campus.demo`,
  }));

const normalizeResources = (loadedResources = []) =>
  loadedResources.map((resource) => ({
    ...resource,
    featured: Boolean(resource.featured),
  }));

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => normalizeUsers(readJson(STORAGE_KEYS.users, initialUsers)));
  const [resources, setResources] = useState(() =>
    normalizeResources(readJson(STORAGE_KEYS.resources, initialResources))
  );
  const [reviews, setReviews] = useState(() => readJson(STORAGE_KEYS.reviews, initialReviews));
  const [currentUserId, setCurrentUserId] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.currentUserId)
  );
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(STORAGE_KEYS.darkMode) === "1");
  const [examMode, setExamMode] = useState(() => localStorage.getItem(STORAGE_KEYS.examMode) === "1");
  const [recentlyViewed, setRecentlyViewed] = useState(() =>
    readJson(STORAGE_KEYS.recentlyViewed, [])
  );
  const [downloadHistory, setDownloadHistory] = useState(() =>
    readJson(STORAGE_KEYS.downloadHistory, [])
  );
  const [toasts, setToasts] = useState([]);

  useEffect(() => localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.resources, JSON.stringify(resources)), [resources]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews)), [reviews]);
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.currentUserId, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.darkMode, darkMode ? "1" : "0");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.examMode, examMode ? "1" : "0");
  }, [examMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recentlyViewed, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.downloadHistory, JSON.stringify(downloadHistory));
  }, [downloadHistory]);

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const reviewsByResource = useMemo(() => {
    return reviews.reduce((acc, review) => {
      if (!acc[review.resourceId]) acc[review.resourceId] = [];
      acc[review.resourceId].push(review);
      return acc;
    }, {});
  }, [reviews]);

  const resourcesWithStats = useMemo(() => {
    return resources.map((resource) => {
      const resourceReviews = reviewsByResource[resource.id] ?? [];
      const total = resourceReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = resourceReviews.length ? total / resourceReviews.length : 0;

      return {
        ...resource,
        featured: Boolean(resource.featured),
        averageRating,
        ratingCount: resourceReviews.length,
        isTopRated: averageRating >= 4,
        isExamOriented: ["PYQ", "Notes", "Assignment"].includes(resource.type),
      };
    });
  }, [resources, reviewsByResource]);

  const usersById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users]
  );

  const leaderboard = useMemo(() => {
    const fiveStarsReceived = {};

    reviews.forEach((review) => {
      if (review.rating !== 5) return;
      const resource = resources.find((item) => item.id === review.resourceId);
      if (!resource) return;
      fiveStarsReceived[resource.ownerId] = (fiveStarsReceived[resource.ownerId] ?? 0) + 1;
    });

    return users
      .map((user) => {
        const uploadCount = resources.filter((resource) => resource.ownerId === user.id).length;
        const fiveStars = fiveStarsReceived[user.id] ?? 0;
        const points = (user.basePoints ?? 0) + fiveStars * 5;

        return {
          ...user,
          uploadCount,
          fiveStars,
          points,
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [users, resources, reviews]);

  const adminStats = useMemo(
    () => ({
      totalUsers: users.length,
      totalResources: resources.length,
      totalReviews: reviews.length,
    }),
    [users.length, resources.length, reviews.length]
  );

  const currentUserBadges = useMemo(() => {
    if (!currentUser) return [];

    const uploads = resources.filter((resource) => resource.ownerId === currentUser.id).length;
    const ratingsGiven = reviews.filter((review) => review.userId === currentUser.id).length;
    const badges = [];

    if (currentUser.role === "ADMIN") badges.push("Admin Steward");
    if (uploads >= 1) badges.push("Contributor");
    if (uploads >= 5) badges.push("Campus Publisher");
    if (ratingsGiven >= 3) badges.push("Peer Reviewer");
    if (badges.length === 0) badges.push("Getting Started");

    return badges;
  }, [currentUser, resources, reviews]);

  const currentUserProgress = useMemo(() => {
    if (!currentUser) {
      return {
        viewedCount: 0,
        downloadedCount: 0,
        ratedCount: 0,
      };
    }

    const viewedCount = new Set(
      recentlyViewed
        .filter((entry) => entry.userId === currentUser.id)
        .map((entry) => entry.resourceId)
    ).size;

    const downloadedCount = new Set(
      downloadHistory
        .filter((entry) => entry.userId === currentUser.id)
        .map((entry) => entry.resourceId)
    ).size;

    const ratedCount = new Set(
      reviews
        .filter((review) => review.userId === currentUser.id)
        .map((review) => review.resourceId)
    ).size;

    return {
      viewedCount,
      downloadedCount,
      ratedCount,
    };
  }, [currentUser, recentlyViewed, downloadHistory, reviews]);

  const recentlyViewedResources = useMemo(() => {
    if (!currentUser) return [];

    const currentUserViews = recentlyViewed
      .filter((entry) => entry.userId === currentUser.id)
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

    return currentUserViews
      .map((entry) => resourcesWithStats.find((resource) => resource.id === entry.resourceId))
      .filter(Boolean)
      .slice(0, 6);
  }, [currentUser, recentlyViewed, resourcesWithStats]);

  const currentUserActivity = useMemo(() => {
    if (!currentUser) return [];

    const uploadEvents = resources
      .filter((resource) => resource.ownerId === currentUser.id)
      .map((resource) => ({
        id: `activity_upload_${resource.id}`,
        kind: "upload",
        text: `Uploaded ${resource.title}`,
        createdAt: resource.createdAt,
      }));

    const reviewEvents = reviews
      .filter((review) => review.userId === currentUser.id)
      .map((review) => {
        const resource = resources.find((item) => item.id === review.resourceId);
        return {
          id: `activity_review_${review.id}`,
          kind: "review",
          text: `Rated ${resource?.title ?? "a resource"} ${review.rating}/5`,
          createdAt: review.createdAt,
        };
      });

    return [...uploadEvents, ...reviewEvents]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [currentUser, resources, reviews]);

  const pushToast = useCallback((message, type = "info") => {
    const id = makeId("t");
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const registerUser = (payload) => {
    const newUser = {
      id: makeId("u"),
      ...payload,
      basePoints: 0,
      role: payload.role ?? "USER",
      password: payload.password,
      email: payload.email,
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    return newUser;
  };

  const loginUser = ({ email, password, name, college }) => {
    const normalizedEmail = email?.trim().toLowerCase();

    const found = users.find(
      (user) =>
        user.password === password &&
        ((normalizedEmail && user.email?.trim().toLowerCase() === normalizedEmail) ||
          (!normalizedEmail &&
            user.name.trim().toLowerCase() === name?.trim().toLowerCase() &&
            user.college.trim().toLowerCase() === college?.trim().toLowerCase()))
    );

    if (!found) return null;
    setCurrentUserId(found.id);
    return found;
  };

  const logout = () => setCurrentUserId(null);

  const uploadResource = (payload) => {
    if (!currentUser) return null;
    const resource = {
      id: makeId("r"),
      ...payload,
      tags: payload.tags,
      fileMeta: payload.fileMeta ?? null,
      featured: false,
      ownerId: currentUser.id,
      college: currentUser.college,
      createdAt: new Date().toISOString(),
    };

    setResources((prev) => [resource, ...prev]);
    setUsers((prev) =>
      prev.map((user) =>
        user.id === currentUser.id
          ? { ...user, basePoints: (user.basePoints ?? 0) + 10 }
          : user
      )
    );

    return resource;
  };

  const canAccessResource = (resource, user = currentUser) => {
    if (!resource || !user) return false;
    return resource.privacy === "Public" || resource.college === user.college;
  };

  const toggleFeaturedResource = (resourceId) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId ? { ...resource, featured: !resource.featured } : resource
      )
    );
  };

  const deleteResource = (resourceId) => {
    setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    setReviews((prev) => prev.filter((review) => review.resourceId !== resourceId));
  };

  const submitReview = ({ resourceId, rating, comment }) => {
    if (!currentUser) return null;

    const existing = reviews.find(
      (review) => review.resourceId === resourceId && review.userId === currentUser.id
    );

    if (existing) {
      const updated = {
        ...existing,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => prev.map((review) => (review.id === existing.id ? updated : review)));
      return updated;
    }

    const review = {
      id: makeId("rv"),
      resourceId,
      userId: currentUser.id,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [review, ...prev]);
    return review;
  };

  const trackRecentlyViewed = (resourceId) => {
    if (!currentUser || !resourceId) return;

    setRecentlyViewed((prev) => {
      const next = [
        { userId: currentUser.id, resourceId, viewedAt: new Date().toISOString() },
        ...prev.filter((entry) => !(entry.userId === currentUser.id && entry.resourceId === resourceId)),
      ];

      return next.slice(0, 30);
    });
  };

  const trackResourceDownload = (resourceId) => {
    if (!currentUser || !resourceId) return;

    setDownloadHistory((prev) => {
      const next = [
        { userId: currentUser.id, resourceId, downloadedAt: new Date().toISOString() },
        ...prev.filter((entry) => !(entry.userId === currentUser.id && entry.resourceId === resourceId)),
      ];

      return next.slice(0, 60);
    });
  };

  const value = {
    users,
    usersById,
    resources: resourcesWithStats,
    rawResources: resources,
    reviews,
    reviewsByResource,
    currentUser,
    leaderboard,
    adminStats,
    currentUserBadges,
    currentUserActivity,
    currentUserProgress,
    recentlyViewedResources,
    darkMode,
    setDarkMode,
    examMode,
    setExamMode,
    toasts,
    pushToast,
    removeToast,
    registerUser,
    loginUser,
    logout,
    uploadResource,
    canAccessResource,
    toggleFeaturedResource,
    deleteResource,
    submitReview,
    trackRecentlyViewed,
    trackResourceDownload,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
