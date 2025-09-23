import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string; // ISO date
};

// Simulate server-side data (replace with DB/API later)
async function getProjects(): Promise<Project[]> {
  return [
    { id: "p1", name: "Onboarding Docs", description: "Company handbook & policies", updatedAt: "2025-09-01T10:00:00Z" },
    { id: "p2", name: "Engineering Playbook", description: "Runbooks & best practices", updatedAt: "2025-09-10T08:30:00Z" },
    { id: "p3", name: "DBT Lineage", description: "Models, tests, and lineage", updatedAt: "2025-09-20T14:12:00Z" },
  ];
}

export default async function MainPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          {/* Placeholder action (wire later) */}
          <button className="rounded-lg border px-4 py-2 bg-white hover:bg-gray-100">
            + New Project
          </button>
        </div>

        {/* Project list */}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/main/${p.id}`}
                className="block rounded-xl border bg-white p-5 hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold">{p.name}</h2>
                {p.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.description}</p>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  Updated: {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {/* Empty state example */}
        {projects.length === 0 && (
          <div className="mt-16 rounded-xl border bg-white p-10 text-center text-gray-600">
            No projects yet. Click <span className="font-medium">+ New Project</span> to create one.
          </div>
        )}
      </div>
    </main>
  );
}
