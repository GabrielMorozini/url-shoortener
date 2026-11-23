<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\LinkAccess;
use App\Support\Viewer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LinkController extends Controller
{
    // Sessão: só os links criados nela. Admin: todos.
    public function index(Request $request): JsonResponse
    {
        $viewer = $this->viewer($request);

        $links = Link::query()
            ->with('user:id,name,email')
            ->withCount('accesses')
            ->when(! $viewer->isAdmin(), fn ($q) => $q->where('session_hash', $viewer->sessionHash))
            ->latest()
            ->paginate(20);

        return response()->json(
            $links->through(fn (Link $link) => $this->format($link, $viewer))
        );
    }

    // Cria um link curto que expira em 1 semana
    public function store(Request $request): JsonResponse
    {
        $viewer = $this->viewer($request);

        $data = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2048'],
        ]);

        $link = Link::create([
            'code' => $this->generateCode(),
            'original_url' => $data['url'],
            'expires_at' => now()->addWeek(),
            'user_id' => $viewer->user?->id,
            'session_hash' => $viewer->user ? null : $viewer->sessionHash,
        ]);

        return response()->json($this->format($link, $viewer), 201);
    }

    public function show(Request $request, Link $link): JsonResponse
    {
        $viewer = $this->viewer($request);
        abort_unless($viewer->canView($link), 403, 'Você não pode ver este link.');

        $link->loadCount('accesses')->load('user:id,name,email');

        return response()->json($this->format($link, $viewer));
    }

    // Edita a URL de destino (código curto e validade não mudam)
    public function update(Request $request, Link $link): JsonResponse
    {
        $viewer = $this->viewer($request);
        abort_unless($viewer->owns($link), 403, 'Você só pode editar o seu próprio link.');

        $data = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2048'],
        ]);

        $link->update(['original_url' => $data['url']]);
        $link->loadCount('accesses');

        return response()->json($this->format($link, $viewer));
    }

    public function destroy(Request $request, Link $link): JsonResponse
    {
        $viewer = $this->viewer($request);
        abort_unless($viewer->owns($link), 403, 'Você só pode apagar o seu próprio link.');

        $link->delete();

        return response()->json(null, 204);
    }

    // Rota pública: redireciona, conta o acesso e recusa links expirados
    public function redirect(Request $request, string $code): RedirectResponse
    {
        $link = Link::where('code', $code)->firstOrFail();

        if ($link->isExpired()) {
            abort(410, 'Este link expirou.');
        }

        $link->increment('clicks');

        // "pessoa" = hash de IP + navegador; o índice único evita contar duas vezes
        LinkAccess::insertOrIgnore([
            'link_id' => $link->id,
            'visitor_hash' => hash_hmac(
                'sha256',
                $request->ip() . '|' . $request->userAgent(),
                config('app.key')
            ),
            'created_at' => now(),
        ]);

        return redirect()->away($link->original_url);
    }

    // Exige token de admin válido OU um X-Session-Id válido
    private function viewer(Request $request): Viewer
    {
        $viewer = Viewer::fromRequest($request);

        abort_if($viewer->isAnonymous(), 401, 'Sessão inválida.');

        return $viewer;
    }

    private function format(Link $link, Viewer $viewer): array
    {
        $data = [
            'code' => $link->code,
            'original_url' => $link->original_url,
            'short_url' => url('/' . $link->code),
            'clicks' => $link->clicks,
            'unique_visitors' => $link->accesses_count ?? $link->accesses()->count(),
            'expires_at' => $link->expires_at,
            'is_expired' => $link->isExpired(),
            'is_owner' => $viewer->owns($link),
            'created_at' => $link->created_at,
        ];

        if ($viewer->isAdmin()) {
            // null = link de visitante (sessão) ou link antigo
            $data['owner'] = $link->user?->only(['id', 'name', 'email']);
        }

        return $data;
    }

    // Gera um código aleatório que ainda não existe no banco
    private function generateCode(int $length = 6): string
    {
        do {
            $code = Str::random($length);
        } while (Link::where('code', $code)->exists());

        return $code;
    }
}