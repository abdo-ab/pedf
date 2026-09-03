<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocumentResource\Pages;
use App\Models\Document;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class DocumentResource extends Resource
{
    protected static ?string $model = Document::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-document';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Document')->schema([
                TextEntry::make('original_filename')
                    ->label('Filename'),
                TextEntry::make('user.name')
                    ->label('Owner'),
                TextEntry::make('user.email')
                    ->label('Owner email'),
                TextEntry::make('mime_type')
                    ->label('MIME type'),
                TextEntry::make('file_size')
                    ->label('File size')
                    ->formatStateUsing(fn (int $state): string => number_format($state / 1024, 1).' KB'),
                TextEntry::make('page_count')
                    ->label('Pages')
                    ->placeholder('Unknown'),
                TextEntry::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ready' => 'success',
                        'uploaded' => 'info',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                IconEntry::make('is_editable')
                    ->label('Editable')
                    ->boolean(),
                TextEntry::make('processing_error')
                    ->label('Processing error')
                    ->placeholder('None')
                    ->columnSpanFull(),
                TextEntry::make('created_at')
                    ->label('Uploaded')
                    ->dateTime(),
                TextEntry::make('updated_at')
                    ->label('Last updated')
                    ->dateTime(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('original_filename')
                    ->label('Filename')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Owner')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ready' => 'success',
                        'uploaded' => 'info',
                        'rejected' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                IconColumn::make('is_editable')
                    ->label('Editable')
                    ->boolean(),
                TextColumn::make('file_size')
                    ->label('Size')
                    ->formatStateUsing(fn (int $state): string => number_format($state / 1024, 1).' KB')
                    ->sortable(),
                TextColumn::make('page_count')
                    ->label('Pages')
                    ->sortable()
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->label('Uploaded')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'uploaded' => 'Uploaded',
                        'ready' => 'Ready',
                        'rejected' => 'Rejected',
                    ]),
                TernaryFilter::make('is_editable')
                    ->label('Editable'),
                Filter::make('has_error')
                    ->label('Has processing error')
                    ->query(fn (Builder $query) => $query->whereNotNull('processing_error')),
                Filter::make('created_today')
                    ->label('Uploaded today')
                    ->query(fn (Builder $query) => $query->whereDate('created_at', today())),
            ])
            ->actions([
                ViewAction::make(),
                DeleteAction::make()
                    ->before(function (Document $record): void {
                        if ($record->stored_filename) {
                            Storage::disk('local')->delete($record->stored_filename);
                        }
                    })
                    ->successNotification(
                        Notification::make()
                            ->title('Document deleted')
                            ->body('The document and its stored file have been removed.')
                            ->success()
                    ),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDocuments::route('/'),
            'view' => Pages\ViewDocument::route('/{record}'),
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
}
