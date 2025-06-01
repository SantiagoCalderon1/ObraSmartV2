<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;

class UsersController
{
    //============================ Métodos específicos para el Administrador ==============================================

    /**
     * Display a listing of the users (only for admins).
     */
    public function index()
    {
        // Verifica si el usuario es un administrador
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'No tiene permisos para ver todos los usuarios.'], 403);
        }

        $users = User::all();

        if ($users->isEmpty()) {
            return response()->json([
                'message' => 'No users found',
            ], 404);
        }

        return response()->json([
            'message' => 'Lista de usuarios',
            'data' => $users
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage (only for admins).
     */
    public function store(Request $request)
    {
        // Verifica si el usuario es un administrador
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'No tiene permisos para crear usuarios.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'in:admin,worker,disabled',
        ]);

        $validated['password'] = bcrypt($request->get('password'));

        $user = User::create($validated);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified resource (only for admins).
     */
    public function show(User $user)
    {
        // Verifica si el usuario es un administrador o si está viendo sus propios datos
        if (Auth::user()->role !== 'admin' && Auth::id() !== $user->id) {
            return response()->json(['message' => 'No tiene permisos para ver este usuario.'], 403);
        }

        return response()->json([
            'message' => 'Usuario obtenido correctamente',
            'data' => $user,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Update the specified resource in storage (only for admins or the authenticated user).
     */
    public function update(Request $request, User $user)
    {
        try {

            // Verifica si el usuario es un administrador o si está actualizando sus propios datos
            if (Auth::user()->role !== 'admin' && Auth::id() !== $user->id) {
                return response()->json(['message' => 'No tiene permisos para actualizar este usuario.'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'lastname' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
                'phone' => 'nullable|string|max:20',
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Usuario actualizado correctamente',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error interno', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage (only for admins).
     */
    public function destroy(User $user)
    {
        // Verifica si el usuario es un administrador
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'No tiene permisos para eliminar usuarios.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado con éxito.']);
    }

    // ================================== Métodos comunes para todos los usuarios ====================================

    /**
     * Reset the password of a user  
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        // Verifica si el usuario existe (aunque en este caso debería estar autenticado, pero es bueno verificarlo)
        if (!$user) {
            return response()->json(['message' => 'Usuario no autenticado.'], 401);
        }

        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed', // Nueva contraseña y confirmación de la nueva contraseña
        ]);

        // Verifica si la contraseña antigua es correcta
        if (!Hash::check($request->get('old_password'), $user->password)) {
            return response()->json([
                'message' => 'La contraseña antigua es incorrecta.',
            ], 403);
        }

        $user->password = bcrypt($request->get('new_password')); // Ciframos la nueva contraseña

        $user = User::where('user_id', $user->user_id)->first();
        $user->password = bcrypt($request->get('new_password'));
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ], 200);
    }
}
