<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaborType extends Model
{
    /** @use HasFactory<\Database\Factories\LaborTypeFactory> */
    use HasFactory;

    protected $primaryKey = 'labor_type_id';


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'cost_per_hour',
    ];

    public function estimateLabors()
{
    return $this->hasMany(EstimateLabor::class, 'labor_type_id', 'labor_type_id');
}

}
