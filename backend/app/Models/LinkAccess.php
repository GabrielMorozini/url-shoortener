<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LinkAccess extends Model
{
    public $timestamps = false;

    protected $fillable = ['link_id', 'visitor_hash', 'created_at'];
}