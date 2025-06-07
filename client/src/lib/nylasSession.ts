export async function ensureNylasSession() {
    let stored = localStorage.getItem('nylas_grant_id');
    if (!stored) {
      const result = await fetch('/api/nylas/grant-id').then(r => r.json());
      if (result.grantId) {
        stored = result.grantId;
        localStorage.setItem('nylas_grant_id', stored);
      } else {
        return;
      }
    }
  
    // already in session? …then we’re done
    const status = await fetch('/api/nylas/connection-status').then(r => r.json());
    if (status.connected) return;
  
    // restore session on the server
    await fetch('/api/nylas/set-grant-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grantId: stored }),
    });
  }
  