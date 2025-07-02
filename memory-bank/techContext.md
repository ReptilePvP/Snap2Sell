# Technical Context: Snapalyze

## Core Technologies

### Frontend
*   **Framework/Library:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Key Components (Related to current task):**
    *   `components/ImageUpload.tsx`
    *   `components/LiveScanner.tsx`
    *   `pages/AnalysisPageBase.tsx`

### Backend (New Service - To Be Built)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Key Dependencies (Planned):**
    *   `express`: Web framework
    *   `cors`: For enabling Cross-Origin Resource Sharing
    *   `dotenv`: For managing environment variables
    *   `@google-cloud/storage`: Google Cloud Storage client library
    *   `multer`: Middleware for handling `multipart/form-data` (file uploads)
    *   `uuid`: For generating unique filenames
    *   `typescript`: For TypeScript support
    *   `@types/express`, `@types/cors`, `@types/multer`, `@types/uuid`, `@types/node`: Type definitions
    *   `ts-node-dev` or `nodemon` (with `ts-node`): For development server with auto-reloading

## Cloud Services
*   **Storage:** Google Cloud Storage (GCS)
    *   **Bucket Name:** `snapalyze-uploads` (configurable via `GCS_BUCKET_NAME` environment variable)
    *   **Authentication:** `service-account.json` key file (expected in project root for local development, managed via environment variables/secrets in deployment).
*   **Deployment (Planned):** Google Cloud Run

## Development Environment
*   **Package Manager:** npm (inferred from `package-lock.json` and `package.json` in the root)
*   **IDE/Editor:** VSCode (inferred from environment details)

## Technical Constraints & Considerations
*   **CORS:** Must be enabled on the backend to allow requests from the frontend (running on a different port during development or a different domain in production).
*   **Unique Filenames:** Essential to prevent collisions in GCS. UUIDs are a good approach.
*   **Error Handling:** The backend API should return clear error messages in a consistent format (e.g., JSON).
*   **Security:**
    *   The `service-account.json` file should NOT be committed to version control. It should be listed in `.gitignore`.
    *   Environment variables should be used for sensitive information like bucket names and GCS credentials in production.
*   **Scalability:** Designing for Google Cloud Run implies the service should be stateless and scalable.

## Tool Usage Patterns
*   **File Uploads:** Frontend will use `FormData` to send images. Backend will use `multer` to parse these.
*   **API Communication:** RESTful API principles for the `/api/upload-image` endpoint (POST request).
