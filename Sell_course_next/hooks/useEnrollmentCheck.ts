import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UseEnrollmentCheckResult {
  isEnrolled: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useEnrollmentCheck = (courseId: string): UseEnrollmentCheckResult => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkEnrollment = async () => {
      if (status === "loading") return;
      
      if (!session?.user || !courseId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollment/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            courseId: courseId,
            userId: session.user.id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check enrollment status');
        }

        const data = await response.json();
        setIsEnrolled(data.enrolled || false);
      } catch (err) {
        console.error('Error checking enrollment:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollment();
  }, [courseId, session, status]);

  return { isEnrolled, isLoading, error };
};
