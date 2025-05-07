<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstimateLabor extends Model
{
    /** @use HasFactory<\Database\Factories\EstimateLaborFactory> */
    use HasFactory;

    protected $primaryKey = 'estimate_labor_id';


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'estimate_id',
        'labor_type_id',
        'hours',
        'cost_per_hour',
        'discount',
        'total_cost',
    ];

    public function estimate()
    {
        return $this->belongsTo(Estimate::class, 'estimate_id', 'estimate_id');
    }

    public function laborType()
    {
        return $this->belongsTo(LaborType::class, 'labor_type_id', 'labor_type_id');
    }
}
