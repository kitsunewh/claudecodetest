const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

class FoodAnalyzer {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async analyzeFoodImage(imagePath) {
    try {
      // Read image file and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Determine media type
      const ext = imagePath.split('.').pop().toLowerCase();
      const mediaTypeMap = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      const mediaType = mediaTypeMap[ext] || 'image/jpeg';

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `Analyze this food image and provide nutritional information. Return a JSON object with the following structure:
{
  "foodItems": ["item1", "item2"],
  "mealName": "descriptive name",
  "estimatedCalories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fats": number (grams),
  "servingSize": "description",
  "confidence": "high/medium/low",
  "notes": "any additional observations"
}

Be as accurate as possible with calorie and macro estimates based on visible portion sizes.`
              }
            ]
          }
        ]
      });

      // Parse the response
      const responseText = message.content[0].text;

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const analysis = JSON.parse(jsonText);

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      console.error('Error analyzing food image:', error);
      return {
        success: false,
        error: error.message,
        data: {
          foodItems: ['Unknown food'],
          mealName: 'Unknown meal',
          estimatedCalories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          servingSize: 'Unknown',
          confidence: 'low',
          notes: 'Could not analyze image'
        }
      };
    }
  }
}

module.exports = new FoodAnalyzer();
