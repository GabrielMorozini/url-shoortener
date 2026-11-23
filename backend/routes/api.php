<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LinkController;
use Illuminate\Support\Facades\Route;

// Login só do administrador (não existe cadastro)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Aceitam admin (Bearer) ou sessão anônima (X-Session-Id); a checagem fica no controller
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/links', [LinkController::class, 'index']);
    Route::post('/links', [LinkController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/links/{link:code}', [LinkController::class, 'show']);
    Route::patch('/links/{link:code}', [LinkController::class, 'update']);
    Route::delete('/links/{link:code}', [LinkController::class, 'destroy']);
});