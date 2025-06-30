#!/usr/bin/env pwsh
# PowerShell script to test the OpenLens API deployment

param(
    [string]$ServiceUrl = "https://snap2sell-openlens-156064765830.us-central1.run.app",
    [string]$TestImageUrl = ""
)

Write-Host "🧪 Testing OpenLens API deployment..." -ForegroundColor Green

# Test 1: Health check
Write-Host "`n1️⃣ Testing health endpoint..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$ServiceUrl/" -Method GET -TimeoutSec 10
    Write-Host "✅ Health check passed: $($response.message)" -ForegroundColor Green
} catch {
    Write-Error "❌ Health check failed: $_"
    exit 1
}

# Test 2: Test the new analyze-url endpoint (if image URL provided)
if ($TestImageUrl) {
    Write-Host "`n2️⃣ Testing /analyze-url endpoint..." -ForegroundColor Blue
    try {
        $body = @{ imageUrl = $TestImageUrl } | ConvertTo-Json
        $headers = @{ "Content-Type" = "application/json" }
        
        Write-Host "📤 Sending request to /analyze-url..." -ForegroundColor Yellow
        $start = Get-Date
        
        $response = Invoke-RestMethod -Uri "$ServiceUrl/analyze-url" `
            -Method POST `
            -Body $body `
            -Headers $headers `
            -TimeoutSec 120
        
        $duration = (Get-Date) - $start
        
        Write-Host "✅ Analysis completed in $($duration.TotalSeconds) seconds" -ForegroundColor Green
        Write-Host "📊 Results:" -ForegroundColor Cyan
        Write-Host "   Request ID: $($response.request_id)" -ForegroundColor White
        Write-Host "   Google Lens links found: $($response.google_lens_links_found)" -ForegroundColor White
        Write-Host "   Scraped content length: $($response.scraped_content_length)" -ForegroundColor White
        Write-Host "   Analysis preview: $($response.analysis.Substring(0, [Math]::Min(100, $response.analysis.Length)))..." -ForegroundColor White
        
    } catch {
        Write-Error "❌ analyze-url test failed: $_"
        Write-Host "Response details: $($_.Exception.Response | ConvertTo-Json -Depth 3)" -ForegroundColor Red
    }
} else {
    Write-Host "`n2️⃣ Skipping /analyze-url test (no test image URL provided)" -ForegroundColor Yellow
    Write-Host "   To test with an image URL, use: ./test-deployment.ps1 -TestImageUrl 'https://your-supabase-url'" -ForegroundColor Gray
}

Write-Host "`n🎯 Testing complete!" -ForegroundColor Green
Write-Host "📋 Troubleshooting tips:" -ForegroundColor Cyan
Write-Host "   • Check Cloud Run logs: gcloud logging read 'resource.type=cloud_run_revision resource.labels.service_name=snap2sell-openlens' --limit 50" -ForegroundColor White
Write-Host "   • Verify Supabase storage URLs are publicly accessible" -ForegroundColor White
Write-Host "   • Ensure OpenAI API key is properly set in Cloud Run secrets" -ForegroundColor White
