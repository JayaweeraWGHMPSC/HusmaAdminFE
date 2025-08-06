'use client';

import EditProject from '@/components/EditProject';
import { useRouter } from 'next/navigation';

export default function EditProjectPage({ params }) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/project');
  };

  const handleCancel = () => {
    router.push('/project');
  };

  return (
    <EditProject 
      id={params.id} 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
