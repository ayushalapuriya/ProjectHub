import React from 'react';

const ProgressChart = ({ 
  data = [], 
  title = "Progress Chart", 
  height = 300,
  type = "bar" // bar, line, pie
}) => {
  if (!data.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-center h-64">
            <p className="text-secondary-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
      </div>
      <div className="card-body">
        {type === 'bar' && (
          <div className="space-y-4" style={{ height }}>
            {data.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-secondary-600 truncate">
                  {item.label}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-secondary-200 rounded-full h-4 relative">
                    <div
                      className="bg-primary-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-sm text-secondary-900 text-right">
                  {item.percentage ? `${item.percentage}%` : item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'pie' && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {data.map((item, index) => {
                  const total = data.reduce((sum, d) => sum + d.value, 0);
                  const percentage = (item.value / total) * 100;
                  const angle = (percentage / 100) * 360;
                  const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                  
                  const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 100 + 80 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
                  const y2 = 100 + 80 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');

                  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={colors[index % colors.length]}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="ml-8 space-y-2">
              {data.map((item, index) => {
                const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];
                return (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-sm text-secondary-600">
                      {item.label}: {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;
