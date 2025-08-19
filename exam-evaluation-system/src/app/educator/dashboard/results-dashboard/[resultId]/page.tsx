// import { Suspense } from 'react';
// import StudentResultDetail from '../StudentResultDetail';

// interface PageProps {
//   params: { resultId: string };
//   searchParams: {
//     studentIndex?: string;
//     moduleCode?: string;
//     examYear?: string;
//     examMonth?: string;
//     assessmentId?: string;
//   };
// }

// export default function StudentResultDetailPage({ params, searchParams }: PageProps) {
//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <Suspense fallback={
//           <div className="flex items-center justify-center h-64">
//             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//           </div>
//         }>
//           <StudentResultDetail 
//             resultId={params.resultId}
//             searchParams={searchParams}
//           />
//         </Suspense>
//       </div>
//     </div>
//   );
// }

import { Suspense } from 'react';
import StudentResultDetail from '.././StudentResultDetail';

interface PageProps {
  params: Promise<{ resultId: string }>;
  searchParams: Promise<{
    studentIndex?: string;
    moduleCode?: string;
    examYear?: string;
    examMonth?: string;
    assessmentId?: string;
  }>;
}

export default async function StudentResultDetailPage({ params, searchParams }: PageProps) {
  const { resultId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        }>
          <StudentResultDetail 
            resultId={resultId}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}