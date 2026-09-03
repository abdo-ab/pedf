<?php

namespace App\Filament\Widgets;

use App\Models\Document;
use App\Models\UsageRecord;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DocumentsOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $totalUsers = User::query()->count();
        $newUsersThisMonth = User::query()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        $totalDocuments = Document::query()->count();
        $editablePdfs = Document::query()->where('is_editable', true)->count();
        $rejectedPdfs = Document::query()->where('status', 'rejected')->count();
        $totalExports = UsageRecord::query()->where('action', 'document_export')->count();
        $totalDownloads = UsageRecord::query()->where('action', 'document_download')->count();

        return [
            Stat::make('Total users', number_format($totalUsers))
                ->description("{$newUsersThisMonth} new this month")
                ->icon('heroicon-o-users')
                ->color('success'),

            Stat::make('New users this month', number_format($newUsersThisMonth))
                ->icon('heroicon-o-user-plus')
                ->color('info'),

            Stat::make('Total documents', number_format($totalDocuments))
                ->icon('heroicon-o-document')
                ->color('primary'),

            Stat::make('Editable PDFs', number_format($editablePdfs))
                ->icon('heroicon-o-pencil-square')
                ->color('success'),

            Stat::make('Rejected PDFs', number_format($rejectedPdfs))
                ->icon('heroicon-o-x-circle')
                ->color('danger'),

            Stat::make('Exports', number_format($totalExports))
                ->icon('heroicon-o-arrow-down-tray')
                ->color('warning'),

            Stat::make('Downloads', number_format($totalDownloads))
                ->icon('heroicon-o-cloud-arrow-down')
                ->color('gray'),
        ];
    }
}
