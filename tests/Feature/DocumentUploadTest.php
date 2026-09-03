<?php

use App\Models\Document;
use App\Models\UsageRecord;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

function pdfFixture(string $content): string
{
    return "%PDF-1.4\n"
        ."1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n"
        .'4 0 obj << /Length '.strlen($content)." >> stream\n"
        .$content
        ."\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n";
}

function uploadFile(string $filename, string $contents): UploadedFile
{
    return UploadedFile::fake()->createWithContent($filename, $contents);
}

function compressedPdfFixture(string $content): string
{
    $stream = gzcompress($content);

    return "%PDF-1.4\n"
        ."1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n"
        .'4 0 obj << /Length '.strlen($stream)." /Filter /FlateDecode >> stream\n"
        .$stream
        ."\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n";
}

test('guests cannot upload documents', function () {
    $response = $this->postJson(route('api.documents.upload'), [
        'file' => uploadFile('document.pdf', pdfFixture('BT (Editable text) Tj ET')),
    ]);

    $response->assertUnauthorized();
});

test('a text-based PDF is stored as an editable document and consumes one unit', function () {
    $user = User::factory()->create();
    $file = uploadFile('contract.pdf', pdfFixture('BT /F1 12 Tf (Editable contract text) Tj ET'));

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => $file,
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.original_filename', 'contract.pdf')
        ->assertJsonPath('data.status', 'ready')
        ->assertJsonMissingPath('data.id');

    $document = Document::query()->whereBelongsTo($user)->firstOrFail();

    expect($document->is_editable)->toBeTrue()
        ->and($document->public_id)->toMatch('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i')
        ->and($document->stored_filename)->toStartWith('documents/'.$user->getKey().'/')
        ->and(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(1);

    expect(Storage::disk('local')->exists($document->stored_filename))->toBeTrue();
});

test('a compressed text-based PDF is accepted', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('compressed.pdf', compressedPdfFixture('BT (Compressed text) Tj ET')),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(1);
});

test('image-only PDFs are rejected without consuming usage', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('photo.pdf', pdfFixture('q /Im0 Do Q')),
    ]);

    $response->assertUnprocessable()
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'NON_EDITABLE_PDF')
        ->assertJsonPath('message', "This type of file can't be edited. Please upload an exact PDF file format.");

    expect(Document::query()->whereBelongsTo($user)->count())->toBe(0)
        ->and(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(0);
});

test('scanned and empty PDFs are rejected without consuming usage', function (string $content) {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('scanned.pdf', pdfFixture($content)),
    ])->assertUnprocessable()->assertJsonPath('code', 'NON_EDITABLE_PDF');

    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(0);
})->with([
    'scanned image content' => 'q /Image Do Q',
    'empty content' => 'q Q',
]);

test('a mixed PDF is accepted when it contains meaningful extractable text', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('mixed.pdf', pdfFixture('q /Image Do Q BT (Invoice total 100) Tj ET')),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(1);
});

test('a PDF using TJ array operator is accepted', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('tj-array.pdf', pdfFixture('BT /F1 12 Tf [(Hello) -100 (World)] TJ ET')),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(1);
});

test('a PDF with hex-encoded UTF-16BE text is accepted', function () {
    $user = User::factory()->create();

    // "Hello" in UTF-16BE hex encoding
    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('unicode.pdf', pdfFixture('BT /F1 12 Tf <00480065006C006C006F> Tj ET')),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(1);
});

test('a real-world CV PDF with ToUnicode CMap and CID font is accepted', function () {
    $user = User::factory()->create();

    $toUnicodeCMap = <<<'CMAP'
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
2 beginbfchar
<0001> <0041>
<0002> <0042>
endbfchar
1 beginbfrange
<0003> <0006> <0043>
endbfrange
endcmap
CMapName currentdict /CMap defineresource pop
end
end
CMAP;

    $content = "%PDF-1.5\n"
        ."1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        ."4 0 obj << /Length 45 >> stream\nBT /F1 12 Tf <00010002000300040005> Tj ET\nendstream endobj\n"
        ."5 0 obj << /Type /Font /Subtype /Type0 /ToUnicode 6 0 R >> endobj\n"
        .'6 0 obj << /Length '.strlen($toUnicodeCMap)." >> stream\n".$toUnicodeCMap."\nendstream endobj\n"
        ."trailer << /Root 1 0 R >>\n%%EOF\n";

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('abdo_cv.pdf', $content),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(1);
});

test('a PDF using one-byte ToUnicode CMap codes in literal strings is accepted', function () {
    $user = User::factory()->create();

    $toUnicodeCMap = <<<'CMAP'
begincmap
3 beginbfchar
<01> <0043>
<02> <0056>
<03> <0041>
endbfchar
endcmap
CMAP;

    $content = "%PDF-1.5\n"
        ."1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        ."4 0 obj << /Length 24 >> stream\nBT /F1 12 Tf (\x01\x02\x03) Tj ET\nendstream endobj\n"
        ."5 0 obj << /Type /Font /Subtype /Type0 /ToUnicode 6 0 R >> endobj\n"
        .'6 0 obj << /Length '.strlen($toUnicodeCMap)." >> stream\n".$toUnicodeCMap."\nendstream endobj\n"
        ."trailer << /Root 1 0 R >>\n%%EOF\n";

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('word-export.pdf', $content),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
});

test('a text-based PDF with non-UTF-8 spacing bytes is accepted', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile('word-export.pdf', pdfFixture("BT /F1 12 Tf (Abdo\xA0Mohammed) Tj ET")),
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'ready');
});

test('renamed images and malformed PDFs are rejected', function (string $filename, string $contents) {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => uploadFile($filename, $contents),
    ])->assertUnprocessable()->assertJsonPath('success', false);

    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(0);
})->with([
    'renamed image' => ['image.pdf', "\x89PNG\r\n\x1a\n"],
    'malformed pdf' => ['broken.pdf', '%PDF-1.4\nnot finished'],
]);

test('JPG and PNG uploads are rejected', function (string $filename) {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => UploadedFile::fake()->image($filename),
    ])->assertUnprocessable()->assertJsonPath('success', false);

    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(0);
})->with([
    'jpg upload' => ['photo.jpg'],
    'png upload' => ['photo.png'],
]);

test('oversized files are rejected before PDF analysis', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('api.documents.upload'), [
        'file' => UploadedFile::fake()->create('large.pdf', 20481, 'application/pdf'),
    ])->assertUnprocessable()->assertJsonPath('success', false);

    expect(UsageRecord::query()->whereBelongsTo($user)->count())->toBe(0);
});
