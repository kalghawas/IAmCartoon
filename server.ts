import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { providerStore } from './server/providerStore';
import { dailyLimitManager } from './server/dailyLimitManager';
import { fallbackEngine } from './server/fallbackEngine';
import { requireCreatorAuth, isCreatorEmail } from './server/adminAuth';
import { getAdapter } from './server/adapters';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 image payloads for portrait rendering
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasServerKey: !!process.env.GEMINI_API_KEY,
      timestamp: Date.now()
    });
  });

  // Verify / Test API Key endpoint for the EXACT selected AI provider and model
  app.post('/api/verify-key', async (req: Request, res: Response) => {
    const provider = req.body?.provider || (req.headers['x-ai-provider'] as string) || 'google';
    const customKey = (req.headers['x-gemini-key'] as string) || req.body?.apiKey;
    const selectedModel = req.body?.model || (req.headers['x-ai-model'] as string);

    try {
      // 1. Pollinations (No key required)
      if (provider === 'pollinations') {
        const modelToTest = selectedModel || 'flux';
        const testUrl = `https://image.pollinations.ai/prompt/ping?model=${encodeURIComponent(modelToTest)}&width=16&height=16&nologo=true`;
        const pingRes = await fetch(testUrl, { method: 'HEAD' }).catch(() => null);
        return res.json({
          valid: true,
          testedModel: modelToTest,
          message: `✅ Pollinations.AI (${modelToTest}) is online and ready! No API key is required.`
        });
      }

      // Check key presence for other providers
      const keyToUse =
        customKey?.trim() ||
        (provider === 'google' ? process.env.GEMINI_API_KEY?.trim() : undefined);

      if (!keyToUse) {
        return res.status(400).json({
          valid: false,
          error: `Please enter an API key for ${provider.toUpperCase()}.`
        });
      }

      // 2. Google Gemini — Test the specific selected model directly
      if (provider === 'google') {
        const ai = new GoogleGenAI({
          apiKey: keyToUse,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const targetModel = selectedModel || 'gemini-3.1-flash-image';

        try {
          if (targetModel.includes('image')) {
            const response = await ai.models.generateContent({
              model: targetModel,
              contents: 'A small yellow cartoon star icon',
              config: {
                imageConfig: {
                  aspectRatio: '1:1'
                }
              }
            });

            return res.json({
              valid: true,
              testedModel: targetModel,
              message: `✅ Verified! Model "${targetModel}" is active and generating images properly.`
            });
          } else {
            await ai.models.generateContent({
              model: targetModel,
              contents: 'ping'
            });
            return res.json({
              valid: true,
              testedModel: targetModel,
              message: `✅ Verified! Successfully connected to Google AI Studio with "${targetModel}".`
            });
          }
        } catch (genError: any) {
          console.warn(`[Verify Key] Error testing model ${targetModel}:`, genError?.message);
          return res.status(400).json({
            valid: false,
            testedModel: targetModel,
            error: genError?.message || `Failed to authenticate model ${targetModel}`
          });
        }
      }

      // 3. OpenAI (DALL-E 3 / DALL-E 2 / GPT-4o)
      if (provider === 'openai') {
        const targetModel = selectedModel || 'dall-e-3';
        const testRes = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${keyToUse}` }
        });
        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `OpenAI returned status ${testRes.status}`;
          return res.status(401).json({ valid: false, testedModel: targetModel, error: errMsg });
        }
        return res.json({
          valid: true,
          testedModel: targetModel,
          message: `✅ Valid Key! Successfully authenticated with OpenAI for "${targetModel}".`
        });
      }

      // 4. Stability AI
      if (provider === 'stability') {
        const targetModel = selectedModel || 'sd3.5-large';
        const testRes = await fetch('https://api.stability.ai/v1/user/account', {
          headers: { Authorization: `Bearer ${keyToUse}` }
        });
        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          const errMsg = errData.message || errData.name || `Stability AI returned status ${testRes.status}`;
          return res.status(401).json({ valid: false, testedModel: targetModel, error: errMsg });
        }
        return res.json({
          valid: true,
          testedModel: targetModel,
          message: `✅ Valid Key! Stability AI account connected for "${targetModel}".`
        });
      }

      // 5. Hugging Face
      if (provider === 'huggingface') {
        const targetModel = selectedModel || 'black-forest-labs/FLUX.1-schnell';
        const testRes = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { Authorization: `Bearer ${keyToUse}` }
        });
        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          const errMsg = errData.error || `Hugging Face returned status ${testRes.status}`;
          return res.status(401).json({ valid: false, testedModel: targetModel, error: errMsg });
        }
        const data = await testRes.json();
        return res.json({
          valid: true,
          testedModel: targetModel,
          message: `✅ Valid Token! Connected as ${data.name || 'User'} for "${targetModel}".`
        });
      }

      return res.status(400).json({ valid: false, error: `Unknown AI provider: ${provider}` });
    } catch (err: any) {
      console.error(`Key verification error for ${provider}:`, err);
      return res.status(401).json({
        valid: false,
        error: err?.message || 'Invalid API Key or connection failed'
      });
    }
  });

  // =========================================================================
  // FREE TIER & USAGE API
  // =========================================================================

  // Check Daily Free Generation Allowance
  app.get('/api/generations/usage', (req: Request, res: Response) => {
    const userId = dailyLimitManager.resolveUserIdentifier(req, res);
    const usage = dailyLimitManager.getUsage(userId);
    res.json({
      success: true,
      ...usage
    });
  });

  // Free Tier Generation (Enforces 1/Day, Server-Side Provider Fallback Chain)
  app.post('/api/generations/free', async (req: Request, res: Response) => {
    const userId = dailyLimitManager.resolveUserIdentifier(req, res);
    const idempotencyKey =
      (req.headers['x-idempotency-key'] as string) ||
      req.body?.idempotencyKey ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const {
      prompt,
      imageData,
      mimeType = 'image/png',
      aspectRatio = '1:1',
      systemInstruction,
      seed
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Generation prompt is required.' });
    }

    // Step 1: Check daily limit and acquire lock atomically
    const lockResult = dailyLimitManager.acquireLock(userId, idempotencyKey);
    if (!lockResult.allowed) {
      return res.status(429).json({
        error: lockResult.reason || 'Daily free generation limit reached (1 per calendar day).',
        resetAt: lockResult.resetAt,
        remaining: 0,
        usedToday: true
      });
    }

    const cleanBase64 = imageData ? imageData.replace(/^data:[^;]+;base64,/, '') : '';

    try {
      console.log(`[FreeTier] Processing request for user ${userId} using Fallback Chain...`);
      const { result, attempts } = await fallbackEngine.execute({
        tier: 'free',
        prompt,
        cleanBase64,
        mimeType,
        aspectRatio,
        systemInstruction,
        seed,
        userId,
        idempotencyKey
      });

      if (!result.success || !result.imageUrl) {
        console.warn(`[FreeTier] Fallback chain failed for user ${userId}:`, result.errorMessage);
        // Release lock so failed attempt does not consume user's daily allowance!
        dailyLimitManager.releaseLock(userId, result.errorMessage || 'Provider chain failed');
        return res.status(503).json({
          error: result.errorMessage || 'The image service is temporarily busy. Please try again in a few moments.',
          remaining: 1, // Allowance preserved on failure!
          attempts: attempts.map(a => ({ providerId: a.providerId, model: a.model, latencyMs: a.latencyMs }))
        });
      }

      // Step 2: Record successful generation (consumes 1 allowance for today)
      dailyLimitManager.recordSuccess(userId, result.providerId, idempotencyKey);
      console.log(`[FreeTier] Generation SUCCESS for user ${userId} via provider ${result.providerId}`);

      return res.json({
        success: true,
        imageUrl: result.imageUrl,
        model: result.model,
        providerId: result.providerId,
        remaining: 0,
        usedToday: true,
        resetAt: dailyLimitManager.getNextResetTimestamp(),
        isMock: false
      });
    } catch (err: any) {
      console.error(`[FreeTier] Unexpected error for user ${userId}:`, err);
      dailyLimitManager.releaseLock(userId, err?.message || 'Server error');
      return res.status(500).json({
        error: 'The image service is temporarily busy. Please try again in a few moments.',
        remaining: 1
      });
    }
  });

  // Paid Tier Generation (Uses Paid Fallback Chain or optional User API Key)
  app.post('/api/generations/paid', async (req: Request, res: Response) => {
    const userId = dailyLimitManager.resolveUserIdentifier(req, res);
    const idempotencyKey =
      (req.headers['x-idempotency-key'] as string) ||
      req.body?.idempotencyKey ||
      `req_paid_${Date.now()}`;

    const {
      prompt,
      imageData,
      mimeType = 'image/png',
      aspectRatio = '1:1',
      systemInstruction,
      seed,
      customApiKey,
      customProvider,
      customModel
    } = req.body;

    const userProvidedKey =
      (req.headers['x-gemini-key'] as string) ||
      customApiKey ||
      req.body?.apiKey;

    const cleanBase64 = imageData ? imageData.replace(/^data:[^;]+;base64,/, '') : '';

    try {
      const { result, attempts } = await fallbackEngine.execute({
        tier: 'paid',
        prompt,
        cleanBase64,
        mimeType,
        aspectRatio,
        systemInstruction,
        seed,
        userId,
        idempotencyKey,
        customApiKey: userProvidedKey,
        customProvider: (req.headers['x-ai-provider'] as any) || customProvider,
        customModel: (req.headers['x-ai-model'] as string) || customModel
      });

      if (!result.success || !result.imageUrl) {
        return res.status(503).json({
          error: result.errorMessage || 'Paid generation service busy. Please try again.',
          attempts
        });
      }

      return res.json({
        success: true,
        imageUrl: result.imageUrl,
        model: result.model,
        providerId: result.providerId,
        isMock: false
      });
    } catch (err: any) {
      console.error('[PaidTier] Error:', err);
      return res.status(500).json({
        error: err?.message || 'Generation error'
      });
    }
  });

  // Backward-compatible unified /api/generate endpoint
  app.post('/api/generate', async (req: Request, res: Response) => {
    const tier = (req.headers['x-tier'] as string) || req.body?.tier || 'paid';
    const isFreeTier = tier === 'free' || req.body?.isFreeTier;

    if (isFreeTier) {
      // Delegate to Free Tier logic
      const userId = dailyLimitManager.resolveUserIdentifier(req, res);
      const idempotencyKey =
        (req.headers['x-idempotency-key'] as string) ||
        req.body?.idempotencyKey ||
        `req_gen_${Date.now()}`;

      const { prompt, imageData, mimeType = 'image/png', aspectRatio = '1:1', systemInstruction, seed } = req.body;
      const cleanBase64 = imageData ? imageData.replace(/^data:[^;]+;base64,/, '') : '';

      const lock = dailyLimitManager.acquireLock(userId, idempotencyKey);
      if (!lock.allowed) {
        return res.status(429).json({
          error: lock.reason || 'You have used today\'s free generation. Limit: 1 generation per calendar day.',
          resetAt: lock.resetAt,
          remaining: 0,
          usedToday: true
        });
      }

      try {
        const { result } = await fallbackEngine.execute({
          tier: 'free',
          prompt,
          cleanBase64,
          mimeType,
          aspectRatio,
          systemInstruction,
          seed,
          userId,
          idempotencyKey
        });

        if (!result.success || !result.imageUrl) {
          dailyLimitManager.releaseLock(userId, result.errorMessage || 'Fallback chain failed');
          return res.status(503).json({
            error: result.errorMessage || 'The image service is temporarily busy. Please try again.',
            remaining: 1
          });
        }

        dailyLimitManager.recordSuccess(userId, result.providerId, idempotencyKey);
        return res.json({
          imageUrl: result.imageUrl,
          isMock: false,
          model: result.model,
          remaining: 0,
          usedToday: true
        });
      } catch (err: any) {
        dailyLimitManager.releaseLock(userId, err?.message || 'Error');
        return res.status(500).json({
          error: 'The image service is temporarily busy. Please try again.',
          remaining: 1
        });
      }
    }

    // Otherwise Paid / User API Key flow
    const customKey = (req.headers['x-gemini-key'] as string) || req.body?.apiKey;
    const providerType = (req.headers['x-ai-provider'] as any) || req.body?.provider || 'google';
    const model = (req.headers['x-ai-model'] as string) || req.body?.model;
    const { prompt, imageData, mimeType = 'image/png', aspectRatio = '1:1', systemInstruction, seed } = req.body;
    const cleanBase64 = imageData ? imageData.replace(/^data:[^;]+;base64,/, '') : '';

    try {
      const { result } = await fallbackEngine.execute({
        tier: 'paid',
        prompt,
        cleanBase64,
        mimeType,
        aspectRatio,
        systemInstruction,
        seed,
        userId: dailyLimitManager.resolveUserIdentifier(req, res),
        idempotencyKey: `req_paid_${Date.now()}`,
        customApiKey: customKey,
        customProvider: providerType,
        customModel: model
      });

      if (!result.success || !result.imageUrl) {
        return res.status(503).json({
          error: result.errorMessage || 'Image generation failed.'
        });
      }

      return res.json({
        imageUrl: result.imageUrl,
        isMock: false,
        model: result.model
      });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Image generation error' });
    }
  });

  // =========================================================================
  // CREATOR-ONLY PROVIDER MANAGEMENT ENDPOINTS (/api/admin/*)
  // =========================================================================

  // Check creator status
  app.get('/api/admin/auth-check', (req: Request, res: Response) => {
    const userEmail = (
      (req.headers['x-creator-email'] as string) ||
      (req.headers['x-user-email'] as string) ||
      req.query?.email ||
      ''
    ).toString();

    const isCreator = isCreatorEmail(userEmail);
    res.json({
      isCreator,
      creatorEmail: process.env.CREATOR_EMAIL || 'kalghawas@gmail.com'
    });
  });

  // List all configured providers (with masked keys and circuit state)
  app.get('/api/admin/providers', requireCreatorAuth, (req: Request, res: Response) => {
    const list = providerStore.getPublicProviders();
    res.json({ success: true, providers: list });
  });

  // Create a new provider
  app.post('/api/admin/providers', requireCreatorAuth, (req: Request, res: Response) => {
    try {
      const {
        displayName,
        providerType,
        model,
        apiKey,
        baseUrl,
        imageGenerationEndpoint,
        enabled,
        priority,
        tier,
        timeoutMs,
        maxRetries,
        outputResolution,
        promptPrefix,
        negativePrompt
      } = req.body;

      if (!displayName || !providerType || !model) {
        return res.status(400).json({ error: 'Display name, provider type, and model are required.' });
      }

      const saved = providerStore.saveProvider({
        displayName,
        providerType,
        model,
        apiKey,
        baseUrl,
        imageGenerationEndpoint,
        enabled,
        priority,
        tier,
        timeoutMs,
        maxRetries,
        outputResolution,
        promptPrefix,
        negativePrompt
      });

      res.status(201).json({ success: true, provider: saved });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save provider' });
    }
  });

  // Update existing provider (e.g. toggle enabled, change priority, rotate key)
  app.patch('/api/admin/providers/:id', requireCreatorAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = providerStore.getProviderById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    try {
      const updated = providerStore.saveProvider({
        id,
        ...req.body
      });
      res.json({ success: true, provider: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update provider' });
    }
  });

  // Delete provider
  app.delete('/api/admin/providers/:id', requireCreatorAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = providerStore.deleteProvider(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Provider not found or could not be deleted.' });
    }
    res.json({ success: true, message: 'Provider deleted successfully.' });
  });

  // Reset circuit breaker for a provider
  app.post('/api/admin/providers/:id/reset-circuit', requireCreatorAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const provider = providerStore.getProviderById(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found.' });
    }
    providerStore.resetCircuit(id);
    res.json({ success: true, message: `Circuit breaker reset for ${provider.displayName}. State is now CLOSED.` });
  });

  // Test single provider connection and health
  app.post('/api/admin/providers/:id/test', requireCreatorAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const provider = providerStore.getProviderById(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    try {
      const adapter = getAdapter(provider.providerType);
      const decryptedKey = providerStore.getDecryptedApiKey(provider);
      const health = await adapter.healthCheck(provider, decryptedKey);
      providerStore.updateHealth(id, health.healthy, health.latencyMs);

      res.json({
        success: health.healthy,
        message: health.message,
        latencyMs: health.latencyMs
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Health check failed to execute'
      });
    }
  });

  // Test full fallback chain for a tier
  app.post('/api/admin/test-chain', requireCreatorAuth, async (req: Request, res: Response) => {
    const tier = (req.body?.tier || 'free') as 'free' | 'paid';
    const testPrompt = req.body?.prompt || 'Waist-up character portrait of a cheerful animated character in Pixar style';

    console.log(`[Admin] Testing full fallback chain for tier "${tier}"...`);
    const { result, attempts } = await fallbackEngine.execute({
      tier,
      prompt: testPrompt,
      userId: 'admin_test_probe',
      idempotencyKey: `test_chain_${Date.now()}`
    });

    res.json({
      success: result.success,
      winnerProviderId: result.providerId,
      modelUsed: result.model,
      sampleImageUrl: result.imageUrl,
      attempts
    });
  });

  // Overview of all providers health and latency
  app.get('/api/admin/provider-health', requireCreatorAuth, (req: Request, res: Response) => {
    const providers = providerStore.getPublicProviders();
    const stats = {
      total: providers.length,
      enabled: providers.filter(p => p.enabled).length,
      circuitsClosed: providers.filter(p => p.circuitState === 'closed').length,
      circuitsOpen: providers.filter(p => p.circuitState === 'open').length,
      circuitsHalfOpen: providers.filter(p => p.circuitState === 'half-open').length,
      freeTierChain: providers.filter(p => p.enabled && (p.tier === 'free' || p.tier === 'both')).map(p => p.displayName),
      paidTierChain: providers.filter(p => p.enabled && (p.tier === 'paid' || p.tier === 'both')).map(p => p.displayName)
    };
    res.json({ success: true, stats, providers });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 I am Cartoon server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
