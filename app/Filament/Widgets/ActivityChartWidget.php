<?php

namespace App\Filament\Widgets;

use App\Models\UsageRecord;
use Filament\Widgets\ChartWidget;

class ActivityChartWidget extends ChartWidget
{
    protected ?string $heading = 'Activity over time (last 30 days)';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $days = collect(range(29, 0))->map(fn (int $i) => now()->subDays($i)->startOfDay());

        $counts = UsageRecord::query()
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        return [
            'datasets' => [
                [
                    'label' => 'Activity events',
                    'data' => $days->map(fn ($day) => (int) ($counts[$day->toDateString()] ?? 0))->values()->all(),
                    'fill' => true,
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'borderColor' => 'rgb(16, 185, 129)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $days->map(fn ($day) => $day->format('M j'))->values()->all(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
