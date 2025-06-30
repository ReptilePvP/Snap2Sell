$key = Read-Host "Enter your OpenAI API key" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($key)
$unsecurekey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

# Create the secret
echo $unsecurekey | gcloud secrets create openai-api-key --data-file=-

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create secret. It might already exist." -ForegroundColor Red
    Write-Host "Trying to update existing secret..." -ForegroundColor Yellow
    echo $unsecurekey | gcloud secrets versions add openai-api-key --data-file=-
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secret updated successfully!" -ForegroundColor Green
    }
}

# Clean up the variable
$unsecurekey = $null
