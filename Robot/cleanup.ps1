$Target=$MyInvocation.MyCommand.Source.Replace($MyInvocation.MyCommand.Name, "chromedriver.exe")
$Processes=Get-Process chromedriver -ErrorVariable ProcessError -ErrorAction SilentlyContinue | Where-Object {$_.Path -eq $Target}
Write-Host Found $Processes.Count running processes from [$Target]
If ($Processes.Count -gt 0) {
    $Processes | Stop-Process -Force
    If ($ProcessError) {
        Write-Host $ProcessError
    }
    Else {
        Write-Host Cleanup successful
    }
}