import { Router, Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import axios from 'axios';

const router = Router();

// This route proxies the request to the SearchAPI service
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({ success: false, message: 'No image URL provided.' });
      return;
    }

    const apiKey = process.env.SEARCH_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: SEARCH_API_KEY is not set on the server.');
      res.status(500).json({ success: false, message: 'Server configuration error: SearchAPI key not found.' });
      return;
    }

    const params = {
      engine: 'google_lens',
      url: imageUrl,
      hl: 'en',
      gl: 'us',
      api_key: apiKey,
      search_type: 'all',
    };

    try {
      console.log(`Sending request to SearchAPI with URL: ${imageUrl}`);
      const response = await axios.get('https://www.searchapi.io/api/v1/search', { params });
      console.log('Successfully received data from SearchAPI.');
      res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.error('Error from SearchAPI:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with SearchAPI.';
      res.status(500).json({ success: false, message: errorMessage });
    }
  })
);

export default router;