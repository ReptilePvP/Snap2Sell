# Active Context: Snap2Cash - Backend Image Upload Service

## Current Task & Focus

The primary objective is to design, build, and integrate a new Node.js + Express backend service responsible for handling image uploads from the existing React frontend to Google Cloud Storage (GCS).

## Key Deliverables for Current Task

1.  **Backend Directory Structure:**
    *   `server/`
        *   `index.ts` (Entry point, Express app setup)
        *   `routes/uploadImage.ts` (Handler for `POST /api/upload-image`)
        *   `utils/gcsUploader.ts` (GCS interaction logic)
        *   `middleware/multer.ts` (Multer configuration for file parsing)
        *   `.env` (For `GCS_BUCKET_NAME`, GCS credentials path if needed locally)
        *   `package.json` (For backend dependencies)
        *   `tsconfig.json` (For backend TypeScript compilation)

2.  **API Endpoint:**
    *   `POST /api/upload-image`
        *   Accepts `multipart/form-data` with an image file.
        *   Returns JSON: `{ success: true, imageUrl: "https://storage.googleapis.com/your-bucket/unique-file-name.ext" }` or an error object.

3.  **Core Functionality:**
    *   Receive image file.
    *   Generate a unique filename (e.g., UUID + extension).
    *   Upload file to GCS bucket (`snap2cash-uploads` or configured via env var).
    *   Ensure proper GCS authentication using `service-account.json`.
    *   Enable CORS for frontend-backend communication.

4.  **Frontend Integration:**
    *   Guidance on how `components/ImageUpload.tsx` should be modified to send a `FormData` POST request to the new backend endpoint.

5.  **Deployment Considerations (Initial Thoughts):**
    *   Dockerfile for containerization.
    *   `npm start` script for running the production server.
    *   Environment variable management for GCS credentials and bucket name in Google Cloud Run.

## Recent Decisions & Assumptions

*   **Technology Stack:** Node.js, Express, TypeScript for the backend.
*   **GCS Client:** `@google-cloud/storage` npm package.
*   **File Upload Handling:** `multer` npm package.
*   **Unique IDs:** `uuid` npm package.
*   **Environment Variables:** `dotenv` npm package for local development.
*   **Service Account:** A `service-account.json` file will be available in the project root for local GCS authentication. This file **must not** be committed.
*   **Bucket Name:** `snap2cash-uploads` is the default, but configurable.

## Next Immediate Steps (Planning Phase)

1.  Finalize the creation of all Memory Bank core files.
2.  Detail the step-by-step implementation plan for the backend service.
3.  Outline the structure of each backend file.
4.  Define the `package.json` for the server.
5.  Draft the `Dockerfile` and deployment notes.
6.  Specify the changes needed in `ImageUpload.tsx`.
7.  Present this comprehensive plan to the user for approval before switching to Act Mode.

## Important Patterns & Preferences to Maintain

*   **Modularity:** Keep concerns separated (e.g., GCS logic in `gcsUploader.ts`, route logic in `uploadImage.ts`).
*   **Clarity:** Code should be well-commented, especially around GCS integration and error handling.
*   **Security:** Emphasize secure handling of credentials.
*   **Configuration:** Use environment variables for settings that change between environments.
*   **TypeScript:** Leverage strong typing for robustness.

## Learnings & Project Insights (Initial)

*   The project already has a significant frontend footprint, indicating a need for careful backend integration.
*   The naming "snap2cash" and existing analysis components suggest the image upload is a foundational step for more complex image-based operations.
