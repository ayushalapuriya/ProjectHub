import React, { useMemo } from 'react';
import moment from 'moment';
import { formatDate } from '../../utils/dateUtils';
import Badge from '../common/Badge';

const GanttChart = ({ tasks = [], startDate, endDate, height = 400 }) => {
  const chartData = useMemo(() => {
    if (!tasks.length) return { days: [], taskRows: [] };

    const start = moment(startDate);
    const end = moment(endDate);
    const totalDays = end.diff(start, 'days') + 1;

    // Generate days array
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      days.push(start.clone().add(i, 'days'));
    }

    // Process tasks
    const taskRows = tasks.map(task => {
      const taskStart = moment(task.startDate);
      const taskEnd = moment(task.dueDate);
      
      // Calculate position and width
      const startOffset = Math.max(0, taskStart.diff(start, 'days'));
      const endOffset = Math.min(totalDays - 1, taskEnd.diff(start, 'days'));
      const duration = endOffset - startOffset + 1;

      return {
        ...task,
        startOffset,
        duration,
        isOverdue: taskEnd.isBefore(moment()) && task.status !== 'completed'
      };
    });

    return { days, taskRows, totalDays };
  }, [tasks, startDate, endDate]);

  const { days, taskRows, totalDays } = chartData;

  if (!tasks.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-50 rounded-lg">
        <p className="text-secondary-500">No tasks to display</p>
      </div>
    );
  }

  const dayWidth = Math.max(40, Math.min(100, 800 / totalDays));
  const chartWidth = dayWidth * totalDays;

  return (
    <div className="gantt-chart bg-white rounded-lg border border-secondary-200">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-900">Project Timeline</h3>
      </div>

      <div className="overflow-auto" style={{ height }}>
        <div className="flex">
          {/* Task names column */}
          <div className="flex-shrink-0 w-64 bg-secondary-50 border-r border-secondary-200">
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-secondary-200 bg-secondary-100">
              <span className="font-medium text-secondary-900">Tasks</span>
            </div>
            
            {/* Task rows */}
            {taskRows.map((task, index) => (
              <div
                key={task._id}
                className={`h-12 flex items-center px-4 border-b border-secondary-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge status={task.status} size="sm">
                      {task.status}
                    </Badge>
                    <Badge priority={task.priority} size="sm">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline area */}
          <div className="flex-1" style={{ minWidth: chartWidth }}>
            {/* Date header */}
            <div className="h-16 flex border-b border-secondary-200 bg-secondary-100">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex flex-col items-center justify-center border-r border-secondary-200 text-xs"
                  style={{ width: dayWidth }}
                >
                  <span className="font-medium text-secondary-900">
                    {day.format('MMM')}
                  </span>
                  <span className="text-secondary-600">
                    {day.format('DD')}
                  </span>
                  <span className="text-secondary-500">
                    {day.format('ddd')}
                  </span>
                </div>
              ))}
            </div>

            {/* Task bars */}
            <div className="relative">
              {taskRows.map((task, index) => (
                <div
                  key={task._id}
                  className={`h-12 border-b border-secondary-200 relative ${
                    index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'
                  }`}
                >
                  {/* Today indicator */}
                  {days.some(day => day.isSame(moment(), 'day')) && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-danger-500 z-10"
                      style={{
                        left: moment().diff(moment(startDate), 'days') * dayWidth
                      }}
                    />
                  )}

                  {/* Task bar */}
                  <div
                    className={`absolute top-2 bottom-2 rounded flex items-center px-2 text-white text-xs font-medium ${
                      task.isOverdue
                        ? 'bg-danger-500'
                        : task.status === 'completed'
                        ? 'bg-success-500'
                        : task.status === 'in-progress'
                        ? 'bg-primary-500'
                        : 'bg-secondary-400'
                    }`}
                    style={{
                      left: task.startOffset * dayWidth,
                      width: Math.max(dayWidth * task.duration, 20)
                    }}
                    title={`${task.title} (${formatDate(task.startDate)} - ${formatDate(task.dueDate)})`}
                  >
                    <span className="truncate">
                      {task.duration * dayWidth > 60 ? task.title : ''}
                    </span>
                  </div>

                  {/* Progress indicator */}
                  {task.progress > 0 && (
                    <div
                      className="absolute top-2 bottom-2 bg-white bg-opacity-30 rounded-l"
                      style={{
                        left: task.startOffset * dayWidth,
                        width: Math.max(dayWidth * task.duration * (task.progress / 100), 2)
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Vertical grid lines */}
              {days.map((day, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-px bg-secondary-200"
                  style={{ left: index * dayWidth }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-3 bg-secondary-400 rounded mr-2"></div>
            <span>Not Started</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-3 bg-primary-500 rounded mr-2"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-3 bg-success-500 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-3 bg-danger-500 rounded mr-2"></div>
            <span>Overdue</span>
          </div>
          <div className="flex items-center">
            <div className="w-0.5 h-4 bg-danger-500 mr-2"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
