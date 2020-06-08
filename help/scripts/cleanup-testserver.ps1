$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
If (!$currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
	$currentFile = $MyInvocation.MyCommand.Path
	Start-Process powershell "$currentFile" -verb runAs
	exit $LASTEXITCODE
}

# Start Operation: Remove all users with prefixed 'U_'
Get-WmiObject Win32_UserAccount -Filter "LocalAccount='True' And Name LIKE 'U_%'" | % {Invoke-Command -ScriptBlock {net user $_.Name /delete}}

# Cleanup log/temp
Get-ChildItem "C:\inetpub\logs\LogFiles\W3SVC1\*" -Recurse | Remove-Item -Recurse
Get-ChildItem "C:\Program Files\Every Angle\ETL Server\logs\*" -Recurse | Remove-Item -Recurse
Get-ChildItem "C:\Windows\Microsoft.NET\Framework*\v*\Temporary ASP.NET Files" -Recurse | Remove-Item -Recurse

Sleep 2