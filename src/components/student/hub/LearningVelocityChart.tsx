import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { TrendingUp, Trophy, Loader2 } from 'lucide-react';
import { useLearningVelocity, WeekPoint } from '@/hooks/useLearningVelocity';

interface LearningVelocityChartProps {
  isDarkMode?: boolean;
  weeklyData?: any[];
  dailyGoalHours?: number;
}

const CustomTooltip = ({ active, payload, isDarkMode }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as WeekPoint;
  if (!d) return null;

  return (
    <div
      className={`px-3 py-2 rounded-lg shadow-lg text-xs border backdrop-blur-md ${
        isDarkMode
          ? 'bg-black/60 border-emerald-500/20 text-gray-100'
          : 'bg-white/80 border-gray-200 text-gray-800'
      }`}
    >
      <p className="font-bold mb-1">{d.week}</p>
      <p>
        Progress Points: <strong style={{ color: '#3DD39B' }}>{d.points}</strong>
      </p>
      <p>Lessons completed: {d.lessonsCompleted}</p>
      {d.isMilestone && (
        <p className="mt-1 text-yellow-500 font-semibold">
          🏆 {d.milestoneType === '20th' ? '20th' : '10th'} session milestone!
        </p>
      )}
    </div>
  );
};

export const LearningVelocityChart: React.FC<LearningVelocityChartProps> = ({
  isDarkMode = false,
}) => {
  const { weeklyData, totalLessons, loading } = useLearningVelocity();

  const gridColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axisColor = isDarkMode ? '#6B7280' : '#94A3B8';

  return (
    <div className="glass-card-hub glass-professional p-5 backdrop-blur-md">
      <div className="mb-1">
        <h3
          className={`text-lg flex items-center gap-2 tracking-tight font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          <TrendingUp className="w-5 h-5 text-[#3DD39B]" />
          Learning Velocity
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Weekly progress points — lessons × score
        </p>
      </div>

      <div className="pt-2">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#3DD39B]" />
          </div>
        ) : weeklyData.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center gap-2">
            <Trophy className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Complete your first lesson to start tracking progress
            </p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Line
                  type="monotone"
                  dataKey="points"
                  name="Progress Points"
                  stroke="#3DD39B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3DD39B', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                {weeklyData
                  .filter((w) => w.isMilestone)
                  .map((w, i) => (
                    <ReferenceDot
                      key={i}
                      x={w.week}
                      y={w.points}
                      r={8}
                      fill="#F59E0B"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>

            <div
              className={`mt-3 flex items-center justify-between text-sm rounded-lg px-4 py-2.5 ${
                isDarkMode ? 'bg-white/5' : 'bg-white/50'
              }`}
            >
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Total lessons completed:{' '}
                <strong className="text-[#3DD39B]">{totalLessons}</strong>
              </span>
              {totalLessons >= 10 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  🏆 {totalLessons >= 20 ? 'Master' : 'Rising Star'}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
