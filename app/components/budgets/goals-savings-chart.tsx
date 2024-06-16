import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import {
  defaultTo,
  groupBy,
  last,
  map,
  mergeAll,
  pipe,
  prop,
  reduce,
  sortBy,
  toPairs,
} from 'ramda';
import { lightFormat } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { MONTH_FORMAT } from '~/helpers/dates';
import type {
  ClientBudgetGoal,
  ClientBudgetSavingsEntry,
} from '~/helpers/budget-goals';

type GoalsSavingsChartProps = {
  goals: ClientBudgetGoal[];
  savings: ClientBudgetSavingsEntry[];
};

type ChartItem = {
  date: string;
  goals?: number;
  savings?: number;
};

const groupGoals = pipe(
  map((goal: ClientBudgetGoal) => ({
    date: lightFormat(goal.createdAt, 'yyyy-MM'),
    requiredAmount: goal.requiredAmount,
  })),
  groupBy(prop('date')),
  toPairs,
  map(([date, goals]) => ({
    date,
    goals: pipe(
      defaultTo([]),
      reduce(
        (monthlySum, goal: { requiredAmount: number }) =>
          monthlySum + goal.requiredAmount,
        0,
      ),
    )(goals),
  })),
  sortBy(prop('date')),
  reduce(
    (result, entry) => [
      ...result,
      {
        ...entry,
        goals: (last(result)?.goals || 0) + entry.goals,
      },
    ],
    [] as ChartItem[],
  ),
);

const groupSavings = pipe(
  map((entry: ClientBudgetSavingsEntry) => ({
    date: lightFormat(entry.createdAt, 'yyyy-MM'),
    amount: entry.amount,
  })),
  groupBy(prop('date')),
  toPairs,
  map(([date, entries]) => ({
    date,
    savings: pipe(
      defaultTo([]),
      reduce(
        (monthlySum, entry: { amount: number }) => monthlySum + entry.amount,
        0,
      ),
    )(entries),
  })),
  sortBy(prop('date')),
  reduce(
    (result, entry) => [
      ...result,
      {
        ...entry,
        savings: (last(result)?.savings || 0) + entry.savings,
      },
    ],
    [] as ChartItem[],
  ),
);
const groupGoalsAndSavings = pipe(
  sortBy<ChartItem>(prop('date')),
  groupBy(prop('date')),
  toPairs,
  map(([_, entries]) => mergeAll(entries || [])),
  reduce((result, entry) => {
    const lastEntry = last(result);

    return [
      ...result,
      {
        ...entry,
        savings: entry.savings || lastEntry?.savings,
        goals: entry.goals || lastEntry?.goals,
      },
    ];
  }, [] as ChartItem[]),
);
const processGoalsSavings = (
  goals: ClientBudgetGoal[],
  savings: ClientBudgetSavingsEntry[],
): ChartItem[] => {
  const groupedGoals = groupGoals(goals);
  const groupedSavings = groupSavings(savings);

  return groupGoalsAndSavings(groupedGoals.concat(groupedSavings));
};

export function GoalsSavingsChart({ goals, savings }: GoalsSavingsChartProps) {
  const { t } = useTranslation();

  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = {
    currency: 'PLN',
    locale: 'pl-PL',
    maximumFractionDigits: 0,
  };

  const data = processGoalsSavings(goals, savings);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 text-2xl">
          <span className="flex-1">
            {t('component.goal-savings-chart.title')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis
              dataKey="date"
              padding={{ left: 30, right: 30 }}
              tickFormatter={(value) =>
                t('component.goal-savings-chart.x-value', {
                  value: new Date(value + '-01T00:00:00.000Z'),
                  formatParams: {
                    value: MONTH_FORMAT,
                  },
                })
              }
            />
            <YAxis
              padding={{ top: 20 }}
              tickFormatter={(value) =>
                t('component.goal-savings-chart.y-value', {
                  value,
                  formatParams: {
                    value: FORMAT_CURRENCY,
                  },
                })
              }
            />
            <Tooltip
              labelFormatter={(value) =>
                t('component.goal-savings-chart.x-value', {
                  value: new Date(value + '-01T00:00:00.000Z'),
                  formatParams: {
                    value: MONTH_FORMAT,
                  },
                })
              }
              formatter={(value, name) => [
                t('component.goal-savings-chart.y-value', {
                  value,
                  formatParams: {
                    value: FORMAT_CURRENCY,
                  },
                }),
                t(`component.goal-savings-chart.${name}`),
              ]}
            />
            <Legend
              formatter={(value) => t(`component.goal-savings-chart.${value}`)}
            />
            <Area
              type="monotone"
              dataKey="goals"
              dot={{ stroke: 'hsl(var(--orange))', strokeWidth: 2 }}
              stroke="hsl(var(--orange))"
              fill="hsl(var(--orange-fill))"
            />
            <Area
              type="monotone"
              dataKey="savings"
              dot={{ stroke: 'hsl(var(--green))', strokeWidth: 2 }}
              stroke="hsl(var(--green))"
              fill="hsl(var(--green-fill))"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
