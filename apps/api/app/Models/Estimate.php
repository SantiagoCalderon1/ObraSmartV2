<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estimate extends Model
{
    use HasFactory;
    protected $primaryKey = 'estimate_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'estimate_number',
        'client_id',
        'project_id',
        'user_id',
        'iva',
        'total_cost',
        'status',
        'issue_date',
        'due_date',
        'conditions',
    ];

    /*
    si quiero biscar por otro campo por medio de la URL de la api hago esto 
    public function getRouteKeyName()
    {
        return 'estimate_number'; // por ejemplo
    } */


    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class, 'estimate_id', 'estimate_id');
    }

    public function materials()
    {
        return $this->hasMany(EstimateMaterial::class, 'estimate_id', 'estimate_id');
    }

    public function labors()
    {
        return $this->hasMany(EstimateLabor::class, 'estimate_id', 'estimate_id');
    }
}
