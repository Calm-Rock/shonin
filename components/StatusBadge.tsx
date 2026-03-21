type Status = 'pending' | 'approved' | 'rejected';

const styles: Record<Status, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20',
  approved: 'bg-green-400/10 text-green-400 ring-green-400/20',
  rejected: 'bg-red-400/10 text-red-400 ring-red-400/20',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
