import { FaProjectDiagram, FaUserPlus, FaKey, FaUserCircle, FaPlus } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';

export default function Left({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-gray-50 border-r border-gray-200 py-8 px-4 space-y-2">
      <button
        onClick={() => router.push('/project')}
        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          pathname === '/project'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FaProjectDiagram className="mr-3" />
        Project
      </button>
      <button
        onClick={() => router.push('/addnewproject')}
        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          pathname === '/addnewproject'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FaPlus className="mr-3" />
        Add New Project
      </button>
      <button
        onClick={() => router.push('/giveaccess')}
        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          pathname === '/giveaccess'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FaUserPlus className="mr-3" />
        Give Access
      </button>
      <button
        onClick={() => router.push('/changepassword')}
        className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          pathname === '/changepassword'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FaKey className="mr-3" />
        Change Password
      </button>
      <div className="flex items-center mt-8 px-3 py-2 bg-gray-50 rounded-md">
        <FaUserCircle className="w-8 h-8 text-blue-600 mr-2" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-blue-700">{user?.name}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>
    </aside>
  );
}
