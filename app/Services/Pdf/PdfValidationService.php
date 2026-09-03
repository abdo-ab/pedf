<?php

namespace App\Services\Pdf;

use Illuminate\Http\UploadedFile;

class PdfValidationService
{
    public const NON_EDITABLE_MESSAGE = "This type of file can't be edited. Please upload an exact PDF file format.";

    public function validate(UploadedFile $file): PdfValidationResult
    {
        $path = $file->getRealPath();
        $contents = $path === false ? false : file_get_contents($path);

        if ($contents === false || ! str_contains(substr($contents, 0, 1024), '%PDF-')) {
            return new PdfValidationResult(false, false, 'Invalid PDF file.', 'INVALID_PDF');
        }

        if (! str_contains(substr($contents, -4096), '%%EOF') || ! $this->hasValidCatalogOrStructure($contents)) {
            return new PdfValidationResult(false, false, 'Invalid PDF file.', 'INVALID_PDF');
        }

        $pageCount = $this->detectPageCount($contents);
        $text = $this->extractText($contents);

        if (! $this->hasMeaningfulText($text)) {
            return new PdfValidationResult(true, false, self::NON_EDITABLE_MESSAGE, 'NON_EDITABLE_PDF', $pageCount);
        }

        return new PdfValidationResult(true, true, 'PDF is ready for editing.', 'EDITABLE_PDF', $pageCount);
    }

    private function hasValidCatalogOrStructure(string $contents): bool
    {
        return preg_match('/\/Type\s*\/Catalog\b|\/Root\b|\/ObjStm\b|\/Pages\b/', $contents) === 1;
    }

    private function detectPageCount(string $contents): int
    {
        $count = preg_match_all('/\/Type\s*\/Page\b/', $contents, $matches);
        if ($count > 0) {
            return $count;
        }

        if (preg_match('/\/Count\s+(\d+)/', $contents, $match)) {
            return max(1, (int) $match[1]);
        }

        return 1;
    }

    private function extractText(string $contents): string
    {
        // 1. Gather all decompressed stream texts
        preg_match_all('/stream[\r\n]+(.*?)endstream/s', $contents, $matches, PREG_OFFSET_CAPTURE);
        $decodedStreams = [];

        foreach ($matches[1] as [$stream, $offset]) {
            $lookBack = min($offset, 2048);
            $streamHeader = substr($contents, $offset - $lookBack, $lookBack);
            $decodedStreams[] = $this->decodeStream($stream, $streamHeader);
        }

        // 2. Parse ToUnicode CMaps to support CID fonts (very common in modern exported PDFs)
        $toUnicodeMap = $this->parseToUnicodeCMaps($decodedStreams);

        $extracted = [];

        // 3. Extract text from BT...ET blocks across streams
        foreach ($decodedStreams as $streamText) {
            if ($streamText === '') {
                continue;
            }

            if (preg_match_all('/BT(.*?)ET/s', $streamText, $textBlocks)) {
                foreach ($textBlocks[1] as $textBlock) {
                    $extracted[] = $this->decodePdfStrings($textBlock, $toUnicodeMap);
                }
            }
        }

        // 4. Extract document metadata strings (Title, Author, Subject, etc.)
        if (preg_match_all('/\/(Title|Author|Subject|Keywords)\s*\((.*?)\)/s', $contents, $metaMatches)) {
            foreach ($metaMatches[2] as $metaValue) {
                $extracted[] = stripcslashes($metaValue);
            }
        }

        $allText = implode(' ', $extracted);

        // 5. Fallback: if no text from BT..ET, look for readable word sequences in decompressed streams
        if (! $this->hasMeaningfulText($allText)) {
            $words = [];
            foreach ($decodedStreams as $streamText) {
                if ($streamText === '') {
                    continue;
                }

                // If stream contains font definitions (/Font, /BaseFont, etc.), record font names as text indicators
                if (preg_match_all('#/BaseFont\s*/([A-Za-z0-9\+\-]+)#', $streamText, $fontMatches)) {
                    foreach ($fontMatches[1] as $fontName) {
                        $words[] = (string) preg_replace('/^[A-Z]{6}\+/', '', $fontName);
                    }
                }

                // Strip non-printable binary bytes and collect clean words
                $cleaned = (string) preg_replace('/[^\x20-\x7E]+/', ' ', $streamText);
                if (preg_match_all('/\b[\pL]{3,}\b/u', $cleaned, $wordMatches)) {
                    $pdfKeywords = [
                        'stream', 'endstream', 'obj', 'endobj', 'Filter', 'FlateDecode', 'Length',
                        'Type', 'Catalog', 'Pages', 'Page', 'Width', 'Height', 'Image', 'XObject',
                        'Subtype', 'ColorSpace', 'DeviceRGB', 'BitsPerComponent', 'DCTDecode',
                        'CCITTFaxDecode', 'MediaBox', 'Resources', 'ProcSet', 'Parent', 'Contents',
                        'Kids', 'Count', 'Root', 'Trailer', 'Font', 'FontDescriptor', 'BaseFont',
                    ];
                    foreach ($wordMatches[0] as $word) {
                        if (! in_array($word, $pdfKeywords, true)) {
                            $words[] = $word;
                        }
                    }
                }
            }

            $allText .= ' '.implode(' ', $words);
        }

        return $allText;
    }

