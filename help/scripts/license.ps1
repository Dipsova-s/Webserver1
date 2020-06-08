add-type @"
  using System.Net;
  using System.Security.Cryptography.X509Certificates;
  public class TrustAllCertsPolicy : ICertificatePolicy {
      public bool CheckValidationResult(ServicePoint srvPoint, X509Certificate certificate, WebRequest request, int certificateProblem) {
          return true;
      }
   }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

$localDefault = "$env:computername.$env:userdnsdomain".ToLower()
$local = Read-Host "WebServer FQDN (default: $localDefault)"
If ($local -eq '') {
    $local = $localDefault
}
$serverDefault = "nl-web2020-2.eatestad.local"
$appServer = Read-Host "AppServer FQDN (default: $serverDefault)"
If ($appServer -eq '') {
    $appServer = $serverDefault
}
$modelServer = Read-Host "ModelServer FQDN (default: $serverDefault)"
If ($modelServer -eq '') {
    $modelServer = $serverDefault
}

$Target = $MyInvocation.MyCommand.Source.Replace($MyInvocation.MyCommand.Name, "")
$DownloadUrl = "https://ealicenses-tst.everyangle.org/api/license/generate"
$DownloadOutput = "$Target\license-$local.zip"
$Data = @"
{
    "general_webserver_license":{
        "fully_qualified_domain_name":"$local"
    },
    "application_server_license":{
        "expires_format":"01/01/2029",
        "fqdn":"$appServer"
    },
    "sts": {
        "fully_qualified_domain_name": "$appServer"
    },
    "repository": {
        "fully_qualified_domain_name": "$appServer"
    },
    "model_licenses":[
        {
            "expires_format":"01/01/2029",
            "model_id":"EA2_800",
            "fqdn1":"$modelServer"
        }
    ],
    "organizationSerial":"OR.11.0010"
}
"@

Write-Host Data:
Write-Host $Data
try {
    $Credential = Get-Credential -Credential everyangle\books
}
catch {
    # no error
}
If ($Credential) {
    Write-Host Downloading file...
    Invoke-WebRequest -Uri $DownloadUrl -Method Post -Body $Data -ContentType "application/json" -Credential $Credential -OutFile $DownloadOutput -UseBasicParsing
}