$dynamodbLocalFolder = ".\dynamodb-local"
$dynamodbJarUrl = "https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.zip"
$zipFile = ".\dynamodb_local_latest.zip"
$port = 1234

# Create folder if it doesn't exist
if (-not (Test-Path $dynamodbLocalFolder)) {
    New-Item -ItemType Directory -Path $dynamodbLocalFolder
    Write-Host "Created directory: $dynamodbLocalFolder"
}

# Download DynamoDB Local if not already downloaded
if (-not (Test-Path "$dynamodbLocalFolder\DynamoDBLocal.jar")) {
    Write-Host "Downloading DynamoDB Local..."
    Invoke-WebRequest -Uri $dynamodbJarUrl -OutFile $zipFile
    
    Write-Host "Extracting DynamoDB Local..."
    Expand-Archive -Path $zipFile -DestinationPath $dynamodbLocalFolder -Force
    
    # Clean up zip file
    Remove-Item $zipFile
    
    Write-Host "DynamoDB Local has been downloaded and extracted."
}

# Run DynamoDB Local
Write-Host "Starting DynamoDB Local on port $port..."
Write-Host "Press Ctrl+C to stop the server."

# Change to the DynamoDB Local directory
Set-Location $dynamodbLocalFolder

# Run DynamoDB Local with Java
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port $port