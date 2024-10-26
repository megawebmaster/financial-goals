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
  fromPairs,
  groupBy,
  head,
  isEmpty,
  last,
  map,
  pipe,
  prop,
  reduce,
  toPairs,
} from 'ramda';
import { addMonths, lightFormat, parse, subMonths } from 'date-fns';
import { useOutletContext } from '@remix-run/react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { MONTH_FORMAT } from '~/helpers/dates';
import type {
  ClientBudgetGoal,
  ClientBudgetSavingsEntry,
} from '~/helpers/budget-goals';
import type { PickFieldsOfType } from '~/helpers/types';
import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';

type GoalsSavingsChartProps = {
  budget: ClientBudget;
  goals: ClientBudgetGoal[];
  savings: ClientBudgetSavingsEntry[];
};

type ChartItem = {
  date: string;
  goals?: number;
  savings?: number;
};

const groupAndSumByDates = <T extends { createdAt: Date }>(
  property: PickFieldsOfType<T, number>,
) =>
  pipe(
    map((entry: T) => ({
      date: lightFormat(entry.createdAt, 'yyyy-MM'),
      value: entry[property],
    })),
    groupBy(prop('date')),
    toPairs,
    map(
      ([date, entries]) =>
        [
          date,
          pipe(
            defaultTo([]),
            reduce(
              (monthlySum, entry: { value: number }) =>
                monthlySum + entry.value,
              0,
            ),
          )(entries),
        ] as [string, number],
    ),
    fromPairs<string, number>,
  );

const groupAndSumGoals = groupAndSumByDates<ClientBudgetGoal>('requiredAmount');
const groupAndSumSavings =
  groupAndSumByDates<ClientBudgetSavingsEntry>('amount');

const ensureRisingValues = reduce((result, entry: ChartItem) => {
  const lastEntry = last(result);

  return [
    ...result,
    {
      ...entry,
      savings: entry.savings || lastEntry?.savings,
      goals: entry.goals || lastEntry?.goals,
    },
  ];
}, [] as ChartItem[]);

const processGoalsSavings = (
  goals: ClientBudgetGoal[],
  savings: ClientBudgetSavingsEntry[],
): ChartItem[] => {
  const result: ChartItem[] = [];
  const now = new Date();
  const groupedGoals = groupAndSumGoals(goals);
  const groupedSavings = groupAndSumSavings(savings);

  if (isEmpty(groupedGoals) && isEmpty(groupedSavings)) {
    return result;
  }

  const yearAgoDate = lightFormat(subMonths(now, 12), 'yyyy-MM');
  const firstGoalDate = head(Object.keys(groupedGoals).sort()) || yearAgoDate;
  const startDate = firstGoalDate > yearAgoDate ? firstGoalDate : yearAgoDate;

  for (
    let month = parse(startDate, 'yyyy-MM', now);
    month <= now;
    month = addMonths(month, 1)
  ) {
    const date = lightFormat(month, 'yyyy-MM');
    result.push({
      date,
      savings: groupedSavings[date] || 0,
      goals: groupedGoals[date] || 0,
    });
  }

  return ensureRisingValues(result);
};

export function GoalsSavingsChart({
  budget,
  goals,
  savings,
}: GoalsSavingsChartProps) {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
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
        {data.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 italic text-sm">
              No data for the chart
            </p>
          </div>
        )}
        {data.length > 0 && (
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
                formatter={(value) =>
                  t(`component.goal-savings-chart.${value}`)
                }
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
        )}
      </CardContent>
    </Card>
  );
}
