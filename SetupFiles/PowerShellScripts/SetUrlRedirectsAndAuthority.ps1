#requires -version 3
<#
.SYNOPSIS
  PowerShell script to set the authority and redirect urls for the WebClient and Management Console
.DESCRIPTION
  It sets the Authority and Redirect Uri in the web configs by querying the CSM to get the STS url.
.PARAMETER AppServerUrl
  Url the App Server is reachable
.PARAMETER AppServerPort
  Port the App Server is listening on
.PARAMETER CertificateThumbprint
  Thumbprint of the certificate
.PARAMETER WebServerPhysicalPath
  Physical Path of the web part of the Web Server i.e. C:/intepub/wwwroot/webserver
.PARAMETER ManagementConsolePhysicalPath
  Physical Path of the web part of the IT Management Console i.e. C:/intepub/wwwroot/webserver/admin
.INPUTS
  None
.OUTPUTS
  None
.NOTES
  Version:        1.0
  Author:         Johannes Badenhorst
  Creation Date:  03-11-2020
  Purpose/Change: Initial script development
.EXAMPLE
  Setting the values:
    SetUrlRedirectsAndAuthority.ps1
      -CertificateThumbprint 6b7acc520305bfdb4f7252daeb2177cc091faae1
      -AppServerUrl https://nl-johannes.eatestad.local/
      -AppServerPort 60000
      -WebServerPhysicalPath C:/intepub/wwwroot/webserver
      -ManagementConsolePhysicalPath C:/intepub/wwwroot/webserver/admin
#>

[CmdletBinding()]
param (
  [Parameter(Mandatory = $true)]
  [string]
  $AppServerUrl,
  [Parameter(Mandatory = $true)]
  [string]
  $AppServerPort,
  [Parameter(Mandatory = $true)]
  [string]
  $CertificateThumbprint,
  [Parameter(Mandatory = $true)]
  [string]
  $WebServerPhysicalPath,
  [Parameter(Mandatory = $true)]
  [string]
  $ManagementConsolePhysicalPath
);

# Set error preference to make sure that the script exits on the first error with exit code 1.
$ErrorActionPreference = "stop"

# Disable SSL 3.0, TLS 1.0 and TLS 1.1
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -band -bnot [System.Net.SecurityProtocolType]::Ssl3
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -band -bnot [System.Net.SecurityProtocolType]::Tls
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -band -bnot [System.Net.SecurityProtocolType]::Tls11

# Enable TLS 1.2
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12

Write-Host "[INFO] Enabled TLS versions: $([System.Net.ServicePointManager]::SecurityProtocol)"

<#
# Helper functions
#>
function SetValueInWebConfig {
  param (
    $Physicalpath,
    $Uri,
    $Key
  )
  Write-Host "[INFO] Updating $Physicalpath (Key: ${Key}, Value: ${Uri})"
    
  $configFile = $Physicalpath + "/web.config";
  $doc = (Get-Content $configFile) -as [Xml]
  $root = $doc.get_DocumentElement();
  $appSettings = $root.appSettings.SelectNodes("add") | Where-Object { $_.key -ieq $Key };
  $appSettings.SetAttribute("value", $Uri);
  $doc.Save($configFile);
}

<#
# Start process
#>
$WebClientServiceName = "WebServer";
$STSServiceName = "SecurityTokenService"

# Create CSM uri
$CSMPort = ($AppServerPort -as [int]) + 1;
$AppServerUrlWithPort = "";

if (!$AppServerUrl.StartsWith("https://") -and !$AppServerUrl.StartsWith("http://")) {
  $AppServerUrlWithPort = "https://";
}

if ($AppServerUrl.EndsWith("/") ) {
  $AppServerUrlWithPort += $AppServerUrl.Substring(0, $AppServerUrl.Length - 1);
}
else {
  $AppServerUrlWithPort += $AppServerUrl;
}

$AppServerUrlWithPort += ":" + $CSMPort;
$CSMServiceUri = "/csm/componentservices";
$Uri = $AppServerUrlWithPort + $CSMServiceUri;

# Retrieve certificate from local store
$Certificate = Get-ChildItem -Path "Cert:\LocalMachine\My" | Where-Object { $_.Thumbprint -ieq $CertificateThumbprint };

# Make call to CSM for components
$Components = Invoke-RestMethod -Uri $Uri -Certificate $Certificate -Method Get;

$WebServer = $Components | Where-Object { $_.type -ieq $WebClientServiceName };
$STS = $Components | Where-Object { $_.type -ieq $STSServiceName };

$stsUri = $STS.uri.ToLower()
$webServerUri = $WebServer.uri

SetValueInWebConfig -Physicalpath $WebServerPhysicalPath -Uri $stsUri -Key "Authority";
SetValueInWebConfig -Physicalpath $ManagementConsolePhysicalPath -Uri $stsUri -Key "Authority";

SetValueInWebConfig -Physicalpath $WebServerPhysicalPath -Uri $webServerUri -Key "RedirectBaseUri";
SetValueInWebConfig -Physicalpath $ManagementConsolePhysicalPath -Uri $webServerUri -Key "RedirectBaseUri";