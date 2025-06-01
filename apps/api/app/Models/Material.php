<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    /** @use HasFactory<\Database\Factories\MaterialsFactory> */
    use HasFactory;

    protected $primaryKey = 'material_id';


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'unit',
        'price_per_unit',
        'stock_quantity',
        'min_stock_alert',
    ];


    public function estimateMaterials()
{
    return $this->hasMany(EstimateMaterial::class, 'material_id', 'material_id');
}

public function stockMovements()
{
    return $this->hasMany(StockMovement::class, 'material_id', 'material_id');
}

}
