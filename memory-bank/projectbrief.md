# Project Brief: Snapalyze

## Core Goal

Snapalyze is a web application designed to allow users to upload images, which are then processed and analyzed. The primary interaction involves users submitting images, potentially for financial-related analysis, value extraction, or item identification, and receiving structured data or insights in return.

## Key Features (Inferred and Planned)

*   **Image Upload:** Users can upload images through a web interface.
*   **Backend Processing:** A dedicated backend service handles image storage and an initial processing pipeline.
*   **Cloud Storage:** Images are securely stored in Google Cloud Storage (GCS).
*   **Analysis Services:** The application integrates with various analysis services (e.g., Gemini, Search APIs, SerpAPI, as suggested by existing frontend components like `AnalyzeGemini.tsx`, `AnalyzeSearchAPI.tsx`, `AnalyzeSerpAPI.tsx`).
*   **User Accounts:** Features like `AccountSettings.tsx`, `CreateAccount.tsx`, `SignIn.tsx` suggest user authentication and management.
*   **Dashboard & History:** `Dashboard.tsx` and `History.tsx` imply users can view their activity and results.

## Project Scope (Current Focus)

The immediate focus is on building the backend infrastructure for image uploads to Google Cloud Storage. This includes:

*   A Node.js + Express server.
*   An API endpoint (`/api/upload-image`) to receive images.
*   Integration with GCS for storing uploaded images.
*   Returning the public URL of the uploaded image to the frontend.
*   Ensuring the frontend (`ImageUpload.tsx`) can communicate with this new backend endpoint.

## Future Considerations

*   Deployment to Google Cloud Run.
*   Further development of image analysis features.
*   Robust error handling and security measures.
