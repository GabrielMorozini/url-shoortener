<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LinkController extends Controller
{
    // Lista os últimos links criados
    public function index(): JsonResponse
    {
        $links = Link::latest()->limit(20)->get()->map(fn (Link $link) => [
            'code' => $link->code,
            'original_url' => $link->original_url,
            'short_url' => url('/' . $link->code),
            'clicks' => $link->clicks,
            'created_at' => $link->created_at,
        ]);

        return response()->json($links);
    }

    // Cria um link curto
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2048'],
        ]);

        $link = Link::create([
            'code' => $this->generateCode(),
            'original_url' => $data['url'],
        ]);

        return response()->json([
            'code' => $link->code,
            'original_url' => $link->original_url,
            'short_url' => url('/' . $link->code),
        ], 201);
    }

    // Redireciona para a URL original
    public function redirect(string $code): RedirectResponse
    {
        $link = Link::where('code', $code)->firstOrFail();

        $link->increment('clicks');

        return redirect()->away($link->original_url);
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