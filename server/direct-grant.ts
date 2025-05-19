import { Request, Response, Router } from 'express';

// Create a router for direct grant ID setting
const router = Router();

// Set Grant ID directly in session without validation
router.post('/set-direct-grant', (req: Request, res: Response) => {
  try {
    const grantId = '5bd4e911-f684-4141-bc83-247e2077c9a5'; // Hardcoded ID for testing
    
    if (req.session) {
      req.session.nylasGrantId = grantId;
      console.log('Set Nylas grant ID directly:', grantId);
      
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