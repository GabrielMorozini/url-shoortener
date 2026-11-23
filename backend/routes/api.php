<?php

use App\Http\Controllers\LinkController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/links', [LinkController::class, 'index']);
    Route::post('/links', [LinkController::class, 'store'])->middleware('throttle:20,1');

    Route::get('/links/{link:code}', [LinkController::class, 'show']);
    Route::patch('/links/{link:code}', [LinkController::class, 'update']);
    Route::delete('/links/{link:code}', [LinkController::class, 'destroy']);
});