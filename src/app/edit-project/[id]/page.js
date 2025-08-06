'use client';

import { use } from 'react';
import EditProject from '@/components/EditProject';
import { useRouter } from 'next/navigation';

export default function EditProjectPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const handleSuccess = () => {
    router.push('/project');
  };

  const handleCancel = () => {
    router.push('/project');
  };

  return (
    <EditProject 
      id={resolvedParams.id} 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
