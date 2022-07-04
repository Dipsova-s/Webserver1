param (
    $HelpType,
    $FileOperation,
    $OutputFolder,
    $OutputFolderPostfix,
    $UnzipFilter
)

$password = "fe730c04-521e-4de5-9c6b-69e2aeef5b74" | ConvertTo-SecureString -asPlainText -Force

$Credential = New-Object System.Management.Automation.PSCredential ("nl-eadoc001\builduser",$password)
If (!(Test-Path X:))
{
New-PSDrive -Name "X" -Root "\\nl-eadoc001\Download" -Persist -PSProvider "FileSystem" -Credential $Credential
}

Add-Type -AssemblyName System.IO.Compression.FileSystem



$FileOperationList = "Copy", "Unzip"
$HelpInfoList = @(
    New-Object PSObject -Property @{Name = "Field"; JobList = "joblist_autobuilder"; FileFilter = "Field_Help_*_eahelptexts.zip", "FieldHelp_Templates_*_eahelptexts.zip"; UnzipToLangFolder = $True}
    New-Object PSObject -Property @{Name = "ManagementConsole"; JobList = "joblist_autobuilder"; FileFilter = "EA2_Management_Webhelp_*_webhelp.zip"; UnzipToLangFolder = $False}
    New-Object PSObject -Property @{Name = "ManagementConsoleNew"; JobList = "joblist_autobuilder"; FileFilter = "23221-Every_Angle_Management_Webhelp*.zip"; UnzipToLangFolder = $False}
    New-Object PSObject -Property @{Name = "ManagementConsoleOnCloud"; JobList = "joblist_autobuilder"; FileFilter = "89877-IT_Management_Console_Cloud*.zip"; UnzipToLangFolder = $False}
	New-Object PSObject -Property @{Name = "ManagementConsoleOnPrem"; JobList = "joblist_autobuilder"; FileFilter = "23221-IT_Management_Console_On-Prem*.zip"; UnzipToLangFolder = $False}
    New-Object PSObject -Property @{Name = "WebClient"; JobList = "joblist_autobuilder"; FileFilter = "EA2_Client_Webhelp_*_webhelp.zip"; UnzipToLangFolder = $False}
    New-Object PSObject -Property @{Name = "WebClientNew"; JobList = "joblist_autobuilder"; FileFilter = "8513-Every_Angle_Web_Client_Web_Help*.zip"; UnzipToLangFolder = $False}
    New-Object PSObject -Property @{Name = "WebClientOnCloud"; JobList = "joblist_autobuilder"; FileFilter = "89567-Web_Client_Cloud*.zip"; UnzipToLangFolder = $False}
	New-Object PSObject -Property @{Name = "WebClientOnPrem"; JobList = "joblist_autobuilder"; FileFilter = "8513-Web_Client_On-Prem*.zip"; UnzipToLangFolder = $False}
)

function gfo($List, $Name)
{
  $Result = $List | where { $_ -eq $Name }
  if (!$Result) { throw "Unknown file operation '$Name'" }
  $Result
}

function ghi($List, $Name)
{
  $Result = $List | where { $_.Name -eq $Name }
  if (!$Result) { throw "Unknown help type '$Name'" }
  $Result
}

function GetOutputRun($Branch, $TargetBranch, $Name)
{
  if ($TargetBranch -Match ".*/release/.*") { $TargetBranch.split("/")[-1] } else {
    if ($Branch -Match ".*/release/.*") { $Branch.split("/")[-1] } else { if( $Name -Match ".*OnCloud" ) { "master" } else { "2020main" } }
  }
}

function GetIso2Language($FileName)
{
  if ($FileName -notmatch "([a-z]{2})-([A-Z]{2})") { throw "Unknown language for file '$FileName'" }
  $Matches[1]
}

function Unzip($ArchiveFile, $OutputFolder)
{
  $NumFiles = 0;
  $Archive = [System.IO.Compression.ZipFile]::OpenRead($ArchiveFile)
  foreach ($Entry in $Archive.Entries)
  {
    if ($Entry.FullName -notlike $UnzipFilter) { continue }

    $EntryFile = [System.IO.Path]::Combine($OutputFolder, $Entry.FullName)
    $EntryDir = [System.IO.Path]::GetDirectoryName($EntryFile)

    if(!(Test-Path $EntryDir )) { New-Item -ItemType Directory -Path $EntryDir | Out-Null }

    if(!$EntryFile.EndsWith("\") -and !$EntryFile.EndsWith("/")) {
      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($Entry, $EntryFile, $true);
      $NumFiles++
    }
  }
  Write-Host "  Extracted $NumFiles files"
}

function Main()
{
  $HelpInfo = ghi $HelpInfoList $HelpType
  $FileOperation = gfo $FileOperationList $FileOperation
  $JobList = $HelpInfo.JobList
  $OutputRun = GetOutputRun $Env:BUILD_SOURCEBRANCH $Env:SYSTEM_PULLREQUEST_TARGETBRANCH $HelpType
  $SourceFolder = "X:\$JobList\$OutputRun"
  $FileFilter = $HelpInfo.FileFilter
  $UnzipToLangFolder = $HelpInfo.UnzipToLangFolder

  Write-Output "Source: $SourceFolder"
  Write-Output "Files: $FileFilter"

  Push-Location -Path $SourceFolder
  if ((Get-ChildItem * -Include $FileFilter).Count -eq 0) {
    throw "Found no files match '$FileFilter' in folder '$SourceFolder'"
  }
  Get-ChildItem * -Include $FileFilter | Foreach-Object {
    $FileName = $_.Name
    $FileFullName = $_.FullName
    $Language = GetIso2Language $FileName

    Write-Host "$FileName"
    Write-Host "  Language:" $Language
    Write-Host "  File time:" $_.LastWriteTime
    
    switch($FileOperation) {
      "Copy" {
        $Folder = Join-Path $OutputFolder $OutputFolderPostfix
        Write-Host "  Copy to $Folder"
        New-Item -ItemType Directory -Path $Folder -Force > $null
        Copy-Item $FileFullName -Destination $Folder -Force
      }
      "Unzip" {
        $Folder = $OutputFolder
        if ($UnzipToLangFolder) { $Folder = Join-Path $Folder $Language }
        $Folder = Join-Path $Folder $OutputFolderPostfix
        Write-Host "  Unzip to $Folder"
        Unzip $FileFullName $Folder
      }
    }
  }
  Pop-Location
}

Try {
  Main
} Catch {
  Write-Host "##vso[task.logissue type=error;]$_"
  Exit 1
}