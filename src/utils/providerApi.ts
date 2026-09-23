import { DailyUsageState, PublicProvider } from '../types';

export async function fetchDailyUsage(userId?: string): Promise<DailyUsageState> {
  try {
    const res = await fetch('/api/generations/usage', {
      headers: {
        ...(userId ? { 'x-user-id': userId } : {})
      }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        remaining: data.remaining ?? 1,
        usedToday: data.usedToday ?? false,
        resetAt: data.resetAt ?? Date.now() + 86400000,
        dateBucket: data.dateBucket || new Date().toISOString().split('T')[0],
        isLocked: data.isLocked,
        lastSuccessAt: data.lastSuccessAt,
        providerUsed: data.providerUsed
      };
    }
  } catch (e) {
    console.warn('Failed to fetch daily usage:', e);
  }

  // Graceful fallback
  return {
    remaining: 1,
    usedToday: false,
    resetAt: Date.now() + 86400000,
    dateBucket: new Date().toISOString().split('T')[0]
  };
}

export async function checkIsCreator(userEmail?: string): Promise<{ isCreator: boolean; creatorEmail: string }> {
  try {
    const res = await fetch(`/api/admin/auth-check?email=${encodeURIComponent(userEmail || '')}`, {
      headers: {
        ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to check creator status:', e);
  }
  return { isCreator: false, creatorEmail: 'kalghawas@gmail.com' };
}

export async function fetchAdminProviders(userEmail?: string): Promise<PublicProvider[]> {
  const res = await fetch('/api/admin/providers', {
    headers: {
      'Content-Type': 'application/json',
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.providers || [];
}

export async function saveAdminProvider(
  provider: Partial<PublicProvider> & { apiKey?: string },
  userEmail?: string
): Promise<PublicProvider> {
  const isEdit = !!provider.id;
  const url = isEdit ? `/api/admin/providers/${provider.id}` : '/api/admin/providers';
  const method = isEdit ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    },
    body: JSON.stringify(provider)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to save provider (${res.status})`);
  }
  const data = await res.json();
  return data.provider;
}

export async function deleteAdminProvider(id: string, userEmail?: string): Promise<void> {
  const res = await fetch(`/api/admin/providers/${id}`, {
    method: 'DELETE',
    headers: {
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete provider');
  }
}

export async function resetProviderCircuit(id: string, userEmail?: string): Promise<string> {
  const res = await fetch(`/api/admin/providers/${id}/reset-circuit`, {
    method: 'POST',
    headers: {
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reset circuit');
  }
  const data = await res.json();
  return data.message;
}

export async function testAdminProvider(
  id: string,
  userEmail?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const res = await fetch(`/api/admin/providers/${id}/test`, {
    method: 'POST',
    headers: {
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Provider test failed');
  }
  return data;
}

export async function testFallbackChain(
  tier: 'free' | 'paid',
  userEmail?: string
): Promise<any> {
  const res = await fetch('/api/admin/test-chain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    },
    body: JSON.stringify({ tier })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Chain test failed');
  }
  return data;
}

export async function fetchProviderHealthOverview(userEmail?: string): Promise<any> {
  const res = await fetch('/api/admin/provider-health', {
    headers: {
      ...(userEmail ? { 'x-creator-email': userEmail, 'x-user-email': userEmail } : {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch provider health');
  }
  return await res.json();
}
