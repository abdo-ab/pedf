<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-users';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')
                ->required()
                ->maxLength(255),
            TextInput::make('email')
                ->email()
                ->required()
                ->maxLength(255),
            Toggle::make('is_admin')
                ->label('Administrator')
                ->helperText('Grants access to this admin panel.'),
        ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Account')->schema([
                TextEntry::make('name'),
                TextEntry::make('email'),
                TextEntry::make('created_at')
                    ->label('Registered')
                    ->dateTime(),
                TextEntry::make('email_verified_at')
                    ->label('Email verified')
                    ->dateTime()
                    ->placeholder('Not verified'),
                IconEntry::make('is_admin')
                    ->label('Administrator')
                    ->boolean(),
            ])->columns(2),
            Section::make('Activity')->schema([
                TextEntry::make('documents_count')
                    ->label('Total documents')
                    ->getStateUsing(fn (User $record): int => $record->documents()->count()),
                TextEntry::make('uploads_count')
                    ->label('Total uploads')
                    ->getStateUsing(
                        fn (User $record): int => $record->usageRecords()
                            ->where('action', 'document_upload')
                            ->count()
                    ),
                TextEntry::make('exports_count')
                    ->label('Exports')
                    ->getStateUsing(
                        fn (User $record): int => $record->usageRecords()
                            ->where('action', 'document_export')
                            ->count()
                    ),
                TextEntry::make('downloads_count')
                    ->label('Downloads')
                    ->getStateUsing(
                        fn (User $record): int => $record->usageRecords()
                            ->where('action', 'document_download')
                            ->count()
                    ),
            ])->columns(4),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('documents_count')
                    ->label('Documents')
                    ->counts('documents')
                    ->sortable(),
                IconColumn::make('is_admin')
                    ->label('Admin')
                    ->boolean(),
                TextColumn::make('email_verified_at')
                    ->label('Verified')
                    ->dateTime()
                    ->sortable()
                    ->placeholder('Unverified'),
                TextColumn::make('created_at')
                    ->label('Registered')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_admin')
                    ->label('Administrator'),
                Filter::make('verified')
                    ->label('Email verified')
                    ->query(fn (Builder $query) => $query->whereNotNull('email_verified_at')),
                Filter::make('unverified')
                    ->label('Email unverified')
                    ->query(fn (Builder $query) => $query->whereNull('email_verified_at')),
            ])
            ->actions([
                ViewAction::make(),
                Action::make('toggle_admin')
                    ->label(fn (User $record): string => $record->is_admin ? 'Revoke admin' : 'Make admin')
                    ->icon(fn (User $record): string => $record->is_admin ? 'heroicon-o-shield-exclamation' : 'heroicon-o-shield-check')
                    ->color(fn (User $record): string => $record->is_admin ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->action(function (User $record): void {
                        $record->update(['is_admin' => ! $record->is_admin]);
                        Notification::make()
                            ->title($record->is_admin ? 'Admin access granted' : 'Admin access revoked')
                            ->success()
                            ->send();
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'view' => Pages\ViewUser::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }
}
