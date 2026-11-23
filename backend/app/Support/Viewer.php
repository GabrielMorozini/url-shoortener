<?php

namespace App\Support;

use App\Models\Link;
use Illuminate\Http\Request;

final class Viewer
{
    public function __construct(
        public readonly ?string $sessionHash,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        $sessionId = (string) $request->header('X-Session-Id', '');

        $sessionHash = null;

        if (preg_match('/^[A-Za-z0-9-]{32,64}$/', $sessionId)) {
            $sessionHash = hash_hmac(
                'sha256',
                $sessionId,
                config('app.key')
            );
        }

        return new self($sessionHash);
    }

    public function isAnonymous(): bool
    {
        return $this->sessionHash === null;
    }

    public function owns(Link $link): bool
    {
        return $this->sessionHash !== null
            && $link->session_hash !== null
            && hash_equals($link->session_hash, $this->sessionHash);
    }

    public function canView(Link $link): bool
    {
        return $this->owns($link);
    }
}