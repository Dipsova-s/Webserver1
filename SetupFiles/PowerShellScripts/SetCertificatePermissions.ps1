#requires -version 3
<#
.SYNOPSIS
  Assigns read permissions for the certificate to the specified 
  application pool identity.
.DESCRIPTION
  It looks at the personal certificate store to find a certificate
  matching the thumbprint and assign permissions to the specified 
  application pool
.PARAMETER Thumbprint
  Thumbprint of the certificate
.PARAMETER AppPoolName
  Application pool that will have permissions over the certificate.
.INPUTS
  None
.OUTPUTS
  None
.NOTES
  Version:        1.0
  Author:         Javier Cacho
  Creation Date:  07-12-2018
  Purpose/Change: Initial script development
.EXAMPLE
  Creating the share:
    SetCertificatePermissions.ps1 `
      -Thumbprint 6b7acc520305bfdb4f7252daeb2177cc091faae1 `
      -AppPoolName M4

#>

[CmdletBinding()]
#---------------------------------------------------------[Script Parameters]------------------------------------------------------
param (
    [Parameter(Position = 0, Mandatory = $true, ValueFromPipeline = $true)]
    [ValidateNotNullOrEmpty()]    
    [string]$Thumbprint,
    
    [Parameter(Position = 1, Mandatory = $true, ValueFromPipeline = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$AppPoolName
)

#---------------------------------------------------------[Initialisations]--------------------------------------------------------

#Set Error Action to Stop
$ErrorActionPreference = 'Stop'

#Import Modules & Snap-ins
Import-Module WebAdministration

#----------------------------------------------------------[Declarations]----------------------------------------------------------

$scriptVersion = '1.0'

#-----------------------------------------------------------[Functions]------------------------------------------------------------

#region Input parameter Validation
function Test-InputParameters {
    [CmdletBinding()]
    param (    
        [string]$SanitizedThumbprint,
        [string]$SanitizedAppPoolName
    )
    begin {
        Write-Output "[INFO] Validating input parameters..."
    }
    process {        
        Test-Thumbprint -Thumbprint $SanitizedThumbprint
        Test-AppPoolName -AppPoolName $SanitizedAppPoolName
    }
    end {
        Write-Output "[INFO] Input parameters validation finished."
    }
}

function Test-Thumbprint {
    [CmdletBinding()]
    param (
        [Parameter(Position = 0, Mandatory = $true, ValueFromPipeline = $true)]
        [ValidateNotNullOrEmpty()]        
        [string]$Thumbprint
    )
    process {
        $isExistentThumbprint = !!(Get-ChildItem CERT:\LocalMachine\My | Where-Object {$_.Thumbprint -eq $Thumbprint})
        if (!$isExistentThumbprint) {
            throw "Thumbprint is invalid or no certificate was found for it: '$Thumbprint'"
        }
    }
}
function Test-AppPoolName {
    [CmdletBinding()]
    param (
        [Parameter(Position = 0, Mandatory = $true, ValueFromPipeline = $true)]
        [ValidateNotNullOrEmpty()]        
        [string]$AppPoolName
    )
	process {
        if (!$(Test-Path "IIS:\AppPools\$AppPoolName")) { 
            throw "Cannot find Application Pool with name '$AppPoolName'"
        }
    }
}
#endregion

#region Set certificate permissions
function Set-CertificatePermissions {
    [CmdletBinding()]
    param (
        [string]$ValidThumbprint,
        [string]$ValidAppPoolName
    )
    begin {
        Write-Output "[INFO] Setting premissions..."
    }
    process {
        $certificate = Get-ChildItem -Path "Cert:\LocalMachine\My\$ValidThumbprint"
        $privateKeyFileName = $certificate.PrivateKey.CspKeyContainerInfo.UniqueKeyContainerName
        $privateKeyFilePath = Join-Path "$env:ProgramData\Microsoft\Crypto\RSA\MachineKeys\" $privateKeyFileName
        $privateKeyFileAcl = Get-Acl -Path $privateKeyFilePath
        $permission="IIS AppPool\$ValidAppPoolName","Read","Allow"
        $accessRule=new-object System.Security.AccessControl.FileSystemAccessRule $permission
        $privateKeyFileAcl.AddAccessRule($accessRule)
        Set-Acl $privateKeyFilePath $privateKeyFileAcl         
    }
    end {
        Write-Output "[INFO] Permissions settled."
    }
}
#endregion

#-----------------------------------------------------------[Execution]------------------------------------------------------------

#region Execution
Write-Output "[INFO] Beginning SetCertificatePermissions script, version '$scriptVersion'"
Write-Output "[INFO] Parameters -Thumbprint '$Thumbprint' -AppPoolName '$AppPoolName'"

try {
    $sanitizedThumbprint = $Thumbprint.Trim();  
    $sanitizedAppPoolName = $AppPoolName.Trim();

    Test-InputParameters `
        -SanitizedThumbprint $sanitizedThumbprint `
        -SanitizedAppPoolName $sanitizedAppPoolName
    
    Set-CertificatePermissions `
        -ValidThumbprint $sanitizedThumbprint `
        -ValidAppPoolName $sanitizedAppPoolName
}
catch {
    Write-Output "[ERROR] $($_.Exception)"
    exit 1
}

Write-Output "[INFO] End of SetCertificatePermissions script."
#endregion