    private function decodeStream(string $stream, string $header): string
    {
        $stream = rtrim($stream, "\r\n");

        if (str_contains($header, 'FlateDecode') || str_contains($header, '/Fl') || str_starts_with($stream, "\x78")) {
            $decoded = @gzuncompress($stream);
            if ($decoded !== false) {
                return $decoded;
            }

            $decoded = @gzinflate($stream);
            if ($decoded !== false) {
                return $decoded;
            }

            if (strlen($stream) > 2) {
                $decoded = @gzinflate(substr($stream, 2));
                if ($decoded !== false) {
                    return $decoded;
                }
            }
        }

        return $stream;
    }

    /**
     * Parse ToUnicode CMaps from decoded streams.
     *
     * @param  array<int, string>  $decodedStreams
     * @return array<string, string>
     */
    private function parseToUnicodeCMaps(array $decodedStreams): array
    {
        $map = [];

        foreach ($decodedStreams as $streamText) {
            if (! str_contains($streamText, 'begincmap')) {
                continue;
            }

            // Parse beginbfchar ... endbfchar
            if (preg_match_all('/beginbfchar(.*?)endbfchar/s', $streamText, $bfCharBlocks)) {
                foreach ($bfCharBlocks[1] as $block) {
                    preg_match_all('/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/', $block, $matches, PREG_SET_ORDER);
                    foreach ($matches as $match) {
                        $srcHex = strtoupper($match[1]);
                        $dstHex = $match[2];
                        $map[$srcHex] = $this->hexToUnicodeString($dstHex);
                    }
                }
            }

            // Parse beginbfrange ... endbfrange
            if (preg_match_all('/beginbfrange(.*?)endbfrange/s', $streamText, $bfRangeBlocks)) {
                foreach ($bfRangeBlocks[1] as $block) {
                    // Form 1: <startHex> <endHex> <dstStartHex>
                    preg_match_all('/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/', $block, $matches, PREG_SET_ORDER);
                    foreach ($matches as $match) {
                        $start = hexdec($match[1]);
                        $end = hexdec($match[2]);
                        $dstStart = hexdec($match[3]);
                        $len = strlen($match[1]);

                        for ($i = 0; $i <= ($end - $start); $i++) {
                            $srcHex = strtoupper(sprintf('%0'.$len.'X', $start + $i));
                            $dstHex = sprintf('%04X', $dstStart + $i);
                            $map[$srcHex] = $this->hexToUnicodeString($dstHex);
                        }
                    }

                    // Form 2: <startHex> <endHex> [<dstHex1> <dstHex2> ...]
                    preg_match_all('/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[\s*(.*?)\s*\]/s', $block, $arrayMatches, PREG_SET_ORDER);
                    foreach ($arrayMatches as $match) {
                        $start = hexdec($match[1]);
                        $len = strlen($match[1]);
                        preg_match_all('/<([0-9A-Fa-f]+)>/', $match[3], $dstHexes);

                        foreach ($dstHexes[1] as $i => $dstHex) {
                            $srcHex = strtoupper(sprintf('%0'.$len.'X', $start + $i));
                            $map[$srcHex] = $this->hexToUnicodeString($dstHex);
                        }
                    }
                }
            }
        }

        return $map;
    }

    private function hexToUnicodeString(string $hex): string
    {
        $binary = hex2bin(strlen($hex) % 2 === 0 ? $hex : $hex.'0');
        if ($binary === false) {
            return '';
        }

        $utf8 = $this->tryDecodeUtf16Be($binary);

        return $utf8 ?? $binary;
    }

