<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LoginLogController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user(), 401);

        return response()->json([
            'logs' => $request->user()->loginLogs()
                ->latest('logged_in_at')
                ->limit(20)
                ->get(['id', 'provider', 'ip_address', 'user_agent', 'logged_in_at']),
        ]);
    }
}
