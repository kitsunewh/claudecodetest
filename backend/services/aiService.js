import OpenAI from 'openai';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyzes a food image and estimates nutritional information
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} Nutritional analysis including calories, protein, carbs, fats
 */
export async function analyzeFoodImage(imagePath) {
  try {
    // Read image file and convert to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

    console.log('Sending image to OpenAI for analysis...');

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a nutrition expert. Analyze this food image and provide a detailed nutritional breakdown.

Please respond with a JSON object in this exact format:
{
  "foodItems": ["item1", "item2"],
  "totalCalories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fats": number (in grams),
  "fiber": number (in grams),
  "sugar": number (in grams),
  "servingSize": "description",
  "confidence": "high/medium/low",
  "notes": "any additional observations"
}

Be as accurate as possible with the estimates. If you're unsure, indicate lower confidence.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI response:', content);

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a fallback response
      analysis = {
        foodItems: ['Unknown food item'],
        totalCalories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        servingSize: 'Unknown',
        confidence: 'low',
        notes: 'Could not accurately analyze the image. Please try again or enter manually.'
      };
    }

    return analysis;

  } catch (error) {
    console.error('AI analysis error:', error);

    // If API key is missing, return helpful error
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file');
    }

    throw error;
  }
}

/**
 * Gets the MIME type based on file extension
 * @param {string} filePath - Path to the file
 * @returns {string} MIME type
 */
function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Generates a mock analysis for testing without API key
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} Mock nutritional analysis
 */
export async function mockAnalyzeFoodImage(imagePath) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    foodItems: ['Grilled chicken breast', 'Brown rice', 'Steamed broccoli'],
    totalCalories: 450,
    protein: 38,
    carbs: 52,
    fats: 8,
    fiber: 6,
    sugar: 3,
    servingSize: 'One plate (approximately 350g)',
    confidence: 'medium',
    notes: 'This is a mock analysis for testing purposes. Configure OpenAI API key for real analysis.'
  };
}
