<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiScannerService
{
    public function scan(string $goal, array $files, string $mode = 'document-scan'): array
    {
        $key = trim((string) config('services.gemini.key'));
        if ($key === '') throw new RuntimeException('Google AI is not configured on the server.');

        $models = collect(explode(',', (string) config('services.gemini.models')))
            ->map(fn ($model) => trim($model))->filter()->map(fn ($model) => str_starts_with($model, 'models/') ? $model : 'models/'.$model)->values();
        if ($models->isEmpty()) $models = collect(['models/gemini-2.5-flash']);

        $parts = [['text' => $this->prompt($goal, $files, $mode)]];
        foreach ($files as $file) {
            if (($file['kind'] ?? '') === 'text') {
                $parts[] = ['text' => "\n--- ".($file['name'] ?? 'document')." ---\n".mb_substr((string) ($file['text'] ?? ''), 0, 60000)];
            } elseif (!empty($file['data'])) {
                $parts[] = ['inline_data' => ['mime_type' => $this->mime($file['name'] ?? '', $file['type'] ?? ''), 'data' => $file['data']]];
            }
        }

        $lastError = 'Google AI scan failed.';
        foreach ($models as $model) {
            $response = Http::timeout(90)->acceptJson()->post("https://generativelanguage.googleapis.com/v1beta/{$model}:generateContent?key=".urlencode($key), [
                'contents' => [['role' => 'user', 'parts' => $parts]],
                'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 8192, 'responseMimeType' => 'application/json'],
            ]);
            if ($response->successful()) {
                $text = collect(data_get($response->json(), 'candidates.0.content.parts', []))->pluck('text')->filter()->implode("\n");
                $analysis = $this->normalize($this->parseJson($text), $text);
                return ['result' => $this->format($analysis), 'analysis' => $analysis, 'model' => $model];
            }
            $lastError = (string) data_get($response->json(), 'error.message', $lastError);
            if (!in_array($response->status(), [400, 404, 429, 500, 502, 503, 504], true)) break;
        }
        throw new RuntimeException($lastError);
    }

    private function prompt(string $goal, array $files, string $mode): string
    {
        $fileList = collect($files)->map(fn ($file, $i) => ($i + 1).'. '.($file['name'] ?? 'document').' ('.($file['type'] ?? 'document').')')->implode("\n");
        return "You are TuklasAI, a practical Philippine career and document intelligence assistant. Mode: {$mode}. Answer the user's goal using only supplied evidence when files exist. Do not invent qualifications. Recommend real TESDA programs and practical learning resources. Return ONLY valid JSON with exactly these keys: summary (string), skillsDetected (array of strings), careerMatches (array of {name,match}), jobRecommendations (array), skillGaps (array of strings), tesdaRecommendations (array of strings), learningRecommendations (array of objects with title,type,reason,evidence,searchTerms,directUrl,learningSite), nextActions (array of strings). Be honest when evidence is limited. User goal: ".($goal ?: 'Comprehensive resume and career scan')."\nFiles:\n{$fileList}";
    }

    private function parseJson(string $text): array
    {
        $clean = trim(preg_replace('/```(?:json)?\s*([\s\S]*?)\s*```/i', '$1', $text));
        $decoded = json_decode($clean, true);
        if (is_array($decoded)) return $decoded;
        if (preg_match('/\{[\s\S]*\}/', $clean, $match)) return json_decode($match[0], true) ?: [];
        return [];
    }

    private function normalize(array $analysis, string $text): array
    {
        $array = fn ($value) => is_array($value) ? array_values(array_filter($value)) : ($value ? [(string) $value] : []);
        return [
            'summary' => $analysis['summary'] ?? $text ?: 'Document analysis completed successfully.',
            'sourceUrls' => [], 'skillsDetected' => array_slice($array($analysis['skillsDetected'] ?? []), 0, 20),
            'careerMatches' => array_slice(array_map(fn ($item) => ['name' => $item['name'] ?? 'Career Match', 'match' => $item['match'] ?? '70%'], is_array($analysis['careerMatches'] ?? null) ? $analysis['careerMatches'] : []), 0, 10),
            'jobRecommendations' => array_slice(is_array($analysis['jobRecommendations'] ?? null) ? $analysis['jobRecommendations'] : [], 0, 10),
            'skillGaps' => array_slice($array($analysis['skillGaps'] ?? []), 0, 20), 'tesdaRecommendations' => array_slice($array($analysis['tesdaRecommendations'] ?? []), 0, 15),
            'learningRecommendations' => array_slice(is_array($analysis['learningRecommendations'] ?? null) ? $analysis['learningRecommendations'] : [], 0, 15),
            'nextActions' => array_slice($array($analysis['nextActions'] ?? []), 0, 10),
        ];
    }

    private function format(array $analysis): string
    {
        $list = fn ($items) => count($items) ? collect($items)->map(fn ($item) => '- '.(is_array($item) ? ($item['name'] ?? $item['title'] ?? json_encode($item)) : $item))->implode("\n") : '- None returned';
        return "File Summary\n{$analysis['summary']}\n\nSkills Detected\n".$list($analysis['skillsDetected'])."\n\nBest Matching Career Areas\n".$list($analysis['careerMatches'])."\n\nSkill Gaps\n".$list($analysis['skillGaps'])."\n\nTESDA Recommendations\n".$list($analysis['tesdaRecommendations'])."\n\nSuggested Next Actions\n".$list($analysis['nextActions']);
    }

    private function mime(string $name, string $type): string
    {
        if ($type && $type !== 'application/octet-stream') return $type;
        return match (strtolower(pathinfo($name, PATHINFO_EXTENSION))) { 'pdf' => 'application/pdf', 'png' => 'image/png', 'jpg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'txt' => 'text/plain', 'csv' => 'text/csv', 'json' => 'application/json', default => 'application/pdf' };
    }
}
