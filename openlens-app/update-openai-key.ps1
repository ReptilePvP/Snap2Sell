# PowerShell script to securely update OpenAI API key
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId = "gen-lang-client-0815551598"
)

Write-Host "🔐 Secure OpenAI API Key Update for Cloud Run" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: This script will update the OpenAI API key in Google Secret Manager" -ForegroundColor Yellow
Write-Host "Make sure you have a valid, active OpenAI API key ready." -ForegroundColor Yellow
Write-Host ""

# Prompt for API key securely
$SecureApiKey = Read-Host -Prompt "Enter your new OpenAI API key" -AsSecureString
$ApiKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureApiKey))

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "❌ No API key provided. Exiting." -ForegroundColor Red
    exit 1
}

if (-not $ApiKey.StartsWith("sk-")) {
    Write-Host "❌ Invalid OpenAI API key format. Keys should start with 'sk-'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Updating OpenAI API key in Google Secret Manager..." -ForegroundColor Green

try {
    # Update the secret
    $ApiKey | gcloud secrets versions add openai-api-key --data-file=- --project=$ProjectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ OpenAI API key updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Next steps:" -ForegroundColor Cyan
        Write-Host "1. The Cloud Run service will automatically use the new key" -ForegroundColor White
        Write-Host "2. Test the OpenLens feature again" -ForegroundColor White
        Write-Host "3. If issues persist, check Cloud Run logs" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to update secret. Check your gcloud authentication." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error updating secret: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear the API key from memory
    $ApiKey = $null
    $SecureApiKey = $null
    [System.GC]::Collect()
}

Write-Host ""
Write-Host "🔒 API key cleared from memory for security." -ForegroundColor Green
