<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UsageRecordResource\Pages;
use App\Models\UsageRecord;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class UsageRecordResource extends Resource
{
    protected static ?string $model = UsageRecord::class;

    protected static ?string $navigationLabel = 'Activity';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable(),
                TextColumn::make('action')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'document_upload' => 'info',
                        'document_export' => 'success',
                        'document_download' => 'warning',
                        'document_delete' => 'danger',
                        'editor_opened' => 'gray',
                        'edit_saved' => 'primary',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str_replace('_', ' ', ucfirst($state)))
                    ->sortable(),
                TextColumn::make('document.original_filename')
                    ->label('Document')
                    ->placeholder('—')
                    ->limit(40),
                TextColumn::make('units')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('action')
                    ->options([
                        'document_upload' => 'Upload',
                        'document_export' => 'Export',
                        'document_download' => 'Download',
                        'document_delete' => 'Delete',
                        'editor_opened' => 'Editor opened',
                        'edit_saved' => 'Edit saved',
                    ]),
                Filter::make('today')
                    ->label('Today')
                    ->query(fn (Builder $query) => $query->whereDate('created_at', today())),
                Filter::make('this_week')
                    ->label('This week')
                    ->query(fn (Builder $query) => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsageRecords::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }
}
