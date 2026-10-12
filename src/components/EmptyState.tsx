export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <div className="mb-3 text-3xl">📭</div>
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      {description && (
        <div className="mt-1 max-w-md text-xs text-gray-600">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
