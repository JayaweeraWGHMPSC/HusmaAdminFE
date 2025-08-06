'use client';

import Project from '@/components/Project';
import { useRouter } from 'next/navigation';

export default function ProjectPage() {
  const router = useRouter();

  const handleEditProject = (project) => {
    router.push(`/edit-project/${project._id || project.id}`);
  };

  return <Project onEditProject={handleEditProject} />;
}
