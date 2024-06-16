import { Skeleton } from '~/components/ui/skeleton';
import { PageContent } from '~/components/ui/page-content';

export function DataLoading() {
  return (
    <PageContent>
      <Skeleton className="h-10 mx-2" />
      <Skeleton className="h-24 mx-2" />
      <Skeleton className="h-32 mx-2" />
    </PageContent>
  );
}
