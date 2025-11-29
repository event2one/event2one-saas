import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prenom, nom, email, password } = body;

        // Validate input
        if (!prenom || !nom || !email || !password) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // TODO: Call external API to create user
        // For now, this is a placeholder that needs to be replaced with the actual API endpoint
        const apiResponse = await axios.post(
            'https://www.mlg-consulting.com/smart_territory/form/api.php?action=createUser',
            {
                prenom,
                nom,
                mail: email,
                password: hashedPassword,
                // Add other required fields based on API documentation
            }
        );

        if (apiResponse.data.success) {
            return NextResponse.json(
                { success: true, message: 'Compte créé avec succès' },
                { status: 201 }
            );
        } else {
            return NextResponse.json(
                { error: apiResponse.data.error || 'Erreur lors de la création du compte' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.response?.data?.error) {
            return NextResponse.json(
                { error: error.response.data.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Une erreur est survenue lors de la création du compte' },
            { status: 500 }
        );
    }
}
