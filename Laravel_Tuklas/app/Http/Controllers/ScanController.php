<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\Scan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\GeminiScannerService;

class ScanController extends Controller
{
    public function handle(Request $request) {
        $user = $request->user(); if (!$user) return response()->json(['error' => 'Authentication required.'], 401);
        if ($request->isMethod('get')) return response()->json($user->scans()->latest('analyzed_at')->get()->map(fn ($s) => array_merge($s->toArray(), ['analysis' => $s->analysis])));
        $request->validate(['analysis' => 'required|array']); $incoming = $request->input('analysis'); $previous = $user->analysis ?: [];
        $merged = array_merge($previous, $incoming, ['analyzedAt' => $incoming['analyzedAt'] ?? now()->toIso8601String()]);
        $merged['extractedSkills'] = array_values(array_unique(array_merge($previous['extractedSkills'] ?? [], $incoming['extractedSkills'] ?? [], $incoming['skillsDetected'] ?? [])));
        $scanId = ($user->workspace_id ?: 'user-'.$user->id).'-scan-'.Str::uuid(); $folder = Folder::create(['user_id' => $user->id, 'folder_id' => $scanId, 'folder_name' => ($user->email).' scan '.now()->format('Y-m-d-His'), 'type' => 'scan', 'metadata' => ['fileName' => $merged['fileName'] ?? '']]);
        Scan::create(['user_id' => $user->id, 'scan_id' => $scanId, 'folder_name' => $folder->folder_name, 'file_name' => $merged['fileName'] ?? '', 'source' => $merged['source'] ?? 'AI Scanner', 'analyzed_at' => now(), 'analysis' => $merged]); $user->update(['analysis' => $merged]);
        return response()->json(['ok' => true, 'scanId' => $scanId, 'folderName' => $folder->folder_name]);
    }
    public function analyze(Request $request, GeminiScannerService $scanner) {
        if (!$request->user()) return response()->json(['error' => 'Authentication required.'], 401);
        $data = $request->validate(['goal' => 'nullable|string|max:5000', 'mode' => 'nullable|string|max:80', 'files' => 'array|max:8', 'files.*.name' => 'nullable|string|max:255', 'files.*.type' => 'nullable|string|max:120', 'files.*.kind' => 'nullable|string|max:30', 'files.*.text' => 'nullable|string|max:60000', 'files.*.data' => 'nullable|string']);
        $files = $data['files'] ?? []; $bytes = collect($files)->sum(fn ($file) => (int) ceil(strlen((string) ($file['data'] ?? $file['text'] ?? '')) * .75));
        if ($bytes > 18 * 1024 * 1024) return response()->json(['error' => 'Selected files are too large for one scan.'], 413);
        try { return response()->json($scanner->scan($data['goal'] ?? '', $files, $data['mode'] ?? 'document-scan')); }
        catch (\Throwable $error) { return response()->json(['error' => $error->getMessage() ?: 'Unable to scan these files.'], $error->getCode() >= 400 && $error->getCode() < 600 ? $error->getCode() : 500); }
    }
}
