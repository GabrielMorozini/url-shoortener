<?php

namespace App\Support;

use App\Models\Link;
use App\Models\User;
use Illuminate\Http\Request;

final class Viewer
{
    public function __construct(
        public readonly ?User $user,
        public readonly ?string $sessionHash,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        $sessionId = (string) $request->header('X-Session-Id', '');
        $sessionHash = null;

        // só aceita IDs com formato plausível (UUID do front)
        if (preg_match('/^[A-Za-z0-9-]{32,64}$/', $sessionId)) {
            $sessionHash = hash_hmac('sha256', $sessionId, config('app.key'));
        }

        // token de admin (Sanctum), se houver e for válido
        return new self($request->user('sanctum'), $sessionHash);
    }

    public function isAnonymous(): bool
    {
        return $this->user === null && $this->sessionHash === null;
    }

    public function isAdmin(): bool
    {
        return $this->user !== null;
    }

    // Dono do link: o admin dono (user_id) ou a sessão que o criou
    public function owns(Link $link): bool
    {
        if ($this->user) {
            return $link->user_id !== null && (int) $link->user_id === (int) $this->user->id;
        }

        return $this->sessionHash !== null
            && $link->session_hash !== null
            && hash_equals($link->session_hash, $this->sessionHash);
    }

    // Ver: dono ou admin
    public function canView(Link $link): bool
    {
        return $this->isAdmin() || $this->owns($link);
    }
}