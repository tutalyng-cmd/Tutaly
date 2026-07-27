export default function CommunityLoading() {
  return (
    <div className="space-y-6">
      <div className="w-full h-32 rounded-2xl p-4" style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)' }}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-c700 h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-c700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-c700 rounded"></div>
              <div className="h-4 bg-c700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full rounded-2xl p-5" style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)' }}>
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-c700 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-c700 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-c700 rounded"></div>
                  <div className="h-4 bg-c700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
