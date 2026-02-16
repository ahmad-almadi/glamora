import { GoogleGenAI } from "@google/genai"; // المكتبة الجديدة
import { prisma } from "../prisma.js";

// إعداد العميل (Client)
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generateReply = async (message: string, history: any[] = []) => {
   try {
    const products = await prisma.product.findMany({
      select: {
        name: true,
        price: true,
        description: true,
        quantity: true,
        category: true, // هاد يرجع كل الحقول داخل الكاتيجوري
        variants: {
          select: {
            color: true,
          }
        }
      }
    });

   const productCatalog = products
      .map((p: any) => {
        const colors = p.variants.map((v: any) => v.color).join(", ");
        const categoryInfo = Object.entries(p.category)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        return `- ${p.name} ($${p.price}): ${p.description}. Category: {${categoryInfo}}. Stock: ${p.quantity}. Colors: ${colors}`;
      })
      .join("\n");


    // نستخدم الموديل 2.5 فلاش المعتمد حالياً
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are the Glamora Assistant. Use this catalog:\n${productCatalog}`,
      },
    });

    return response.text; // استخراج النص أصبح أسهل (بدون .response.text())
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
