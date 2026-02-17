import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ResourceCard from "../components/ResourceCard";
import { useApp } from "../context/AppContext";

export default function MyResourcesPage() {
  const { currentUser, resources, usersById, canAccessResource } = useApp();
  const navigate = useNavigate();

  const myResources = useMemo(
    () => resources.filter((resource) => resource.ownerId === currentUser?.id),
    [resources, currentUser]
  );

  if (myResources.length === 0) {
    return (
      <EmptyState
        title="No uploads yet"
        subtitle="Upload your first resource to appear in your personal collection."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Library</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Resources</h2>
      </div>
      <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto pb-2 pr-1 scroll-smooth touch-pan-x">
        {myResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            owner={usersById[resource.ownerId]}
            canAccess={canAccessResource(resource)}
            onView={() => navigate(`/resource/${resource.id}`)}
            className="w-[310px] min-w-[310px] max-w-[310px] shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
