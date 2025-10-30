// components/Loading.tsx
const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/80 rounded-2xl shadow-sm w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-white/60 rounded-lg w-48 animate-pulse"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-7 bg-gray-300 rounded-lg w-16 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Skeleton */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-300 rounded-lg w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-4 bg-gray-300 rounded-lg animate-pulse"
                style={{
                  width: index === 1 ? "70%" : index === 2 ? "50%" : "40%",
                }}
              ></div>
            ))}
          </div>

          {/* Table Rows */}
          <div className="space-y-4">
            {[...Array(5)].map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0"
              >
                {[...Array(4)].map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="h-4 bg-gray-200 rounded-lg animate-pulse"
                    style={{
                      animationDelay: `${rowIndex * 0.1}s`,
                      width:
                        colIndex === 1 ? "60%" : colIndex === 2 ? "40%" : "30%",
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Chart Skeleton */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="h-6 bg-gray-300 rounded-lg w-40 mb-6 animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="h-6 bg-gray-300 rounded-lg w-40 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-300 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
