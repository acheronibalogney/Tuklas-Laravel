<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RespondsWithTuklasData;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use RespondsWithTuklasData;
    public function handle(Request $request) {
        if (!$request->user()) return $this->unauthorized();
        $actor = $request->user(); $email = strtolower((string) $request->query('email', $request->input('email', '')));
        if ($request->isMethod('get')) { if ($email && $actor->role !== 'admin' && $actor->email !== $email) return response()->json(['error' => 'You may only access your own account.'], 403); if (!$email && $actor->role !== 'admin') return response()->json(['error' => 'Admin access required.'], 403); $users = $email ? User::where('email', $email)->get() : User::query()->latest()->get(); return response()->json($email ? ($users->first() ? $this->publicUser($users->first()) : null) : $users->map(fn (User $u) => $this->publicUser($u))); }
        if ($request->isMethod('delete')) { abort_unless($actor->role === 'admin', 403); User::where('email', $email)->delete(); return response()->json(['ok' => true]); }
        if (!$email || ($actor->role !== 'admin' && $actor->email !== $email)) return response()->json(['error' => 'You may only update your own account.'], 403);
        $user = User::where('email', $email)->firstOrFail(); $updates = $request->except(['_id','email','password','passwordHash','emailHash','role','status','account']); $updates = array_merge($updates, is_array($request->input('account')) ? $request->input('account') : []); if ($request->filled('password')) $updates['password'] = $request->input('password'); $user->fill($updates); $user->save(); return response()->json($this->publicUser($user));
    }
}
