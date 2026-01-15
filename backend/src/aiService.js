import axios from 'axios'
import fs from 'fs'

/**
 * Analyzes a food image and estimates nutritional information
 * This uses AI to identify the food and estimate calories
 *
 * NOTE: In production, you would integrate with a service like:
 * - OpenAI Vision API (GPT-4 Vision)
 * - Google Cloud Vision API
 * - Clarifai Food Recognition
 * - Nutritionix API
 *
 * For this demo, we provide a template that can be connected to these services
 */

export async function analyzeFoodImage(imagePath) {
  try {
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.log('OpenAI API key not configured. Using mock data.')
      return getMockNutritionData()
    }

    // Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')

    // Call OpenAI Vision API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide nutritional estimates in JSON format with the following fields:
                - foodName: string (name of the food)
                - calories: number (estimated calories)
                - protein: number (grams)
                - carbs: number (grams)
                - fats: number (grams)
                - servingSize: string (e.g., "1 plate", "200g")

                Only respond with the JSON object, no additional text.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    )

    const content = response.data.choices[0].message.content
    const nutritionData = JSON.parse(content)

    return nutritionData
  } catch (error) {
    console.error('Error analyzing image:', error.message)
    // Return mock data as fallback
    return getMockNutritionData()
  }
}

function getMockNutritionData() {
  // Mock data for demonstration purposes
  const mockFoods = [
    {
      foodName: 'Grilled Chicken Salad',
      calories: 350,
      protein: 35,
      carbs: 20,
      fats: 12,
      servingSize: '1 plate',
    },
    {
      foodName: 'Pasta with Tomato Sauce',
      calories: 450,
      protein: 15,
      carbs: 70,
      fats: 10,
      servingSize: '1 plate',
    },
    {
      foodName: 'Salmon with Vegetables',
      calories: 420,
      protein: 40,
      carbs: 15,
      fats: 22,
      servingSize: '1 fillet',
    },
    {
      foodName: 'Fruit Bowl',
      calories: 150,
      protein: 2,
      carbs: 38,
      fats: 1,
      servingSize: '1 bowl',
    },
  ]

  return mockFoods[Math.floor(Math.random() * mockFoods.length)]
}

/**
 * Alternative: Using Nutritionix API for more accurate results
 * Requires NUTRITIONIX_APP_ID and NUTRITIONIX_APP_KEY environment variables
 */
export async function searchFoodByName(foodName) {
  try {
    const appId = process.env.NUTRITIONIX_APP_ID
    const appKey = process.env.NUTRITIONIX_APP_KEY

    if (!appId || !appKey) {
      return null
    }

    const response = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      {
        query: foodName,
      },
      {
        headers: {
          'x-app-id': appId,
          'x-app-key': appKey,
          'Content-Type': 'application/json',
        },
      }
    )

    const food = response.data.foods[0]
    return {
      foodName: food.food_name,
      calories: Math.round(food.nf_calories),
      protein: Math.round(food.nf_protein),
      carbs: Math.round(food.nf_total_carbohydrate),
      fats: Math.round(food.nf_total_fat),
      servingSize: `${food.serving_qty} ${food.serving_unit}`,
    }
  } catch (error) {
    console.error('Error searching food:', error.message)
    return null
  }
}

export default { analyzeFoodImage, searchFoodByName }
