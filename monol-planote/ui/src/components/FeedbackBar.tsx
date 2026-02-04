type Props = {
  feedbackCount: number;
  onSubmit: (action: "approve" | "request_changes") => void;
  message?: string | null;
};

export function FeedbackBar({ feedbackCount, onSubmit, message }: Props) {
  return (
    <footer className="h-16 bg-dark-surface border-t border-dark-border flex items-center justify-between px-6 shrink-0">
      {/* Left: Feedback Summary */}
      <div className="flex items-center gap-4">
        {message ? (
          <div className="flex items-center gap-2 text-dark-success">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{message}</span>
          </div>
        ) : feedbackCount > 0 ? (
          <div className="flex items-center gap-2 text-dark-warning">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{feedbackCount} pending feedback items</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-dark-muted">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">No pending feedback</span>
          </div>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSubmit("request_changes")}
          disabled={feedbackCount === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark-warning border border-dark-warning/50 rounded-lg hover:bg-dark-warning/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Request Changes
        </button>

        <button
          onClick={() => onSubmit("approve")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-dark-success rounded-lg hover:bg-dark-success/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Approve
        </button>
      </div>
    </footer>
  );
}
