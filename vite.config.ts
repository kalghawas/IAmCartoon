import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            const body = JSON.parse(bodyStr || '{}');
            const {
              prompt,
              systemInstruction,
              imageData,
              mimeType = 'image/png',
              model = 'gemini-3.1-flash-image',
              aspectRatio = '1:1',
              seed
            } = body;

            const clientApiKey = req.headers['x-gemini-key'] as string;
            const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set. Enable Mock Mode or configure your key.' }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build'
                }
              }
            });

            const parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> = [];

            if (imageData) {
              parts.push({
                inlineData: {
                  data: imageData,
                  mimeType: mimeType
                }
              });
            }

            parts.push({
              text: prompt || 'Convert this portrait into a stylized cartoon character.'
            });

            const config: Record<string, unknown> = {
              imageConfig: {
                aspectRatio: aspectRatio || '1:1'
              }
            };

            if (systemInstruction) {
              config.systemInstruction = systemInstruction;
            }

            if (typeof seed === 'number') {
              config.seed = seed;
            }

            const response = await ai.models.generateContent({
              model,
              contents: {
                parts
              },
              config
            });

            let generatedImageUrl: string | null = null;
            let responseText = '';

            const candidateParts = response.candidates?.[0]?.content?.parts || [];
            for (const part of candidateParts) {
              if (part.inlineData && part.inlineData.data) {
                generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              } else if (part.text) {
                responseText += part.text;
              }
            }

            if (!generatedImageUrl) {
              res.statusCode = 422;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: 'Model did not return image data.',
                textResponse: responseText
              }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              imageUrl: generatedImageUrl,
              isMock: false
            }));
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown generation error';
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: errorMsg }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
