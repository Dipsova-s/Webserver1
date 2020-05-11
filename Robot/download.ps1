$Target=$MyInvocation.MyCommand.Source.Replace($MyInvocation.MyCommand.Name, "")

$DriverVersion = "2.46"
try {
    # get Chrome version
    $Version = (Get-Item (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe').'(Default)').VersionInfo.FileVersion
    Write-Host Found Google Chrome: $Version
    $Version = $Version.Split(".")[0]

    # get driver version
    $DriverUrl = "http://chromedriver.storage.googleapis.com/LATEST_RELEASE_$Version"
    Write-Host Getting driver version information from $DriverUrl
    $response = Invoke-WebRequest $DriverUrl -UseBasicParsing
    $DriverVersion = $response.Content
}
catch {
    # no error
    Write-Host Error on getting driver version!
}
$Storage = "$env:SystemDrive\chromedriver\$DriverVersion"

# check exiting from $Storage
If (Test-Path -Path $Storage\chromedriver.exe) {
    Write-Host Downloading skipped! found driver from $Storage
    Copy-Item $Storage\chromedriver.exe -Destination $Target -Force
    exit $LASTEXITCODE
}

# check exiting chromedriver version
If (Test-Path -Path .\chromedriver.exe) {
    $ExistDriverVersion = (.\chromedriver.exe --version | Out-String).Split(' ')[1]
    If ($ExistDriverVersion -eq $DriverVersion) {
        Write-Host Downloading skipped! found driver version $DriverVersion
        exit $LASTEXITCODE
    }
}

# download driver
$DownloadOutput = "$Target\chromedriver_win32.zip"
$DownloadUrl = "https://chromedriver.storage.googleapis.com/$DriverVersion/chromedriver_win32.zip"
Write-Host Downloading driver from $DownloadUrl
Invoke-WebRequest -Uri $DownloadUrl -OutFile $DownloadOutput -UseBasicParsing

# unzip
Write-Host Extracting chromedriver.exe
Expand-Archive -Path $DownloadOutput -DestinationPath $Target -Force
Write-Host Copy file to storage folder
New-Item -ItemType directory -Path $Storage -Force
Copy-Item $Target\chromedriver.exe -Destination $Storage -Force
Write-Host Done!