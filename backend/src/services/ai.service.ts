import { HttpException } from "../utils/http-exception";
import { GoogleGenAI } from "@google/genai";

class AiService{

    static async respond(payload: any){
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const { prompt } = payload;
        
        if(!prompt) throw new HttpException(400, 'Make a prompt!');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        
        return { response: response.text };

    }
}

export default AiService;