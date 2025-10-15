import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
             Please sign up to get started!
          </p>
        </div>
        <div className="mt-8">
          <SignUp 
            path="/sign-up" 
            routing="path" 
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                card: 'shadow-md rounded-lg',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
                socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                socialButtonsBlockButtonText: 'text-gray-700',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-700',
                formFieldInput: 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
                footerActionText: 'text-sm text-gray-600',
                footerActionLink: 'text-indigo-600 hover:text-indigo-500',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}