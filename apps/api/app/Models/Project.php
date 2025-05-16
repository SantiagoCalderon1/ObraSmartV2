<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;

    protected $primaryKey = 'project_id';


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'name',
        'description',
        'status',
        'start_date',
        'end_date',
    ];

    public function estimates()
    {
        return $this->hasMany(Estimate::class, 'project_id', 'project_id');
    }

    public function projectLogs()
    {
        return $this->hasMany(ProjectLog::class, 'project_id', 'project_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'material_id', 'material_id');
    }

    public function client()
{
    return $this->belongsTo(Client::class, 'client_id', 'client_id');
}
}
