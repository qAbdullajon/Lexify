// app/api/vocabulary/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request) {
    try {
        const { vocabulary } = await request.json()

        if (!vocabulary || !Array.isArray(vocabulary)) {
            return NextResponse.json(
                { error: 'Vocabulary array is required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db('vocabulary_app')
        const collection = db.collection('vocabulary')

        // Yangi vocabulary qo'shamiz
        const result = await collection.insertMany(vocabulary)

        return NextResponse.json({
            success: true,
            insertedCount: result.insertedCount,
            message: 'Vocabulary saved successfully'
        })

    } catch (error) {
        console.error('Error saving vocabulary:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db('vocabulary_app')
        const collection = db.collection('vocabulary')

        const vocabulary = await collection.find({}).toArray()

        return NextResponse.json(vocabulary)

    } catch (error) {
        console.error('Error fetching vocabulary:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}