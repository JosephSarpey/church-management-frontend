export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-6 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Church Management System
        </p>
        <div className="text-xs text-gray-400">
          v1.0.0
        </div>
      </div>
    </footer>
  );
}