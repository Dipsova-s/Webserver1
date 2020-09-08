$PathContent = "Content\Diagrams\"
If (!(Test-Path $PathContent)) {
	Write-Warning "You must select [include submodule] on the first clone!"
	exit $LASTEXITCODE
}

Write-Host "FieldCategoryIcons..."
New-Item -Path "EveryAngle.WebClient\EveryAngle.WebClient.Web\Admin\UploadedResources\FieldCategoryIcons\" -ItemType "Directory" -Force | Out-Null
Copy-Item "EveryAngle.WebClient\EveryAngle.ManagementConsole\UploadedResources\FieldCategoryIcons\*" -Destination "EveryAngle.WebClient\EveryAngle.WebClient.Web\Admin\UploadedResources\FieldCategoryIcons\" -Recurse -Force
Write-Host "Done!"
Write-Host "-------------------------"

Write-Host "CreateNewAngleBySchema..."
New-Item -Path "EveryAngle.WebClient\EveryAngle.WebClient.Web\Resources\CreateNewAngleBySchema\" -ItemType "Directory" -Force | Out-Null
Copy-Item "$PathContent*" -Destination "EveryAngle.WebClient\EveryAngle.WebClient.Web\Resources\CreateNewAngleBySchema\" -Recurse -Force
Write-Host "Done!"
Write-Host "-------------------------"

$Path7zip = "SetupFiles\ThirdParty\7-Zip\"
Write-Host $Path7zip"7za.exe"
If (!(Test-Path $Path7zip"7za.exe")) {
	Write-Warning "Not found, download [7-Zip Extra] from https://www.7-zip.org/download.html"
	New-Item -Path $Path7zip -ItemType "Directory" -Force | Out-Null
}
else {
	Write-Host "Done!"
}
Write-Host "-------------------------"

$PathGoToSAP = "EveryAngle.GoToSAP.Launcher\"
Write-Host $PathGoToSAP"EveryAngle.GoToSAP.Launcher.exe"
If (!(Test-Path $PathGoToSAP"EveryAngle.GoToSAP.Launcher.exe")) {
	Write-Warning "Not found, download from any build of https://everyangle.visualstudio.com/EveryAngle/_build?definitionId=474"
	New-Item -Path $PathGoToSAP -ItemType "Directory" -Force | Out-Null
}
else {
	Write-Host "Done!"
}
Write-Host "-------------------------"

$PathTools = "DeploymentTools\bin\"
Write-Host $PathTools"*"
If (!(Test-Path $PathTools"*")) {
	Write-Warning "Not found, download from any build of https://everyangle.visualstudio.com/EveryAngle/_build?definitionId=9"
	New-Item -Path $PathTools -ItemType "Directory" -Force | Out-Null
}
else {
	Write-Host "Done!"
}
Write-Host "-------------------------"

$PathTools = "NET\Frontend\WebDeploy\"
Write-Host $PathTools"*"
If (!(Test-Path $PathTools"*")) {
	Write-Warning "Not found, please publish webdeploy for EveryAngle.ManagementConsole.Web, EveryAngle.WebClient.Web and EveryAngle.OData.Service projects to this folder"
	New-Item -Path $PathTools -ItemType "Directory" -Force | Out-Null
}
else {
	Write-Host "Done!"
}
Write-Host "-------------------------"

Write-Host -NoNewLine 'Press any key to continue...';
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown');