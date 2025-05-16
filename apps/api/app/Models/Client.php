<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;
    protected $primaryKey = 'client_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'name',
        'nif',
        'phone',
        'email',
        'address',
    ];

    public function estimates()
    {
        return $this->hasMany(Estimate::class, 'client_id', 'client_id');
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'client_id', 'client_id');
    }
}
