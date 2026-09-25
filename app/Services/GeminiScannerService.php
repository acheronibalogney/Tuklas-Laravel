<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiScannerService
{
    private const DEFAULT_MODELS = [
        'models/gemini-3-flash-preview', 'models/gemini-3.1-flash-lite', 'models/gemini-flash-latest',
        'models/gemini-flash-lite-latest', 'models/gemini-3.1-pro-preview',
    ];

    public function scan(string $goal, array $files, string $mode = 'document-scan'): array
    {
        $key = trim((string) config('services.gemini.key'));
        if ($key === '') throw new RuntimeException('Google AI is not configured on the server.');

        $configured = collect(explode(',', (string) config('services.gemini.models')))
            ->map(fn ($model) => trim($model))->filter()
            ->map(fn ($model) => str_starts_with($model, 'models/') ? $model : 'models/'.$model)
            ->reject(fn ($model) => preg_match('/models\/gemini-(1\.|2\.0|2\.5)/i', $model))->unique()->values();
        $models = $configured->isNotEmpty() ? $configured : collect(self::DEFAULT_MODELS);

        $parts = [['text' => $this->prompt($goal, $files, $mode)]];
        foreach ($files as $file) {
            if (($file['kind'] ?? '') === 'text') {
                $parts[] = ['text' => "\n--- ".($file['name'] ?? 'document')." ---\n".mb_substr((string) ($file['text'] ?? ''), 0, 60000)];
            } elseif (!empty($file['data'])) {
                $parts[] = ['inline_data' => ['mime_type' => $this->mime($file['name'] ?? '', $file['type'] ?? ''), 'data' => $file['data']]];
            }
        }

        $requestBody = [
            'contents' => [['role' => 'user', 'parts' => $parts]],
            'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 8192, 'responseMimeType' => 'application/json'],
        ];
        try {
            $available = Http::timeout(15)->acceptJson()->get('https://generativelanguage.googleapis.com/v1beta/models', ['key' => $key]);
            if ($available->successful()) {
                $supported = collect(data_get($available->json(), 'models', []))
                    ->filter(fn ($item) => in_array('generateContent', $item['supportedGenerationMethods'] ?? [], true))
                    ->pluck('name')->all();
                $preferred = collect(self::DEFAULT_MODELS)->filter(fn ($model) => in_array($model, $supported, true));
                $matching = $models->filter(fn ($model) => in_array($model, $supported, true));
                $models = $matching->merge($preferred)->unique()->values();
            }
        } catch (\Throwable) {
            // Fall back to the configured/default model list if model discovery is unavailable.
        }

        $lastError = 'Google AI scan failed.';
        $sawRateLimit = false;
        $sawUnavailable = false;
        $retrySeconds = 0;
        foreach ($models as $model) {
            $response = Http::timeout(90)->acceptJson()->post("https://generativelanguage.googleapis.com/v1beta/{$model}:generateContent?key=".urlencode($key), $requestBody);
            if ($response->successful()) {
                $text = collect(data_get($response->json(), 'candidates.0.content.parts', []))->pluck('text')->filter()->implode("\n");
                $analysis = $this->normalize($this->parseJson($text), $text);
                return ['result' => $this->format($analysis), 'analysis' => $analysis, 'model' => $model];
            }
            $lastError = (string) data_get($response->json(), 'error.message', $lastError);
            if (in_array($response->status(), [401, 403], true)) {
                throw new RuntimeException('Gemini authentication failed. Check that GOOGLE_AI_API_KEY is a valid Gemini API key, then restart the server.', $response->status());
            }
            $quota = $response->status() === 429 || preg_match('/quota|rate.?limit/i', $lastError);
            $unavailable = in_array($response->status(), [500, 502, 503, 504], true);
            if ($quota) {
                $sawRateLimit = true;
                $retryAfter = (string) $response->header('Retry-After', '');
                if (is_numeric($retryAfter)) $retrySeconds = max($retrySeconds, (float) $retryAfter);
                elseif ($retryAfter !== '' && strtotime($retryAfter)) $retrySeconds = max($retrySeconds, max(0, strtotime($retryAfter) - time()));
                foreach ((array) data_get($response->json(), 'error.details', []) as $detail) {
                    if (preg_match('/^(\d+(?:\.\d+)?)s$/', (string) ($detail['retryDelay'] ?? ''), $match)) $retrySeconds = max($retrySeconds, (float) $match[1]);
                }
            }
            if ($unavailable) $sawUnavailable = true;
            if (!in_array($response->status(), [400, 404, 429, 500, 502, 503, 504], true)) break;
        }
        if ($retrySeconds > 0) {
            $lastError = 'Gemini quota reset/retry is estimated at '.now('Asia/Manila')->addSeconds((int) $retrySeconds)->format('M d, Y H:i:s').' Philippine time (24-hour clock). All configured models are currently rate-limited.';
            throw new RuntimeException($lastError, 429);
        }
        if ($sawRateLimit) throw new RuntimeException('All configured Gemini models are currently rate-limited. Google did not provide an exact quota reset time.', 429);
        if ($sawUnavailable) throw new RuntimeException('All configured Gemini models are temporarily unavailable. Please try again shortly.', 503);
        throw new RuntimeException($lastError);
    }

    private function prompt(string $goal, array $files, string $mode): string
    {
        $fileList = collect($files)->map(fn ($file, $i) => ($i + 1).'. '.($file['name'] ?? 'document').' ('.($file['type'] ?? 'document').')')->implode("\n");
        $careerChat = $mode === 'career-path' && count($files) === 0;
        $promptScan = $mode === 'prompt-scan';
        $modeName = $careerChat ? 'CAREER PATH GUIDE' : ($promptScan ? 'USER REQUEST WITH FILE EVIDENCE' : 'DOCUMENT SCANNER');
        $instructions = $promptScan
            ? "Answer the user's specific request about the uploaded files first. Follow requested limits and format, use the files as evidence, state when evidence is insufficient, and leave unrelated structured fields empty."
            : ($careerChat
                ? "Answer the latest message naturally as a general assistant. Handle non-career topics directly. For current facts, use honest caveats; do not claim qualifications or detected skills. When career guidance is requested, give practical Philippine-specific options and relevant field-appropriate resources with direct URLs."
                : 'Analyze only user-selected files. Extract education, certifications, experience, hard and soft skills, career paths, relevant TESDA training, and actionable learning recommendations. Ground claims in the documents and never invent qualifications.');
        $careerRules = $careerChat
            ? 'For greetings, small talk, or unrelated topics, answer naturally and return empty career arrays. Do not force career recommendations.'
            : 'For comprehensive document scans, include at least 8 distinct evidence-based skills, 6 specific skill gaps, 5 relevant real TESDA National Certificate recommendations, 6 learning items with direct URLs and approved learning sites, 5 realistic Philippine job titles, 3 job recommendations, and 5 actionable next steps. Tailor recommendations to the user goal and evidence. If there is no certification evidence, say so and recommend beginner-friendly ways to build it.';
        return <<<PROMPT
You are TuklasAI, an expert career and document intelligence assistant for a Philippine youth career platform. Every course, certificate, TESDA program, workplace, and learning site must be real and verifiable. Mode: {$modeName}.
{$instructions}
{$careerRules}
Specific requirements: use exact official TESDA National Certificate names and only recommend programs relevant to the evidence and goals. Learning recommendations must use a genuine existing course, certification, channel, or learning page and a direct URL (never a Google search URL), with a useful searchTerms string. Approved learningSite values are: "e-TESDA Online (etesda.gov.ph)", "Coursera (coursera.org)", "freeCodeCamp (freecodecamp.org)", "LinkedIn Learning (linkedin.com/learning)", "Udemy (udemy.com)", "Google Career Certificates (grow.google)", "Microsoft Learn (learn.microsoft.com)", "YouTube (youtube.com)", "Khan Academy (khanacademy.org)", "edX (edx.org)", "DICT iLearn (ilearn.dict.gov.ph)", and "Tesda Online Program (top.tesda.gov.ph)". For target careers, explain the bridge from current evidence and prioritize the smallest useful next skills. Consider all fields, including agriculture, fisheries, food, tourism, healthcare, education, business, trades, construction, transport, manufacturing, beauty, crafts, design, media, environment, science, sports, and entrepreneurship. Recommend resources from the most relevant field-appropriate providers.
Return ONLY valid JSON with exactly these keys: summary (string), skillsDetected (array of strings), careerMatches (array of {name,match}), jobRecommendations (array of {title,expectedMonthlySalary,workplaces,reason,evidence,searchTerms}), skillGaps (array of strings), tesdaRecommendations (array of strings), learningRecommendations (array of {title,type,reason,evidence,searchTerms,directUrl,learningSite}), nextActions (array of strings). For prompt-scan requests, the user request takes priority and unrelated arrays may be empty.
User goal and conversation: {$goal}
Files:
{$fileList}
PROMPT;
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
        $jobRecommendations = array_slice(is_array($analysis['jobRecommendations'] ?? null) ? $analysis['jobRecommendations'] : [], 0, 10);
        $jobRecommendations = array_values(array_map(function ($job) use ($array) {
            if (!is_array($job)) return null;
            $job['workplaces'] = $array($job['workplaces'] ?? []);
            return $job;
        }, $jobRecommendations));
        $jobRecommendations = array_values(array_filter($jobRecommendations));
        preg_match_all('/https?:\/\/[^\s"\'<>]+/', $text, $urlMatches);
        $sourceUrls = array_slice(array_unique(array_map(fn ($url) => rtrim($url, '),.;'), $urlMatches[0] ?? [])), 0, 6);
        return [
            'summary' => $analysis['summary'] ?? $text ?: 'Document analysis completed successfully.',
            'sourceUrls' => $sourceUrls, 'skillsDetected' => array_slice($array($analysis['skillsDetected'] ?? []), 0, 20),
            'careerMatches' => array_slice(array_map(fn ($item) => ['name' => $item['name'] ?? 'Career Match', 'match' => $item['match'] ?? '70%'], is_array($analysis['careerMatches'] ?? null) ? $analysis['careerMatches'] : []), 0, 10),
            'jobRecommendations' => $jobRecommendations,
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
