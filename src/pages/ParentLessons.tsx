import { Navigate, useSearchParams } from 'react-router-dom';

/**
 * /parent/lessons used to be a separate page. "Lessons" is now a tab of the family dashboard, so old links and
 * bookmarks land there (the child whose "Buy lessons" button was pressed stays selected).
 */
export default function ParentLessons() {
  const [params] = useSearchParams();
  const child = params.get('child');
  return <Navigate to={`/parent?tab=lessons${child ? `&child=${encodeURIComponent(child)}` : ''}`} replace />;
}
