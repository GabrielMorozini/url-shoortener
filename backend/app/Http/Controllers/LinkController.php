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
    // Lista somente os links pertencentes à sessão atual
    public function index(Request $request): JsonResponse
    {
        $viewer = $this->viewer($request);

        $links = Link::query()
            ->where('session_hash', $viewer->sessionHash)
            ->withCount('accesses')
            ->latest()
            ->paginate(20);

        return response()->json(
            $links->through(fn (Link $link) => $this->format($link, $viewer))
        );
    }

    // Cria um link com validade de 7 dias
    public function store(Request $request): JsonResponse
    {
        $viewer = $this->viewer($request);

        $data = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2048'],
        ]);

        $link = Link::create([
            'code' => $this->generateCode(),
            'original_url' => $data['url'],
            'clicks' => 0,
            'expires_at' => now()->addDays(7),
            'session_hash' => $viewer->sessionHash,
        ]);

        $link->loadCount('accesses');

        return response()->json($this->format($link, $viewer), 201);
    }

    // Visualiza somente um link da sessão atual
    public function show(Request $request, Link $link): JsonResponse
    {
        $viewer = $this->viewer($request);

        abort_unless(
            $viewer->canView($link),
            403,
            'Você não pode ver este link.'
        );

        $link->loadCount('accesses');

        return response()->json($this->format($link, $viewer));
    }

    // Edita somente a URL original
    public function update(Request $request, Link $link): JsonResponse
    {
        $viewer = $this->viewer($request);

        abort_unless(
            $viewer->owns($link),
            403,
            'Você só pode editar o seu próprio link.'
        );

        $data = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2048'],
        ]);

        $link->update([
            'original_url' => $data['url'],
        ]);

        $link->loadCount('accesses');

        return response()->json($this->format($link, $viewer));
    }

    // Apaga somente um link da sessão atual
    public function destroy(Request $request, Link $link): JsonResponse
    {
        $viewer = $this->viewer($request);

        abort_unless(
            $viewer->owns($link),
            403,
            'Você só pode apagar o seu próprio link.'
        );

        $link->delete();

        return response()->json(null, 204);
    }

    // Redirecionamento público do link curto
    public function redirect(Request $request, string $code): RedirectResponse
    {
        $link = Link::where('code', $code)->firstOrFail();

        if ($link->isExpired()) {
            abort(410, 'Este link expirou.');
        }

        $link->increment('clicks');

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

    // Identifica a sessão anônima
    private function viewer(Request $request): Viewer
    {
        $viewer = Viewer::fromRequest($request);

        abort_if(
            $viewer->isAnonymous(),
            401,
            'Sessão inválida.'
        );

        return $viewer;
    }

    // Formata os dados enviados ao frontend
    private function format(Link $link, Viewer $viewer): array
    {
        return [
            'code' => $link->code,
            'original_url' => $link->original_url,
            'short_url' => url('/' . $link->code),
            'clicks' => $link->clicks,
            'unique_visitors' => $link->accesses_count ?? 0,
            'expires_at' => $link->expires_at,
            'is_expired' => $link->isExpired(),
            'is_owner' => $viewer->owns($link),
            'created_at' => $link->created_at,
        ];
    }

    // Gera um código aleatório único
    private function generateCode(int $length = 6): string
    {
        do {
            $code = Str::random($length);
        } while (Link::where('code', $code)->exists());

        return $code;
    }
}