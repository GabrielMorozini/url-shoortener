<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:create {email} {name?}', function (string $email, ?string $name = null) {
    $password = (string) $this->secret('Senha (mínimo 8 caracteres)');

    if (strlen($password) < 8) {
        $this->error('Senha muito curta.');
        return 1;
    }

    User::updateOrCreate(
        ['email' => $email],
        ['name' => $name ?? 'Admin', 'password' => $password],
    );

    $this->info("Administrador {$email} criado/atualizado.");
})->purpose('Cria (ou troca a senha de) um administrador');