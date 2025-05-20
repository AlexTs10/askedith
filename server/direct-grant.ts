import { Request, Response, Router } from 'express';

// Create a router for direct grant ID setting
const router = Router();

// Set Grant ID directly in session without validation
router.post('/set-direct-grant', (req: Request, res: Response) => {
  try {
    // This is the hardcoded Grant ID for testing
    // Important: We're intentionally bypassing the Nylas API verification for testing
    const grantId = '5bd4e911-f684-4141-bc83-247e2077c9a5';
    
    if (req.session) {
      // Store the grant ID in session
      req.session.nylasGrantId = grantId;
      console.log('Set Nylas grant ID directly (bypass verification):', grantId);
      
      // For testing: Also create a simple flag to indicate we're using mock grant
      req.session.usingMockGrant = true;
      
      return res.json({
        success: true,
        message: 'Grant ID set in session',
        grantId
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Session not available'
    });
  } catch (error) {
    console.error('Error setting direct grant ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to set grant ID'
    });
  }
});

// Get the current Grant ID from session
router.get('/current-grant', (req: Request, res: Response) => {
  if (req.session?.nylasGrantId) {
    return res.json({
      success: true,
      grantId: req.session.nylasGrantId
    });
  }
  
  return res.json({
    success: false,
    message: 'No grant ID set in session'
  });
});

export default router;