    /**
     * Decode PDF strings using ToUnicode map.
     *
     * @param  array<string, string>  $toUnicodeMap
     */
    private function decodePdfStrings(string $textBlock, array $toUnicodeMap): string
    {
        $decoded = [];

        // Literal strings (...)
        preg_match_all('/\(((?:[^()\\\\]|\\\\.|(?:\((?:[^()\\\\]|\\\\.)*\)))*)\)/s', $textBlock, $literalMatches);
        foreach ($literalMatches[1] as $literal) {
            $decoded[] = $this->decodePdfToken(stripcslashes($literal), $toUnicodeMap);
        }

        // Hex strings <...>
        preg_match_all('/<([0-9A-Fa-f\s]+)>/', $textBlock, $hexMatches);
        foreach ($hexMatches[1] as $hex) {
            $cleanHex = (string) preg_replace('/\s+/', '', $hex);
            $decoded[] = $this->decodeHexToken($cleanHex, $toUnicodeMap);
        }

        // TJ array operator: [(string) num (string) num ...] TJ
        if (preg_match_all('/\[(.*?)\]\s*TJ/si', $textBlock, $tjMatches)) {
            foreach ($tjMatches[1] as $tjContent) {
                preg_match_all('/\(((?:[^()\\\\]|\\\\.|(?:\((?:[^()\\\\]|\\\\.)*\)))*)\)/s', $tjContent, $tjLiterals);
                foreach ($tjLiterals[1] as $literal) {
                    $decoded[] = $this->decodePdfToken(stripcslashes($literal), $toUnicodeMap);
                }

                preg_match_all('/<([0-9A-Fa-f\s]+)>/', $tjContent, $tjHex);
                foreach ($tjHex[1] as $hex) {
                    $cleanHex = (string) preg_replace('/\s+/', '', $hex);
                    $decoded[] = $this->decodeHexToken($cleanHex, $toUnicodeMap);
                }
            }
        }

        return implode(' ', $decoded);
    }

    /**
     * Decode hex token using ToUnicode map.
     *
     * @param  array<string, string>  $toUnicodeMap
     */
    private function decodeHexToken(string $hex, array $toUnicodeMap): string
    {
        if ($hex === '') {
            return '';
        }

        $binary = hex2bin(strlen($hex) % 2 === 0 ? $hex : $hex.'0');
        if ($binary === false) {
            return '';
        }

        return $this->decodePdfToken($binary, $toUnicodeMap);
    }

    /**
     * Decode PDF token using ToUnicode map.
     *
     * @param  array<string, string>  $toUnicodeMap
     */
    private function decodePdfToken(string $binary, array $toUnicodeMap): string
    {
        if (! empty($toUnicodeMap)) {
            $hex = strtoupper(bin2hex($binary));
            $lengths = array_unique(array_map('strlen', array_keys($toUnicodeMap)));
            rsort($lengths, SORT_NUMERIC);
            $translated = '';

            for ($offset = 0; $offset < strlen($hex);) {
                $matched = false;

                foreach ($lengths as $length) {
                    $code = substr($hex, $offset, $length);
                    if (strlen($code) === $length && isset($toUnicodeMap[$code])) {
                        $translated .= $toUnicodeMap[$code];
                        $offset += $length;
                        $matched = true;
                        break;
                    }
                }

                if (! $matched) {
                    $translated = '';
                    break;
                }
            }

            if ($translated !== '') {
                return $translated;
            }
        }

        return $this->tryDecodeUtf16Be($binary) ?? $binary;
    }

    private function tryDecodeUtf16Be(string $binary): ?string
    {
        $len = strlen($binary);
        if ($len < 2 || $len % 2 !== 0) {
            return null;
        }

        $zeroHighBytes = 0;
        for ($i = 0; $i < min($len, 20); $i += 2) {
            if (ord($binary[$i]) === 0) {
                $zeroHighBytes++;
            }
        }

        $sampled = min($len / 2, 10);
        // @phpstan-ignore-next-line - $sampled is guaranteed to be > 0 by min() logic
        if ($sampled > 0 && $zeroHighBytes / $sampled >= 0.5) {
            $converted = mb_convert_encoding($binary, 'UTF-8', 'UTF-16BE');

            // @phpstan-ignore-next-line - mb_convert_encoding returns string|false, explicit check needed
            return $converted !== false ? $converted : null;
        }

        return null;
    }

    private function hasMeaningfulText(string $text): bool
    {
        $cleaned = (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $text);
        $utf8Text = mb_convert_encoding($cleaned, 'UTF-8', 'UTF-8');
        $normalized = trim((string) (preg_replace('/\s+/u', ' ', $utf8Text) ?? ''));

        return mb_strlen($normalized) >= 2 && preg_match('/[\pL\pN]{2,}/u', $normalized) === 1;
    }
}
