<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstimateMaterial extends Model
{
    /** @use HasFactory<\Database\Factories\EstimateMaterialsFactory> */
    use HasFactory;

    protected $primaryKey = 'estimate_material_id';


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'estimate_id',
        'material_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    public function estimate()
    {
        return $this->belongsTo(Estimate::class, 'estimate_id', 'estimate_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id', 'material_id');
    }
}
