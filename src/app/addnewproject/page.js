'use client';

import AddNew from '@/components/Addnew';
import { useRouter } from 'next/navigation';

export default function AddNewProjectPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/project');
  };

  return <AddNew onSuccess={handleSuccess} />;
}
