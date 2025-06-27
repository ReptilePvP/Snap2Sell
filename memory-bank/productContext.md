# Product Context: Snap2Cash

## Problem Statement

Users often encounter items, documents, or scenarios in the physical world that they need to quickly digitize, analyze, or get more information about. Manually researching or processing information from images can be time-consuming and inefficient. There's a need for a streamlined process to capture an image and receive actionable insights or data with minimal effort.

## Target Users

*   **General Consumers:** Individuals looking to quickly identify products, get price comparisons, or extract text from images (e.g., receipts, business cards).
*   **Professionals/Businesses (Potentially):** Users who might need to digitize and process documents, inventory items, or other visual assets for their workflow.
*   **Resellers/Collectors (Inferred from "snap2cash" name):** Individuals who might be using the app to quickly assess the value or identify items they intend to buy or sell.

## Desired User Experience

*   **Effortless Upload:** Users should be able to easily upload images from their devices or capture them live via a camera interface.
*   **Fast Processing:** The time from image submission to receiving results should be as short as possible.
*   **Clear Results:** Analysis results should be presented in a clear, understandable, and actionable format.
*   **Seamless Integration:** The image upload and analysis process should feel like a cohesive part of the application.
*   **Reliability:** The system should reliably handle image uploads and provide consistent GCS URLs for further processing.

## How It Should Work (Focus on Image Upload)

1.  **Initiation:** The user navigates to a section of the application (e.g., `ImageUpload.tsx` component) to upload an image.
2.  **Selection/Capture:** The user selects an image file from their device or uses a live scanning feature (`LiveScanner.tsx`).
3.  **Submission:** The selected image is sent to the backend `/api/upload-image` endpoint.
4.  **Backend Handling:**
    *   The backend receives the image.
    *   It generates a unique filename.
    *   It uploads the image to Google Cloud Storage (GCS).
5.  **Response:** The backend returns a JSON response containing the public URL of the image in GCS.
6.  **Frontend Update:** The frontend receives the URL and can then display the image, store the URL for later use, or pass it to an analysis service.

## Value Proposition

Snap2Cash aims to simplify the process of turning visual information into digital data and insights, saving users time and effort. The GCS integration ensures reliable and scalable storage for these images.
