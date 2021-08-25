#pragma option -v+
#pragma verboselevel 9
#define ASSEMBLY_VERSION "AssemblyVersion"

;Set define from commandline: /d<name>[=<value>]  Sets #define public <name> <value>

;Inno Source: http://www.hackchina.com/en/cont/123128 
;DotNet Libraries: http://www.codeproject.com/KB/install/dotnetfx_innosetup_instal.aspx

#define SourceDir AddBackslash(SourcePath) + ".\.."
#define VersionFile = "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.WebClient.Web.dll"
    
#if FileExists(AddBackslash(SourceDir) + VersionFile) == 0
  #pragma error "FILE: " + AddBackslash(SourceDir) + VersionFile + " NOT FOUND"
#endif

#pragma message "Using SourceDir: " + SourceDir

#ifndef OutputDir
  #define OutputDir "c:\t\innosetup"
#endif                                              

#define MyAppVersion GetFileVersion(AddBackslash(SourceDir) + VersionFile)
#define MyAppName "Every Angle Web Server"
#define MyAppPublisher "Every Angle Software Solutions BV"                            
#define MyAppURL "http://www.everyangle.com"

#define RegPath "SOFTWARE\Every Angle"
#define CodeSiteVersion "5.1.8.0"
#define MyAppId "B04A934E-B594-4023-9978-289701FAB673"

#define coTrainingMovies = "Training movies"

[code]
var
  IsCleanInstall: boolean;
  IsUnsecureUpgrade: boolean;

function LogFolder: string; // Used in Tools.iss ?
begin
  Result := ExpandConstant('{code:DataPath|Log}'); 
end;
#include "fixfonts.iss"
#include "tools.iss"
#include "xml_utils.iss"
#include "settings.iss"
#include "JsonParser.iss"
#include "custom_pages.iss"
#include "codesite_install.iss"   

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={code:GetAppId}
AppName={code:GetAppName}
AppVersion={#MyAppVersion}
VersionInfoVersion={#MyAppVersion}
AppCopyright=2015
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DisableProgramGroupPage=yes
OutputBaseFilename=EAWebServerSetup
Compression=lzma
SolidCompression=yes
Password=
PrivilegesRequired=none
SourceDir={#SourceDir}
OutputDir={#OutputDir}
ChangesEnvironment=No
DefaultDirName={code:GetDataDir}
DefaultGroupName=
UsePreviousAppDir=no
UsePreviousLanguage=no
DirExistsWarning=no
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardImageStretch=no
WizardImageFile=SetupFiles\EAM4.bmp
WizardSmallImageFile=SetupFiles\EALogoSmall.bmp
;WizardImageFile=compiler:WizModernImage.bmp
;SetupIconFile=General\Shared\Resources\Icons\EveryAngleClient30.ico
SetupLogging=yes

[Types]
Name: "full"; Description: "Standard installation"; Flags: iscustom

[Components]
Name: WebClient; Description: "Web Client"; Types: full; Flags: fixed 
Name: OData; Description: "OData service";
Name: Movies; Description: "{#coTrainingMovies}"; Types: full; Flags: disablenouninstallwarning
Name: codesite; Description: "CodeSite logging"; Types: full; Flags: disablenouninstallwarning

[Files]
;WebClient
Source: "NET\Frontend\WebDeploy\EveryAngle.WebClient.Web.deploy-readme.txt"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.WebClient.Web.SourceManifest.xml"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.WebClient.Web.zip"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion nocompression; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.WebClient.Web.SetParameters.xml"; DestDir: "{code:DataPath|WebDeploy}"; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.WebClient.Web.deploy.cmd"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
;Diagrams
Source: "Content\Diagrams\*.*"; DestDir: "{code:DataPath|WebDeploy\Diagrams}"; Flags: recursesubdirs ignoreversion deleteafterinstall; BeforeInstall: RegisterDiagramFile(); Components: webclient
;Content Input File for fixing angle warnings
Source: "Content\AngleWarningsList.xlsx"; DestDir: "{code:DataPath|Tools\Data}"; Flags: ignoreversion skipifsourcedoesntexist; Components: webclient
;ManagementConsole
Source: "NET\Frontend\WebDeploy\EveryAngle.ManagementConsole.Web.deploy-readme.txt"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.ManagementConsole.Web.SourceManifest.xml"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.ManagementConsole.Web.zip"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion nocompression; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.ManagementConsole.Web.SetParameters.xml"; DestDir: "{code:DataPath|WebDeploy}"; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.ManagementConsole.Web.deploy.cmd"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient

;Command Tool 
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\CommandLine.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.CSM.AppServerAPI.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.CSM.Client.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.CSM.Client.Interfaces.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.CSM.Reg.exe"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.CSM.Reg.exe.config"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.CSM.Shared.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.Utilities.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\EveryAngle.Security.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\Ionic.Zip.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\Microsoft.Rest.ClientRuntime.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
Source: "EveryAngle.WebClient\EveryAngle.WebClient.Web\bin\Newtonsoft.Json.dll"; DestDir: "{code:DataPath|AppServerReg}"; Flags: ignoreversion; Components: webclient
  
;Certificate installer
Source: "DeploymentTools\bin\*.*"; DestDir: "{code:DataPath|Tools}"; Flags: ignoreversion; Components: webclient
 
;OData Service
Source: "NET\Frontend\WebDeploy\EveryAngle.OData.Service.deploy-readme.txt"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.OData.Service.SourceManifest.xml"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.OData.Service.zip"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion nocompression; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.OData.Service.SetParameters.xml"; DestDir: "{code:DataPath|WebDeploy}"; Components: webclient
Source: "NET\Frontend\WebDeploy\EveryAngle.OData.Service.deploy.cmd"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion; Components: webclient

;Codesite
Source: "Resources\Raize-{#CodeSiteVersion}\CS5_Tools.exe"; DestDir: "{code:DataPath|Setup}"; Flags: ignoreversion nocompression; Components: codesite
Source: "Resources\Raize-{#CodeSiteVersion}\CodeSiteToolsSetup.txt"; DestDir: "{code:DataPath|Setup}"; Flags: ignoreversion; Components: codesite

;Movies
Source: "SetupFiles\ThirdParty\7-Zip\7za.exe"; DestDir: "{code:DataPath|WebDeploy}"; Flags: ignoreversion overwritereadonly deleteafterinstall;
Source: "{src}\Movies.zip"; DestDir: "{src}"; Flags: external onlyifdoesntexist; Components: movies
Source: "{src}\*.mp4"; DestDir: "{src}"; Flags: external onlyifdoesntexist; Components: movies

;SAPLauncher
Source: "EveryAngle.GoToSAP.Launcher\EveryAngle.GoToSAP.Launcher.exe"; DestDir: "{src}\EveryAngle.GoToSAP.Launcher"; Flags: ignoreversion overwritereadonly deleteafterinstall;

; Escape/Unescape
Source: "Resources\EveryAngle.EncryptionDecryption32-2.3\EveryAngle.EncryptionDecryption32.dll";Flags: dontcopy; Components: OData

; PowerShell Scripts
Source: "SetupFiles\PowerShellScripts\SetCertificatePermissions.ps1"; Flags: dontcopy noencryption
Source: "SetupFiles\PowerShellScripts\SetUrlRedirectsAndAuthority.ps1"; Flags: dontcopy noencryption

[Dirs]
Name: "{code:DataPath|log}";

[Run]
;Install windows feature 'Dynamic Compression' in IIS
Filename: "PowerShell"; Parameters: """Import-Module ServerManager; Add-WindowsFeature Web-Server, Web-Dyn-Compression"""; Flags: runhidden; StatusMsg: "Installing Dynamic Compression for IIS" 

[UninstallRun] 

[UninstallDelete]
Type: files; Name: "{code:DataPath|WebDeploy\EveryAngle.WebClient.Web.SetParameters.xml}"; Components: webclient
Type: files; Name: "{code:DataPath|AppServerReg}\*"; 
Type: filesandordirs; Name: "{code:DataPath|AppServerReg}"

[Code]
//Globals
const 
  BULLET = #$20#$20#$2022#$20#$20;
  EASUFFIX_NONE = '<NONE>';
  DEREGISTERCMD = 'Deregister';
  REGISTERCMD = 'Register';
  ODATA_COMPONENT = 'ODataService';
  WEBSERVER_COMPONENT = 'WebServer';
  ITMANAGEMENTCONSOLE_COMPONENT = 'ITManagementConsole';

var
  EASuffixLabel : TLabel;
  EASuffix: string;

  IISConfigSites,
  WebClientConfig,
  ManagementConsoleConfig: Variant;

  WebClientConfigPage: TInputQueryWizardPage;
  CertificatePage: TInputFileWizardPage;
  ODataSettingsPage: TInputQueryWizardPage;

  IISSite: TComboBox;
  IISVirtualPath: TEdit;

  CertificatePassword: TPasswordEdit;
  CertificateCheckbox: TCheckBox;

  DiagramFiles: Tstringlist;
  MoviesSelected,
  IsNewInstall,
  AppConstantInitialized : Boolean; 
  AppServerUrl: string;
  
 
procedure RegisterDiagramFile();
begin
  DiagramFiles.Add(ExpandConstant(CurrentFileName));
end;

function IISPathWC: string;
begin
  if IsUninstaller then
    Result := GetPreviousData('Site', '') + GetPreviousData('Path', '')
  else
  begin
    Result := IISSite.Text + IISVirtualPath.Text;

    // Remove trailing '/' when present
    if LastChar(Result) = '/' then
      Result := Copy(Result, 0, Length(Result) - 1);
  end;
end;

function IISPathMC: string;
begin
  Result := IISPathWC + '/admin';
end;

function GetEASuffix(Param: String): String;
// Returns specified suffix (if any)
begin
  if EASuffix = '' then
  begin
    EASuffix := pri_GetOverrideValue('EASuffix');
    if (EASuffix = '') then
    begin
      if IsUninstaller then
       EASuffix := GetPreviousData('EASuffix', EASUFFIX_NONE)
      else
        EASuffix := EASUFFIX_NONE;
    end;
  end;

  if EASuffix <> EASUFFIX_NONE then
    Result := Param + EASuffix
  else
    Result := '';
end;

function getAppName(param: String): String;
begin;
  Result := '{#MyAppName}' + GetEASuffix(' ');
end;

function getAppId(param: String): String;
begin;
  Result := '{#MyAppId}' + GetEASuffix('_');
end;

function DataPath(Param: String): String;
begin
  if IsUninstaller then
    Result := GetPreviousData('Data', '')
  else
    Result := ExpandConstant('{app}');
  if param <> '' then
    Result := Result + '\' + Param;
end;



function MSDeployPath: string;
var
  i : integer;
  Path : string;  
  SubKeys: TArrayOfString;
  RegPath : string;
begin
  result := '';
  RegPath := 'SOFTWARE\Microsoft\IIS Extensions\MSDeploy';
  if RegGetSubkeyNames(HKEY_LOCAL_MACHINE, RegPath, SubKeys) then
    for i := 0 to GetArrayLength(SubKeys)-1 do
      if RegQueryStringValue(HKEY_LOCAL_MACHINE, RegPath + '\' + SubKeys[i], 'InstallPath', Path) then
      begin 
        path := AddBackslash(Path) + 'msdeploy.exe';
        if FileExists(Path) then
          result := Path;
      end;
end;

function  MSDeployInstalled: boolean;
begin
  Result := MSDeployPath <> '';
end;

function StrAdd(aStringValue: string; aInteger: Integer): string;
begin
  Result := IntToStr(StrToInt(aStringValue) + aInteger);
end;
function EASharedRegistryPath: string;
begin
  Result := '{#RegPath}' + GetEASuffix('\'); 
end;
function GetEASharedRegistryKey(key: string): string;
begin
  if not RegQueryStringValue(HKEY_LOCAL_MACHINE, EASharedRegistryPath, key, Result) then
    Result := ''; 
end;
procedure SetEASharedRegistryKey(key, value: string);
begin
  RegWriteStringValue(HKEY_LOCAL_MACHINE, EASharedRegistryPath, key, value);
end;

// Returns the first writable, non-removable drive after C:
// Returns C: when no other drive found
function GetDriveType(lpRootPathName: string): Integer;
external 'GetDriveTypeW@kernel32.dll stdcall';
function GetDataDrive: string;
var
  i: Integer;
begin
  for i := Ord('D') to Ord('Z') do
    if GetDriveType(Chr(i) + ':\') = 3{DRIVE_FIXED} then
    begin
      Result := Chr(i);
      exit;
    end;
  Result := Copy(ExpandConstant('{sd}'), 1, 1);
end;

function GetDataDir({void} Param: string): string;
begin
  Result := pri_GetOverrideValue('Data');

  if Result = '' then 
    Result := GetPreviousData('Data', '');
  if Result <> '' then
    exit;

  Result := GetEASharedRegistryKey('Data');
  if Result = '' then
    Result := GetDataDrive + ':\EAData' + GetEASuffix('_');
   
   Result := Result + '\WebServer'; 
end;

function IsHTTPSCertificateComponentSelected(): boolean;
begin
  Result := true
end;

function UpdateDefaultInstallCertificate(): boolean;
var
  SSLCommand: boolean;
begin
   Result := True;
     if WizardSilent then
   begin
     SSLCommand := StrToBool(GetCommandlineParameter('SSL'));
   end
   else
     begin
       SSLCommand := StrToBool(GetPreviousData('IsHttps', 'False'));
     end;

	 if not SSLCommand then
     begin
       Result := SSLCommand;
     end;
end;

function GetAppServerUrlWithPort(AppServerUrl, BasePort: string; IsHttps: boolean): string;
begin
  Result := Format('%s:%s', [AppServerUrl, BasePort]);
end;

function ValidateModelIdInput(Sender: TWizardPage): Boolean;
begin
  Result := True;

  if Trim(ODataSettingsPage.Values[0]) = '' then
  begin
    MsgBox('Please enter a Model ID', mbError, MB_OK);
    Result := False;
  end;
end;

// ***** Config Page definition: add new config options here ******************
// ********************************


// ****************************************************************************
// IIS related helpers
// ****************************************************************************
function LoadIISConfig(section: string): variant;
var
  configFile: string;
begin
  if AppConstantInitialized then
    configFile := LogFolder
  else
    configFile := ExpandConstant('{tmp}');

  configFile := ConfigFile + '\system.applicationHost_' + section + '.config';

  Result := null;
  if ExecuteAndRedirect('{sys}\inetsrv\appcmd.exe', 'list config /section:system.applicationHost/' + section, configFile) = 0 then
    xmlLoadDocument(configFile, {out}Result);
end;

function getAppPoolIdentity(aAppPool : string): string;
var
  IISapplicationPools : variant;
  identityType: string; //ApplicationPoolIdentity, LocalSystem, SpecificUser
begin
  IISapplicationPools := LoadIISConfig('applicationPools');
  identityType := xmlGetAttribute(IISapplicationPools, 
    '/system.applicationHost/applicationPools/add[@name="' + aAppPool + '"]/processModel', 'identityType');

  if identityType = '' then
   identityType := xmlGetAttribute(IISapplicationPools, 
    '/system.applicationHost/applicationPools/applicationPoolDefaults/processModel', 'identityType');

  if identityType = '' then 
    identityType := 'ApplicationPoolIdentity';

  if identityType = 'ApplicationPoolIdentity' then
    Result := aAppPool
  else 
  if identityType = 'SpecificUser' then
    Result := xmlGetAttribute(IISapplicationPools, 
    '/system.applicationHost/applicationPools/add[@name="' + aAppPool + '"]/processModel', 'userName')
  else
    Result := '';

  Log(Format('[i]IIS info [applicationPools: %s, identityType: %s, userName: %s]', [aAppPool, identityType, Result]));
end;

function getIISSites: TStringList;
begin
  Result := xmlGetAttributes(IISConfigSites, '/system.applicationHost/sites/site', 'name');
end;

function getIISApplicationPool(): string;
begin
  // find the ApplicationPool
  Result := xmlGetAttribute(IISConfigSites, 
    '/system.applicationHost/sites' +
    '/site[@name="' + IISSite.Text + '"]' + 
    '/application[@path="' + IISVirtualPath.Text + '"]',
    'applicationPool');
    if Result = '' then
    begin
        // use default instead
        Result := xmlGetAttribute(IISConfigSites, 
          '/system.applicationHost/sites/applicationDefaults',
          'applicationPool');
    end;
end;

function GetIISPhysicalPath(site:string; path:string; isSetVirtualPathText:boolean): string;
var
  xmlQuery : string;
  Paths : TStringList;
  i: integer;
  VirtualPath : string;

begin
 
  xmlQuery := '/system.applicationHost/sites/site[@name="' + site  + '"]/application'; 
  VirtualPath := Lowercase(path);
  Paths := xmlGetAttributes(IISConfigSites, xmlQuery , 'path');
  i := Paths.IndexOf(VirtualPath);

  if i < 0 then
  begin
    Log(Format('[i]Applications in IIS: [Site: %s, Applications: %s', [site, Paths.CommaText])); 
    result := '';
    exit;
  end;

  if VirtualPath <> Paths[i] then
  begin
    VirtualPath := Paths[i];

    if isSetVirtualPathText then
    begin  
        IISVirtualPath.Text := Paths[i];
    end;

    Log('[W]Application virtual path should be lowercase only: ' + VirtualPath);
  end;

  Paths.Free;
  
  // find the physical path
  Result := xmlGetAttribute(IISConfigSites, 
    xmlQuery + '[@path="' + VirtualPath + '"]/virtualDirectory', 'physicalPath');

  // Expand environment variables when they are present.
  result := ExpandEnvVars(Result);
end;

function CheckIISPhysicalPath(IISPhysicalPath : string) : boolean;
begin
  if IISPhysicalPath = '' then
  begin
    ShowError('Website not found in IIS'#13 +
              'Site:' + IISSite.Text + ', path:' + IISVirtualPath.Text + #13 +
              'Setup can not continue!', mbError, MB_OK);
    DoAbort();
  end;
 
  Result := True;
end;

// ****************************************************************************
// ****************************************************************************

function LoadWebConfig(): boolean;
var 
  IISPhysicalPath: string;                      
begin
  IISPhysicalPath := GetIISPhysicalPath(IISSite.Text, IISVirtualPath.Text,true);
  if IISPhysicalPath = '' then
  begin
    Log(Format('[i]Previous installation not found [site:%s, path:%s]', [IISSite.Text, IISVirtualPath.Text]))
    WebClientConfig := emptyAppSettings();
    ManagementConsoleConfig := emptyAppSettings();
    Result := true;
  end
  else
  begin
    if not LoadXMLConfigFileEx(IISPhysicalPath, 'web.config', false, WebClientConfig) then
    begin
      WebClientConfig := emptyAppSettings();
      Result := true;
    end;
    if not LoadXMLConfigFileEx(IISPhysicalPath + '\admin', 'web.config', false, ManagementConsoleConfig) then
    begin
      ManagementConsoleConfig := emptyAppSettings();
      Result := true;
    end;
  end;
end;

procedure SetEnabledCertificatePage(isEnabled: boolean);
var
  i: integer;
begin

  CertificatePage.Buttons[0].Enabled := isEnabled;
  CertificatePassword.Enabled := isEnabled;

  for i := 0 to CertificatePage.ComponentCount - 1 do
  begin
    if (CertificatePage.Components[i]) is TEdit then
      TEdit(CertificatePage.Components[i]).Enabled := isEnabled;
  end;

  if isEnabled = false then
  begin
    CertificatePage.Values[0] := '';
    CertificatePassword.Text := '';
  end;

end;

procedure OnHTTPSCheckboxClick(Sender: TObject);
begin
  SetEnabledCertificatePage(CertificateCheckbox.Checked);
end;

procedure CreateConfigPages;
var
  SelectDirPage : TWizardPage;
  Site, Path: string;
  AppSetting: string;
  FirstComponentTop: integer;
  IsMandatoryCertificate: boolean;
begin
  SelectDirPage := PageFromID(wpSelectDir);
  
  // Show EASuffix when it is present
  if GetEASuffix('') <> '' then
  begin
    EASuffixLabel := TLabel.Create(SelectDirPage);
    EASuffixLabel.Left := 350;
    EASuffixLabel.Alignment := taRightJustify;
    EASuffixLabel.Top := 200;
    EASuffixLabel.AutoSize := True;
    EASuffixLabel.Caption := 'EASuffix:' + GetEASuffix(' ');
    EASuffixLabel.Parent := SelectDirPage.Surface;
  end;

  Site := GetPreviousData('Site', 'Default Web Site');
  Path := GetPreviousData('Path', '/' + LowerCase(GetEASuffix('')));

  // Add selector for IIS site to install to
  IISSite := addComboBox(SelectDirPage, 0, 100, 'Select IIS Site', getIISSites, Site);
  IISVirtualPath := addEditBox(SelectDirPage, 0, 150, 'Virtual path', Path);

  // OData service settigs
  ODataSettingsPage := CreateInputQueryPage(wpSelectComponents, 'OData service Configuration', 'Enter configuration details for the OData Service(s)', ''); 
  ODataSettingsPage.Add('Models Id''s (separate multiple models by '', '')', False); //0: Model Id's
  ODataSettingsPage.Add('OData Service User:', False); //1: User
  ODataSettingsPage.Add('OData Service password:', True); //2: Password
  ODataSettingsPage.OnNextButtonClick := @ValidateModelIdInput;

  // Create config page for web client
  WebClientConfigPage := CreateInputQueryPage(wpSelectComponents, 'Web Client Access Configuration', 'Enter configuration details for the Web Client', '');
  WebClientConfigPage.Add('Web Server Fully Qualified Domain Name:', False); //0: used for redirection
  WebClientConfigPage.Add('Application Server Fully Qualified Domain Name:', False); //1: WebServerBackendUrl
  WebClientConfigPage.Add('BasePort:', False); //2: noaport
  // RespaceQueryPage(WebClientConfigPage, -5, 0);

  // Start certificate page
  FirstComponentTop := 117;

  CertificatePage := CreateInputFilePage(WebClientConfigPage.ID, 'Security', 'Select certificates archive file and enter password', '');
  CertificatePage.Add('Certificates archive:', 'EA Certificate archive files|*.eacert', '*.eacert');
  
  CertificatePassword := addPasswordEditBox(CertificatePage, 0, FirstComponentTop + 15, 'Password:', '');
  CertificatePassword.Width := 332;
  
  IsCleanInstall := LoadWebConfig();
  IsUnsecureUpgrade := GetAppSetting(WebClientConfig,'WebServiceCertificateThumbPrint') = '';
  IsMandatoryCertificate := IsCleanInstall or IsUnsecureUpgrade;
  CertificateCheckbox := addCheckBox(CertificatePage, 0, 25, 'Install or update security certificates', IsMandatoryCertificate);
  CertificateCheckbox.Parent := CertificatePage.Surface;
  CertificateCheckbox.Width := 200;
  CertificateCheckbox.Height := 24;
  CertificateCheckbox.OnClick := @OnHTTPSCheckboxClick;
  CertificateCheckbox.TabOrder := 0;

  if IsMandatoryCertificate then
    begin 
      CertificateCheckbox.Enabled := false;
    end
  else
    begin
      SetEnabledCertificatePage(false);
    end;

  // Move the certificate controls down
  TNewStaticText(CertificatePage.Components[2]).Top := ScaleY(FirstComponentTop - 52);
  TEdit(CertificatePage.Components[3]).Top := ScaleY(FirstComponentTop - 35);
  TButton(CertificatePage.Components[4]).Top := ScaleY(FirstComponentTop - 36);
  // End certificate page

end;

function UrlRemoveProtocol(aUrl: string): string;
begin
  Result := LowerCase(aUrl);
  StringChangeEx(Result, 'http://', '', true);
  StringChangeEx(Result, 'https://', '', true);
end;

function AddProtocolUrl(aUrl: string): string;
var
  Protocol: string;
begin
    Protocol := 'http://';
    if IsHTTPSCertificateComponentSelected then
      begin
        Protocol := 'https://';
      end;
    Result := Protocol + UrlRemoveProtocol(aUrl);
end;

function AddProtocolUrlFromPreviousData(aUrl: string): string;
var
  Protocol: string;
begin
    Protocol := 'http://';
    if StrToBool(GetPreviousData('IsHttps', '')) then
      begin
        Protocol := 'https://';
      end;
    Result := Protocol + UrlRemoveProtocol(aUrl);
end;

function HostPattern(aUrl: string): string;
begin;
  Result := UrlRemoveProtocol(aUrl);
  StringChangeEx(Result, '.', '\.', true);
  Result := '^' + Result + '$';
end;

function RedirectUrl(aUrl: string): string;
begin;
  Result := UrlRemoveProtocol(aUrl);
  Result := '{C:1}://' + Result + '{HTTP_URL}';
end;

function validateUrl(aUrl: string): Boolean;
begin
  result := StartsWith(Lowercase(aUrl), 'http://') 
         or StartsWith(Lowercase(aUrl), 'https://');
end;

function GetODataModelIds(ODataPath: string): TStringList;
begin
  result := EnumerateFiles(ODataPath, '*.*', {FullPath:}false);
end;

function EmptyJsonObject(): TJsonParserOutput;
var
  JsonParser : TJsonParser;
begin
  ParseJson(JsonParser, '{}');
  result := JsonParser.Output;
end;

function ReadODataConfig(ODataPath: string; ModelId: string): TJsonParserOutput;
var
  SettingsPath : string;
  JsonString : AnsiString;
  JsonParser : TJsonParser;

begin
  SettingsPath := ODataPath + '\' + ModelId + '\bin\settings.json';

  Log('[i]Reading OData settings :' + SettingsPath);

  // read settings file
  if not LoadStringFromFile(SettingsPath, {var}jsonString) then
     jsonString := '{}';
  
  // parse settings file into ODataSettings
  ParseJson(JsonParser, jsonString);
  result := JsonParser.Output;
end;

// Get the first eacert file you can find in the same folder of the setup.exe
function GetFirstCertificateFileOnDisk: string;
var
  FindRec: TFindRec;
begin
  Result := '';

  if FindFirst(ExpandConstant(AddBackslash(ExtractFilePath(ExpandConstant('{srcexe}'))) + '*.eacert'), FindRec) then
  try
    Result := AddBackslash(ExtractFilePath(ExpandConstant('{srcexe}'))) + FindRec.Name;
  finally
    FindClose(FindRec);
  end;
end;

procedure SetUserSettingsToJson(ODataSettings: TJsonParserOutput; Key: string;DefaultValue: string);
var 
   JsonValue : string;
begin
     JsonValue := GetJsonSettingOrOverride(ODataSettings, Key,DefaultValue);
  if JsonValue    <> '' then
     SetJsonString(ODataSettings, Key, JsonValue);
end;

procedure WriteODataConfigForModel(ODataPath, ModelId, WebSite_FQDN, AppServerUrl, ODataUser, ODataPassword: string; ODataSettings: TJsonParserOutput);
var
  SettingsPath : string;
  JsonString : TStringList;
begin
  SetJsonString(ODataSettings, 'host', AppServerUrl);
  SetJsonString(ODataSettings, 'user', ODataUser);
  SetJsonString(ODataSettings, 'password', ODataPassword);
  SetJsonString(ODataSettings, 'model_id', ModelId);
  SetJsonString(ODataSettings, 'web_client_uri', WebSite_FQDN);

  SetUserSettingsToJson(ODataSettings,'angles_query','');
  SetUserSettingsToJson(ODataSettings,'timeout','');
  SetUserSettingsToJson(ODataSettings,'page_size','');
  SetUserSettingsToJson(ODataSettings,'max_angles','');
  SetUserSettingsToJson(ODataSettings,'metadata_resync_minutes','');
                    
  SettingsPath := ODataPath + '\' + ModelId + '\bin\settings.json';
  
  Log('[i]Writing OData settings');
  jsonString := JsonToStringList(ODataSettings);
  JsonString.SaveToFile(SettingsPath);  

  // Set to ***** without save
  SetJsonString(ODataSettings, 'password', '*****');
  jsonString := JsonToStringList(ODataSettings);
  Log('[i]OData settings has been written with content :' + SettingsPath + #10#13 + jsonString.Text);
end;

procedure UpdateWebClientConfig;
var
  LocalFQDN: string;
  WebSiteFQDN: string;
  WebServiceBackendUrl: string;
begin
  LocalFQDN := GetComputerName(ComputerNameDnsFullyQualified);
  WebSiteFQDN := LowerCase(GetAppSettingOrOverride(WebClientConfig, 'RedirectUrl', LocalFQDN, {skipIf}IsNewInstall));
  WebServiceBackendUrl := pri_GetOverrideValue('WebServiceBackendUrl');

  // Show config in the Gui
  WebClientConfigPage.Values[0] := UrlRemoveProtocol(WebSiteFQDN);

  if (WebServiceBackendUrl = '') then
    WebClientConfigPage.Values[1] := UrlRemoveProtocol(GetAppSettingOrOverride(WebClientConfig, 'WebServerBackendUrl', WebSiteFQDN, {skipIf}IsNewInstall))
  else
    WebClientConfigPage.Values[1] := UrlRemoveProtocol(WebServiceBackendUrl);

  WebClientConfigPage.Values[2] := GetAppSettingOrOverride(WebClientConfig, 'WebServiceBackendNOAPort', '9080', {skipIf}IsNewInstall);
end;

procedure UpdateCertificateConfig;
var
  CFolder: String;
  CPassword: String;
begin
 if IsHTTPSCertificateComponentSelected then
 begin
  if WizardSilent then
   begin
    CFolder := GetCommandlineParameter('cf');
    CPassword := GetCommandlineParameter('cp');
   end
   else
   begin
    CFolder := GetFirstCertificateFileOnDisk;
    CPassword := CertificatePassword.Text;
   end;
 end;
  CertificatePage.Values[0] := CFolder;
  CertificatePassword.Text := CPassword;
end;

procedure UpdateODataConfig;
var
  i: integer;
  IISPhysicalPath: string;
  ODataModelIdFromIniList: TStringList;
  ODataModelIdFromIni: string;
  ODataModelIds: String; 
  ODataModels : TStringList;
  ODataSettings : TJsonParserOutput;

begin
  ODataModelIds := '';
  ODataSettings := EmptyJsonObject();
  IISPhysicalPath := GetIISPhysicalPath(IISSite.Text, IISVirtualPath.Text,true);
  
  ODataModelIdFromIni := pri_GetOverrideValue('ODataModelIds'); 
  
  if IISPhysicalPath <> '' then
  begin
    // Read OData settings
    ODataModels := GetODataModelIds(IISPhysicalPath + '\OData\');
        
    // Check setup.ini, loop through values (more than one is possible)
    if (ODataModelIdFromIni <> '') then
    begin
      ODataModelIdFromIniList := TStringList.Create;
      try
        ODataModelIdFromIniList.CommaText := ODataModelIdFromIni;

        // If values does not exist already in ODataModels, then add it
        for i := 0 to ODataModelIdFromIniList.Count - 1 do
		  if ODataModels.IndexOf(ODataModelIdFromIniList[i]) = -1 then
		  ODataModels.Add(ODataModelIdFromIniList[i]);

      finally
        ODataModelIdFromIniList.Free;
      end;

    end;

    try
      if ODataModels.Count > 0 then
      begin
        ODataModelIds := ODataModels.CommaText;
        ODataSettings := ReadODataConfig(IISPhysicalPath + '\OData\', ODataModels.Strings[0]);
      end;
    finally
      ODataModels.Free;
    end;
  end
  else
    ODataModelIds := ODataModelIdFromIni;  

  // update Odata page
  ODataSettingsPage.Values[0] := ODataModelIds;
  ODataSettingsPage.Values[1] := GetJsonSettingOrOverride(ODataSettings, 'user', 'ODataService');
  ODataSettingsPage.Values[2] := GetJsonSettingOrOverride(ODataSettings, 'password', '');
end;

procedure ReadConfigFiles;
begin
  LoadWebConfig();
  UpdateWebClientConfig;
  UpdateODataConfig;
end;

procedure WriteDeployParameters(WebSite_FQDN: string);
var
  ParametersPath : string; 
  Parameters : variant;
begin
  ParametersPath := DataPath('WebDeploy');

  // Read WebClient deploy parameters
  Parameters := LoadXMLConfigFile(ParametersPath, 'EveryAngle.WebClient.Web.SetParameters.xml');
  
  // Set WebClient deploy parameters (in memory)
  setDeployParameter(Parameters, 'IIS Web Application Name', IISPathWC());

  // Set redirection rules
  if WebSite_FQDN <> '' then
  begin
    setDeployParameter(Parameters, 'Redirect_to_FQDN', 'true');
    setDeployParameter(Parameters, 'hostPattern', HostPattern(WebSite_FQDN));
    setDeployParameter(Parameters, 'redirectUrl', RedirectUrl(WebSite_FQDN));
  end
  else
    setDeployParameter(Parameters, 'Redirect_to_FQDN', 'false');

  // Enable HTTPS redirect and https-only cookies
  setDeployParameter(Parameters, 'HTTPS_Redirect', 'true')
  setDeployParameter(Parameters, 'httpCookies_requireSSL', 'true')

  // Write webclient deploy parameters
  SaveXMLConfigFile(Parameters, ParametersPath, 'EveryAngle.WebClient.Web.SetParameters.xml');
  
  // Set Management Console Deploy Parameters
  Parameters := LoadXMLConfigFile(ParametersPath, 'EveryAngle.ManagementConsole.Web.SetParameters.xml');
  setDeployParameter(Parameters, 'IIS Web Application Name', IISPathMC);
  SaveXMLConfigFile(Parameters, ParametersPath, 'EveryAngle.ManagementConsole.Web.SetParameters.xml');
end;

procedure WriteConfigFiles(IISPhysicalPath, WebSite_FQDN: string);
var 
  NewWCConfig,
  NewMCConfig: variant;
begin
  // Get the settings from the setup Gui
  setAppSetting(WebClientConfig, 'RedirectUrl', AddProtocolUrl(WebClientConfigPage.Values[0]));
  setAppSetting(WebClientConfig, 'WebServerBackendUrl', AddProtocolUrl(WebClientConfigPage.Values[1]));
  setAppSetting(WebClientConfig, 'WebServiceBackendNOAPort', WebClientConfigPage.Values[2]);
  setAppSetting(WebClientConfig, 'LogFileFolder', LogFolder);
  
  // Merge the new webclient web.config with the existing one.
  if not LoadXMLConfigFileEx(IISPhysicalPath, 'web.config', false, {out}NewWCConfig) then
  begin
    ShowError('Error loading WebClient configuration'#13 +
              IISPhysicalPath + '\web.config'#13
              'Setup can not continue!', mbError, MB_OK);
    DoAbort();
  end;

  // Update notifications feed info from the new web.config
  setAppSetting(WebClientConfig, 'NotificationsFeedDataUrl', GetAppSetting(NewWCConfig, 'NotificationsFeedDataUrl'));
  setAppSetting(WebClientConfig, 'NotificationsFeedViewAllUrl',GetAppSetting(NewWCConfig, 'NotificationsFeedViewAllUrl'));

  // Copy appSettings in GUI and old web.config to new appSettings
  WebClientConfig := MergeAppSettings(WebClientConfig, NewWCConfig);

  // Save webclient web.config
  SaveXMLConfigFile(WebClientConfig, IISPhysicalPath, 'web.config');

  // Merge the new management console webconfig with the existing one.
  if not LoadXMLConfigFileEx(IISPhysicalPath + '\admin', 'web.config', false, NewMCConfig) then
  begin
    ShowError('Error loading Management Console configuration in'#13 +
              IISPhysicalPath +'\admin\web.config'#13
              'Setup can not continue!', mbError, MB_OK);
    DoAbort();
  end;

  // Check the existence of the Angle Warnings Content Input File
  if FileExists(DataPath('Tools\Data') + '\AngleWarningsList.xlsx') then
  begin
    Log('Angle warnings input file found in Tools\Data folder.');
    // Do not log the location of file yet, that will come in later pbi
    setAppSetting(ManagementConsoleConfig, 'AngleWarningsContentInputFile', DataPath('Tools\Data') + '\AngleWarningsList.xlsx');
  end;

  ManagementConsoleConfig := MergeAppSettings(ManagementConsoleConfig, NewMCConfig);

  // Save management console web.config
  SaveXMLConfigFile(ManagementConsoleConfig, IISPhysicalPath + '\admin', 'web.config');
end;

procedure UpdateCurConfig;
begin
  // update settings if dir was changed (or first time)
  IsNewInstall := GetPreviousData('Site', 'NEW') = 'NEW';

  // Enforce correct virtual path: lowercast, start with '/' not ends with '/'
  IISVirtualPath.Text := LowerCase(IISVirtualPath.Text);
  if LastChar(IISVirtualPath.Text) = '/' then
    IISVirtualPath.Text := Copy(IISVirtualPath.Text, 0, Length(IISVirtualPath.Text) - 1);
  if FirstChar(IISVirtualPath.Text) <> '/' then
    IISVirtualPath.Text := '/' + IISVirtualPath.Text;
  
  // Read current stored settings, Update the Gui
  ReadConfigFiles;
end;

procedure UpdateFQDNConfig;
begin
  // Enforce FQDN: lowercast, not ends with '/'
  WebClientConfigPage.Values[0] := AddProtocolUrl(TrimLastSlashes(WebClientConfigPage.Values[0]));

  // Enforce Application Server Url: lowercast, not ends with '/'
  WebClientConfigPage.Values[1] := AddProtocolUrl(TrimLastSlashes(WebClientConfigPage.Values[1]));
end;

procedure RestoreFQDNConfig;
begin
  WebClientConfigPage.Values[0] := UrlRemoveProtocol(WebClientConfigPage.Values[0]);
  WebClientConfigPage.Values[1] := UrlRemoveProtocol(WebClientConfigPage.Values[1]);
end;

procedure DeployWebSite(commandName,para :string);
var
  ResultCode: Integer;
  MSDeployLocation,
  MSDeployParameters : string; 
  ExecutePath : string;
 
begin
  //Get MSDeploy path
  MSDeployLocation := ExtractFilePath(MsDeployPath);
  MSDeployParameters :=  'set "MSDeployPath=' + MSDeployLocation + '"';
  ExecutePath:= '"' + DataPath('WebDeploy') +'\' + commandName  + '" /Y /I:true ' + para;
  ExecutePath :=   MSDeployParameters +' &call ' + ExecutePath+'';
 
  log(ExecutePath);

  if ExecuteWebDeploy(ExecutePath,commandName) <> 0 then
    AbortWithError('Setup failed:' + #13#10#13#10 + 'Please check the WebDeploy.cmd.log for details.');
end;

procedure ExecuteM4ManagementConsoleDeploy();
begin
  DeployWebSite('EveryAngle.ManagementConsole.Web.deploy.cmd','');
end;

procedure ExecuteWebClientDeploy();
begin
  DeployWebSite('EveryAngle.WebClient.Web.deploy.cmd','');
end;

procedure ExecuteODataServiceDeploy(ModelId: string);
var
  IIS_Web_Application_Name : string;
  ExitCode: Integer;
begin
  IIS_Web_Application_Name := IISPathWC + '/odata/' + ModelId;

  DeployWebSite('EveryAngle.OData.Service.deploy.cmd', '"-setParam:name=''IIS Web Application Name'',value=''"' + IIS_Web_Application_Name + '''');

  ExitCode := ExecuteAndLogEx('{sys}', 'inetsrv\appcmd.exe', 'set config "' + IIS_Web_Application_Name + '" /section:windowsAuthentication /enabled:false', none);
  Log('Set Windows Authentication to false for ' + IIS_Web_Application_Name + ' executed with the code ' + IntToStr(ExitCode));
end;

procedure ExecuteWebsiteUndeploy(aSite: string);
var
  MSDeployExe,
  MSDeployLocation,       
  iisSite : string;
  MSDeployParameters : string;
  iisSitePath : TArrayOfString;
begin     
  iisSite := StringReplace(aSite, '//', '/');
  iisSitePath := StrSplit(iisSite, '/');

  if GetArrayLength(iisSitePath) = 1 then
  begin
    iisSite := iisSitePath[0];
  end;

  MSDeployExe := ExtractFileName(MsDeployPath);
  MSDeployLocation := ExtractFilePath(MsDeployPath);
  MSDeployParameters := Format('-verb:delete -dest:apphostconfig="%s" -skip:objectname=machineconfig -skip:objectname=rootwebconfig', [iisSite]);
  ExecuteAndLog(MsDeployLocation, MSDeployExe, MSDeployParameters);
end;

procedure AssignPermissionToAppPoolUser(IISPhysicalPath: string);
var 
  settings: string;
  scriptName: string;
  scriptPath: string;
  resultCode: integer;  
  thumbprint:string;
  apppoolName:string;
  webConfig : variant;
  parameters : string;

begin 

  scriptName := 'SetCertificatePermissions.ps1';
  scriptPath := ExpandConstant('{tmp}') + '\' + scriptName;
  
  ExtractTemporaryFile(scriptName);
  LoadXMLConfigFileEx(IISPhysicalPath, 'web.config', false, {out}webConfig);
  apppoolName := getIISApplicationPool()
  thumbprint :=  GetAppSetting(WebConfig,'WebServiceCertificateThumbPrint');

  parameters :=  ' -Thumbprint '  + thumbprint + ' -AppPoolName ' + apppoolName ;
  settings := '-ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -WindowStyle Hidden ';
  
  Log(Format('[i] Giving read permissions to "IIS AppPool\%s" for the certificate with thumbprint "%s"', [apppoolName, thumbprint]));
  resultCode := ExecuteAndLogPSFile(settings, scriptPath, parameters);  

  if resultCode <> 0 then
   begin
     ShowError('Deployment of the WebServer failed. The setup cannot continue!'#13
     'More information can be found in ''powershell.exe.log'' in the log directory.', mbError, MB_OK);
     DoAbort();
   end;
end;
 
function MoveCsmFiles(): boolean;
var
  DestDirPath: string;
  FindRec: TFindRec;
  IsMovable: boolean;
begin 
  DestDirPath :=  ExpandConstant('{code:DataPath|AppServerReg}'); 
  if DirExists(DestDirPath) or ForceDirectories(DestDirPath) then
  begin   
    if FindFirst(ExpandConstant('{tmp}\*'), FindRec) then begin
      try
        repeat
          // Don't count directories
          if FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY = 0 then
          begin 
            FileCopy(ExpandConstant('{tmp}\' + FindRec.Name), ExpandConstant('{code:DataPath|AppServerReg}\' + FindRec.Name), False);
          end;
        until not FindNext(FindRec);
      finally
        FindClose(FindRec);
      end;
    end;  
    Result := true; 
  end
  else
  begin
    Result := false;
  end;
end;

procedure ExtractCSMFiles();                                   
begin

  ExtractTemporaryFile('CommandLine.dll');
  ExtractTemporaryFile('EveryAngle.CSM.AppServerAPI.dll');
  ExtractTemporaryFile('EveryAngle.CSM.Client.dll');
  ExtractTemporaryFile('EveryAngle.CSM.Client.Interfaces.dll');
  ExtractTemporaryFile('EveryAngle.CSM.Reg.exe');
  ExtractTemporaryFile('EveryAngle.CSM.Reg.exe.config');
  ExtractTemporaryFile('EveryAngle.CSM.Shared.dll');
  ExtractTemporaryFile('EveryAngle.Security.dll');
  ExtractTemporaryFile('EveryAngle.Utilities.dll');
  ExtractTemporaryFile('Ionic.Zip.dll');
  ExtractTemporaryFile('Microsoft.Rest.ClientRuntime.dll');
  ExtractTemporaryFile('Newtonsoft.Json.dll');

end;

procedure ExtractOdataCSMFiles(odataFolder:string);       
var
  FindRec: TFindRec;
  IsMovable: boolean;                            
begin

  if DirExists(odataFolder) or ForceDirectories(odataFolder) then
  begin
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\CommandLine.dll'), odataFolder + '\CommandLine.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.CSM.AppServerAPI.dll'), odataFolder + '\EveryAngle.CSM.AppServerAPI.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.CSM.Client.dll'), odataFolder + '\EveryAngle.CSM.Client.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.CSM.Client.Interfaces.dll'), odataFolder + '\EveryAngle.CSM.Client.Interfaces.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.CSM.Reg.exe'), odataFolder + '\EveryAngle.CSM.Reg.exe' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.CSM.Reg.exe.config'), odataFolder + '\EveryAngle.CSM.Reg.exe.config' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.CSM.Shared.dll'), odataFolder + '\EveryAngle.CSM.Shared.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.Security.dll'), odataFolder + '\EveryAngle.Security.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\EveryAngle.Utilities.dll'), odataFolder + '\EveryAngle.Utilities.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\Ionic.Zip.dll'), odataFolder + '\Ionic.Zip.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\Microsoft.Rest.ClientRuntime.dll'), odataFolder + '\Microsoft.Rest.ClientRuntime.dll' , False);
      FileCopy(ExpandConstant('{code:DataPath|AppServerReg}\Newtonsoft.Json.dll'), odataFolder + '\Newtonsoft.Json.dll' , False);
  end; 
end;

function HandleCSMComponent(baseIISPhysicalPath,commandType, componentType,uri, modelid,executePath:string): boolean;
var
  AppVersion: string;
  MachineName: string;
  AppServerUrl: string;
  CmdParams: string;
  Thumbprint: string;
  OdataCmd: string;
  WebServerUrl: string;
  WebConfig : variant;
  SSL: boolean;

begin
  AppVersion := '{#MyAppVersion}';
  MachineName := GetComputerNameString;

   if componentType = ODATA_COMPONENT then
      begin
         OdataCmd := Format('--modelid=%s', [modelid]);
      end;

   if commandType = DEREGISTERCMD  then
    begin
       IISConfigSites := LoadIISConfig('sites'); 
       LoadXMLConfigFileEx(GetIISPhysicalPath(GetPreviousData('Site', ''),GetPreviousData('Path', ''),false), 'web.config', false, {out}WebConfig);
       SSL := StrToBool(GetPreviousData('IsHttps', ''));
       AppServerUrl := AddProtocolUrlFromPreviousData(GetAppServerUrlWithPort(GetPreviousData('AppServerUrl', ''), GetPreviousData('BasePort', ''), StrToBool(GetPreviousData('IsHttps', ''))));  
       WebServerUrl := AddProtocolUrlFromPreviousData(GetPreviousData(componentType, ''));
        
    end
   else 
    begin
        SSL:= IsHTTPSCertificateComponentSelected;
        AppServerUrl := AddProtocolUrl(GetAppServerUrlWithPort(WebClientConfigPage.Values[1], WebClientConfigPage.Values[2], IsHTTPSCertificateComponentSelected));
        LoadXMLConfigFileEx(baseIISPhysicalPath, 'web.config', false, {out}WebConfig);
    end;

                
   if SSL then
      begin
       Thumbprint :=  GetAppSetting(WebConfig,'WebServiceCertificateThumbPrint');
	     CmdParams := Format('--appserveruri=%s --action=%s --type=%s --uri=%s --version=%s --machine=%s --appserverthumbprint=%s %s', [AppServerUrl,commandType, componentType, uri, AppVersion, MachineName, Thumbprint,OdataCmd]);
      end 
   else
      begin
        CmdParams := Format('--appserveruri=%s --action=%s  --type=%s --uri=%s --version=%s --machine=%s %s', [AppServerUrl,commandType, componentType, uri, AppVersion, MachineName,OdataCmd]);
      end;
 
    Result := ExecuteAndLogEx(executePath, 'EveryAngle.CSM.Reg.exe', CmdParams, ToSetupLog) = 0;    
end;


procedure UpdateWebConfigWithSSODetails(baseIISPhysicalPath: string);
var

  scriptName: string;
  scriptPath: string;
  thumbprint: string;
  appServerUrl: string;
  appServerPort: string;
  webServerPhysicalPath: string;
  managementConsolePhysicalPath: string;
  parameters : string;
  settings: string;
  resultCode: integer;
  WebConfig : variant;

begin
  scriptName := 'SetUrlRedirectsAndAuthority.ps1';
  scriptPath := ExpandConstant('{tmp}') + '\' + scriptName;

  ExtractTemporaryFile(scriptName);
  LoadXMLConfigFileEx(baseIISPhysicalPath, 'web.config', false, {out}WebConfig);

  thumbprint :=  GetAppSetting(WebConfig,'WebServiceCertificateThumbPrint');
  appServerUrl := WebClientConfigPage.Values[1];
  appServerPort := WebClientConfigPage.Values[2];
  webServerPhysicalPath := baseIISPhysicalPath;
  managementConsolePhysicalPath := baseIISPhysicalPath + '/admin';

  parameters := ' -CertificateThumbprint "'  + thumbprint + '" -AppServerUrl "' + appServerUrl + '" -AppServerPort "' + appServerPort + '" -WebServerPhysicalPath "' + webServerPhysicalPath + '" -ManagementConsolePhysicalPath "' + managementConsolePhysicalPath + '"';

  settings := '-ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -WindowStyle Hidden ';

  Log(Format('[i] Setting redirect uri and authority uri for Web Client and IT Management Console: %s, %s, %s, %s, %s', [thumbprint, appServerUrl, appServerPort, webServerPhysicalPath, managementConsolePhysicalPath]));
  resultCode := ExecuteAndLogPSFile(settings, scriptPath, parameters);

  if resultCode <> 0 then
   begin
     ShowError('Deployment of the WebServer failed. The setup cannot continue!'#13
     'More information can be found in ''powershell.exe.log'' in the log directory.', mbError, MB_OK);
     DoAbort();
   end;
end;

function RegisterComponents(baseIISPhysicalPath:string): boolean;
var  
  ODataIds : string;
  WebServerUrl:string;
  ODataModels : TArrayOfString;
  i: integer;
 begin
    WebServerUrl := AddProtocolUrl(WebClientConfigPage.Values[0] + IISVirtualPath.Text);
    if LastChar(WebServerUrl) = '/' then
      WebServerUrl := Copy(WebServerUrl, 0, Length(WebServerUrl) - 1);
   
    Result := HandleCSMComponent(baseIISPhysicalPath,REGISTERCMD, WEBSERVER_COMPONENT  , WebServerUrl,'',DataPath('AppServerReg')) 
    if Result then
    begin
      Result := HandleCSMComponent(baseIISPhysicalPath,REGISTERCMD, ITMANAGEMENTCONSOLE_COMPONENT  , WebServerUrl +'/admin','',DataPath('AppServerReg')) 
      if IsComponentSelected('OData') then
      begin
      
        ODataIds := ODataSettingsPage.Values[0];
        StringChangeEx({var}ODataIds, ' ', '', true);
        ODataModels := StrSplit(ODataIds, ',');
        for i := 0 to Length(ODataModels) - 1 do
        begin
           if Result then
           begin
           //Extract CSM to specific odata model
           Result := HandleCSMComponent(baseIISPhysicalPath,REGISTERCMD,ODATA_COMPONENT,WebServerUrl+'/odata/'+ODataModels[i],ODataModels[i],baseIISPhysicalPath + '\odata\' +ODataModels[i]+ '\bin');
           end;
        end;
      end; 
      end;          
end;

function DeregisterOdata():boolean;        
var
  ODataIds : string;
  WebServerUrl:string;
  ODataModels : TArrayOfString;
  i: integer;
  IISPhysicalPath: string;
begin
  Result := True;
  WebServerUrl := GetPreviousData(WEBSERVER_COMPONENT, '');
  IISPhysicalPath := GetPreviousData('IISPhysicalPath', ''); 
  ODataIds := GetPreviousData(ODATA_COMPONENT, '');
  StringChangeEx({var}ODataIds, ' ', '', true);
  ODataModels := StrSplit(ODataIds, ',');
  for i := 0 to Length(ODataModels) - 1 do
  begin
    if Result then
    begin
     Result := HandleCSMComponent('',DEREGISTERCMD,ODATA_COMPONENT,WebServerUrl+'/odata/'+ODataModels[i],ODataModels[i],IISPhysicalPath +'\odata\'+ODataModels[i]+'\bin');
    end;
  end;

end;

function DeRegisterComponents(): boolean;
var 
ODataIds : string;

begin
    Result := HandleCSMComponent('',DEREGISTERCMD,WEBSERVER_COMPONENT  ,GetPreviousData(WEBSERVER_COMPONENT, ''),'',DataPath('AppServerReg'));
    if Result then
    begin
      Result := HandleCSMComponent('',DEREGISTERCMD,ITMANAGEMENTCONSOLE_COMPONENT  , GetPreviousData(ITMANAGEMENTCONSOLE_COMPONENT, ''),'',DataPath('AppServerReg'));
      ODataIds := GetPreviousData(ODATA_COMPONENT, '');
      if not (ODataIds = '') then
      begin
         if Result then
         begin
            Result := DeregisterOdata();
         end;
      end;    
    end;
end;

Procedure ExecuteWebUndeploy;
var 
  sitePath,
  directory : string;
begin
  if IISPathWC <> '' then
  begin
    IISConfigSites := LoadIISConfig('sites'); 
    sitePath := GetIISPhysicalPath(GetPreviousData('Site', ''),GetPreviousData('Path', ''), false)
    directory := ExtractFileName(sitePath);
    // if in wwwroot directory; skip this process
    if directory <> 'wwwroot' then
    begin   
      ExecuteWebsiteUndeploy(IISPathMC);
      ExecuteWebsiteUndeploy(IISPathWC);
    end
    else
    begin
      log('[i]msgbox: Files will not be removed during uninstall because the Webserver is installed in the wwwroot. The uninstall will proceed but the files and the IIS application need to be removed manually.');
      if not UninstallSilent then
        Msgbox('Files will not be removed during uninstall because the Webserver is installed in the wwwroot. The uninstall will proceed but the files and the IIS application need to be removed manually.', mbInformation, MB_OK);
    end;
  end;
end;

// ***** After install functions ***************************************************

procedure InstallCertificate(IISPhysicalPath: string);
var
  Source: string;
  Target: string;
  ExitCode: Integer;
begin
  Source := CertificatePage.Values[0];
  if (IsHTTPSCertificateComponentSelected = true) and (Source <> '') and (CertificatePassword.Text <> '') then
  begin
    Target := Format('%s\%s', [IISPhysicalPath, ExtractFileName(Source)]);
    if not FileCopy(Source, Target, False) then
    begin
        Log(Format('Can not copy HTTPS certificate file from: %s -> %s', [Source, Target]));
    end
    else
    begin
      ExitCode := ExecuteAndLogEx(DataPath('Tools'), 'EveryAngle.CustomerCertificates.Installer.console.exe', Format('-a -i %s -p %s -f %s', [Target, CertificatePassword.Text, IISPhysicalPath]), ToSetupLog);
      Log('EveryAngle.CustomerCertificates.Installer.console.exe exited with code ' + IntToStr(ExitCode));
		  if ExitCode <> 0 then
		  begin
			if WizardForm.Visible then
			begin
			  ShowError(Format('Error during installing HTTPS certificate (exit code %d): Installation interrupted.' + #13#10 + #13#10 + 'Please check CustomerCertificates.Installer.console log for details', [ExitCode]), mbCriticalError, MB_OK)
			  WizardForm.Close;
			end
			else
			begin
			  Log(Format('ERROR!: Error during installing HTTPS certificate (exit code %d).', [ExitCode]));
			end;
		  end
		  else
			begin
				//only grant the permission to apppool user when the installation of the certificate success
				AssignPermissionToAppPoolUser(IISPhysicalPath);
			end;
		end;

      if not DeleteFile(Target) then
      begin
          Log(Format('Can not delete HTTPS certificate file in: %s', [Target]));
      end;
    end;
  
end;

procedure UpgradeEnvironment(IISPhysicalPath: string);
begin
  // Spr89 -> Spr90: override.config no longer used, rename to override_config.old
  RenameFile(IISPhysicalPath + '\override.config', IISPhysicalPath + '\override_config.old');
  InstallCertificate(IISPhysicalPath);
end;

procedure DeployDiagramFiles(IISPhysicalPath: string);
var
  ZipFile,
  SourceFolder,
  TargetFile,
  TargetFolder : string;
  CopySuccess : boolean;
  i : integer;
begin
  ZipFile := ExpandConstant('{src}\Diagrams.zip');
  TargetFolder := IISPhysicalPath + '\Resources\CreateNewAngleBySchema\';

  if FileExists(ZipFile) then
  begin
     // Unzip diagrams.zip in same folder as setup.exe to targetFolder
    Log('[i]Using Diagrams.zip');
    ExecuteAndLogEx(DataPath('WebDeploy'), '7za.exe', 'x -y "-o' + TargetFolder + '" "' + ZipFile + '"', ToSetupLog);
  end
  else
  begin
    Log('[i]Using Diagrams from this setup');
    SourceFolder := DataPath('WebDeploy\Diagrams\');

    // Make sure the target images directory exists
    CreateDir(TargetFolder + 'Images\');

    // Copy *.ini files + images
    for i := 0 to DiagramFiles.Count - 1 do
    begin
      TargetFile := DiagramFiles[i];

      // Determine target file: replace source folder with target folder in the registered file path
      StringChangeEx(TargetFile, SourceFolder, TargetFolder, {SupportDBCS:}true); 

      // Make sure the target directory exists
      CreateDir(ExtractFilePath(TargetFile));

      // Copy the Diagram file, overwrite an existing files
      CopySuccess := FileCopy(DiagramFiles[i], TargetFile, {FailIfExists:} false);

      Log(Format('[i]Copy Diagram File [Source: "%s", target: "%s", success: "%s"]"',[DiagramFiles[i], TargetFile, BoolToStr(CopySuccess)]));
    end;
  end;
end;

procedure InstallMovies(IISPhysicalPath: string);
var
  Source,
  Target: string;
begin
  Source := ExpandConstant('{src}');
  Target := IISPhysicalPath + '\Resources\Movies\';
  CreateDir(Target);
  Target := Target + '\en';
  CreateDir(Target);
  Log('[i]Installing movies');
  if FileExists(Source + '\movies.zip') then
    ExecuteAndLogEx(DataPath('WebDeploy'), '7za.exe', 'x -y "-o' + Target + '" "' + Source + '\movies.zip"', ToSetupLog);
  CopyFiles(Source, Target, '*.mp4'); 
  CopyFiles(Source, Target, '*.jpg'); 
end;

procedure InstallSAPLauncher(IISPhysicalPath: string);
var
  Source,
  Target: string;
begin
  Source := ExpandConstant('{src}\EveryAngle.GoToSAP.Launcher\');
  Target := IISPhysicalPath + '\bin\EveryAngle.GoToSAP.Launcher\';
  CreateDir(Target);
  Log('[i]Installing SAP launcher');
  CopyFiles(Source, Target, '*.*'); 
end;

procedure GrantAppPoolIdentity();
var 
  applicationPool,
  userName : string;
begin
  applicationPool := getIISApplicationPool();
  userName := getAppPoolIdentity(applicationPool);

  if userName <> '' then
    //Set the modify access to the folder, subfolders, and files.
    ExecuteAndLogEx('{sys}', 'icacls.exe', '"{code:DataPath|Log}" /grant:r ' + userName + ':(OI)(CI)(M) /T', ToSetupLog)
  else
    Log(Format('[w]: getAppPoolIdentity: No identity found [appPool: %s, userName: %s]', [applicationPool, userName])); 
end;

procedure WriteOdataWebConfig(odataPath,modelName: string);
var 
  ODataWebConfig,
  NewOdataConfig: variant;
  
begin
 
  // Open Odata web.config
	if not LoadXMLConfigFileEx(odataPath, 'web.config', false, ODataWebConfig) then
	begin
		ODataWebConfig := emptyAppSettings();
	end;

  // Set LogFileFolder in Odata web.Config
	setAppSetting(ODataWebConfig, 'LogFileFolder', LogFolder + '\odata\' + modelName);

	// Merge the new odata web.config with the existing one.
	if not LoadXMLConfigFileEx(odataPath, 'web.config', false, NewOdataConfig) then
	begin
	ShowError('Error loading OData configuration'#13 +
		  odataPath + '\web.config'#13
		  'Setup can not continue!', mbError, MB_OK);
	DoAbort();
	end;

	// Copy appSettings in old web.config to new appSettings
	ODataWebConfig := MergeAppSettings(ODataWebConfig, NewOdataConfig);

  // Save odata config
  SaveXMLConfigFile(ODataWebConfig, odataPath, 'web.config');
end;

// Run MSDeploy for Odata
procedure ODataAfterInstall(IISPhysicalPath, WebSite_FQDN: string);
var 
  msg1,
  ODataPath,
  ODataIds,
  AppServerUrl,
  WebServerUrl,
  ODataUser,
  ODataPassword :String;
  ODataConfig : TJsonParserOutput;
  ODataModels : TArrayOfString;
  ODataWebConfig,
  NewODataWebConfig: variant;
  ExitCode: Integer;
  i: integer;
begin
  msg1 := 'Installing / Updating Web OData Service(s) in IIS';
  InitProgress(msg1, 'Start');

  // Deploy OData service package
  ShowProgressAndText(10, msg1, 'Running MSDeploy for OData service');

  ODataIds := ODataSettingsPage.Values[0];
  StringChangeEx({var}ODataIds, ' ', '', true);
  ODataModels := StrSplit(ODataIds, ',');

  ODataUser := ODataSettingsPage.Values[1];
  ODataPassword := ODataSettingsPage.Values[2];

  ODataPath := IISPhysicalPath + '\OData';
  AppServerUrl := AddProtocolUrl(GetAppServerUrlWithPort(WebClientConfigPage.Values[1], WebClientConfigPage.Values[2], false));
  WebServerUrl := AddProtocolUrl(WebSite_FQDN + IISVirtualPath.Text);
  
  ExitCode := ExecuteAndLogEx('{sys}', 'inetsrv\appcmd.exe', 'unlock config -section:windowsAuthentication', none);
  Log('Unlock Windows Authentication config executed with the code ' + IntToStr(ExitCode));

// TODO: Progress updates

  for i := 0 to Length(ODataModels) - 1 do
  begin
    // Deploy OData service package
    ShowProgressAndText((90 / Length(ODataModels)) * (i+1), msg1, 'Running MSDeploy for OData service: ' + ODataModels[i]);

    // Read json settings before upgrade/install
    ODataConfig := ReadODataConfig(ODataPath, ODataModels[i]);   

    // Deploy OData Service using MSDeploy
    ExecuteODataServiceDeploy(ODataModels[i]);

    ExtractOdataCSMFiles(ODataPath + '\' +ODataModels[i] + '\bin'); 
    
    // Write updated json settings
    WriteODataConfigForModel(ODataPath, ODataModels[i], WebServerUrl, AppServerUrl, ODataUser, ODataPassword, ODataConfig); 
	
	  WriteOdataWebConfig(ODataPath + '\' +ODataModels[i] ,ODataModels[i]);
	
	
  end;

  HideProgress();
end;
   
// Run MSDeploy for the Web Client and Management Console
// Returns the physical path of the deployed website
function WebClientAfterInstall(WebSite_FQDN: string): string;
var 
  msg1 : string;
  IISPhysicalPath : string;
  AppServerUrl : string;
begin
  msg1 := 'Installing / Updating Web Client in IIS';
  InitProgress(msg1, 'Start');

  // Write Deploy parameters
  ShowProgressAndText(5, msg1, 'Saving Deploy parameters');
  WriteDeployParameters(WebSite_FQDN);

  // Deploy the Web Client package
  ShowProgressAndText(30, msg1, 'Running MSDeploy for Web Client');
  ExecuteWebClientDeploy();
  
  // Deploy the Management Console package 
  ShowProgressAndText(50, msg1, 'Running MSDeploy for Management Console');
  ExecuteM4ManagementConsoleDeploy(); 

  // Reload IIS config to reflect changes after deploy
  IISConfigSites := LoadIISConfig('sites'); 

  // Update IIS Physical path to what it is now, after the web-deploy has taken place
  IISPhysicalPath := GetIISPhysicalPath(IISSite.Text, IISVirtualPath.Text, true);

  // Make sure this path is now known
  CheckIISPhysicalPath(IISPhysicalPath);
 
  // Deploy the Diagram files (StandardContent)
  ShowProgressAndText(70, msg1, 'Installing diagram definitions');
  DeployDiagramFiles(IISPhysicalPath);

  // Unzip movies
  ShowProgressAndText(80, msg1, 'Installing {#coTrainingMovies}');
  if MoviesSelected then
    InstallMovies(IISPhysicalPath);

  // Copy SAP launcher
  InstallSAPLauncher(IISPhysicalPath);

  // Update the config files
  ShowProgressAndText(85, msg1, 'Updating config files');
  WriteConfigFiles(IISPhysicalPath, WebSite_FQDN);

  //As discussed reorder this step to install cert first and then register
  //Upgrade environment
  ShowProgressAndText(88, msg1, 'Updating Environment');
  UpgradeEnvironment(IISPhysicalPath);

  if IsComponentSelected('OData') then
  begin
        ODataAfterInstall(IISPhysicalPath, WebSite_FQDN);
  end;
  
  //Register to CSM after register the cert as discuss
  if not RegisterComponents(IISPhysicalPath)  then 
  begin
      AppServerUrl := AddProtocolUrl(GetAppServerUrlWithPort(WebClientConfigPage.Values[1], WebClientConfigPage.Values[2], IsHTTPSCertificateComponentSelected));
      ShowError(Format('The Web Server failed to register on the AppServer(%s)',[AppServerUrl]), mbError, MB_OK);
  end;

  // Upgrade environment
  ShowProgressAndText(90, msg1, 'Granting access to appPoolIdentity');
  GrantAppPoolIdentity();

  ShowProgressAndText(95, msg1, 'Setting redirect uri and authority');
  UpdateWebConfigWithSSODetails(IISPhysicalPath);

  HideProgress();

  result := IISPhysicalPath;
end;

// ***** Inno setup event handlers ***************************************************
function InitializeSetup(): Boolean;
// Called during Setup's initialization. Return False to abort Setup, True otherwise.
begin
  AppConstantInitialized := false;

  if  WizardSilent then
    log( '[i]Running in "(very)silent" mode');

  if not CheckForAdmin then
  begin
    ShowError('Current user has no administrator privileges,'#13
              'setup can not continue!', mbError, MB_OK);
    result := false;
  end
  else if not IsDotNetDetected('v4.5', 0) then 
  begin
    ShowError(ExpandConstant('{#MyAppName} requires Microsoft .NET Framework 4.5.'#13#13
                          'Please use Windows Update to install this version,'#13
                          'and then re-run the {#MyAppName} setup program.'), mbInformation, MB_OK);
    result := false;
  end
  else
    result := true;

  // Load IIS sites configuration
  IISConfigSites := LoadIISConfig('sites');  
end;

procedure InitMoviesComponent();
var
  i: integer;
  MoviesPresent: Boolean;
begin
  // set movies component based on precense of movies;
  MoviesPresent := FileExists(ExpandConstant('{src}\Movies.zip')) 
                or filePatternExists('{src}', '*.mp4');
  i := ComponentIndex('{#coTrainingMovies}');
  WizardForm.ComponentsList.checked[i] := MoviesPresent;
  WizardForm.ComponentsList.ItemEnabled[i] := MoviesPresent;

  Log('[i]MoviesPresent: ' + BoolToStr(MoviesPresent));
end;

procedure InitializeWizard();
// Use this event function to make changes to the wizard or wizard pages at startup. You can't use the InitializeSetup event 
// function for this since at the time it is triggered, the wizard form does not yet exist.
begin
  log('[i]AppId=' + getAppId(''));
  
  // Uncheck codesite component when newer or current vesion present
  if CodeSiteVersionIsCurrent('{#CodeSiteVersion}') then
    WizardForm.ComponentsList.checked[ComponentIndex('CodeSite logging')] := False;
  
  // Set movies component based on the presence of movie files
  InitMoviesComponent();
    
  // Create pages for config settings
  CreateConfigPages();

  // Initialize stringlist to keep track of diagram files so they can be copied after the package is deployed
  DiagramFiles := TstringList.Create;
end;

function ShouldSkipPage(PageID: Integer): Boolean;
// The wizard calls this event function to determine whether or not a particular page (specified by PageID) should be shown at all. 
// If you return True, the page will be skipped; if you return False, the page may be shown.
// Note: This event function isn't called for the wpWelcome, wpPreparing, and wpInstalling pages, nor for pages that Setup has already 
// determined should be skipped (for example, wpSelectComponents in an install containing no components).
begin
  if (PageID = WebClientConfigPage.ID) then
    Result := not IsComponentSelected('WebClient')
  else if (PageID = ODataSettingsPage.ID) then
    Result := not IsComponentSelected('OData')
  else if (PageID = CertificatePage.ID) then 
    Result := not IsHTTPSCertificateComponentSelected
  else 
    Result := False;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  // Called after a new wizard page (specified by CurPageID) is shown.
  
  // Initialize webclient config page
  if (CurPageID = WebClientConfigPage.ID) then
  begin
    RestoreFQDNConfig;
  end;

  // Initialize certificate page
  if (CurPageID = CertificatePage.ID) then
  begin
    UpdateCertificateConfig;
  end;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
// Called when the user clicks the Next button. If you return True, the wizard will move to the next page; if you return False, it will remain on the current page (specified by CurPageID).
// Note that this function is called on silent installs as well, even though there is no Next button that the user can click.
// Setup instead simulates "clicks" on the Next button. On a silent install, if your NextButtonClick function returns False prior to installation starting, Setup will exit automatically.
begin
  Result := True;

  // Update config when leaving 'select dir' page
  if CurPageID = wpSelectDir then
  begin
    AppConstantInitialized := True;
    UpdateCurConfig;
  end
  else if CurPageId = WebClientConfigPage.ID then
  begin
    if WebClientConfigPage.Values[2] = '' then
    begin
      ShowError('Baseport is required', mbError, MB_OK);
      Result := False;    
    end;
  end
  else if CurPageId = CertificatePage.ID then
  begin
      if CertificateCheckbox.Checked then
      begin
        if not FileExists(CertificatePage.Values[0]) then 
        begin
          ShowError('No valid file has been selected.', mbError, MB_OK);
          Result := False;
        end
        else if CertificatePassword.Text = '' then
        begin
          ShowError('No password is provided.', mbError, MB_OK);
          Result := False;
        end
      end
  end
end;


procedure CurStepChanged(CurStep: TSetupStep);
// You can use this event function to perform your own pre-install and post-install tasks.
// Called with CurStep=ssInstall just before the actual installation starts, with CurStep=ssPostInstall just after the actual installation finishes,
// and with CurStep=ssDone just before Setup terminates after a successful install.
var
  IISPhysicalPath,
  WebSite_FQDN : string;
begin

  if (CurStep = ssPostInstall) then
  begin   
      WebSite_FQDN := LowerCase(WebClientConfigPage.Values[0]);

      IISPhysicalPath := WebClientAfterInstall(WebSite_FQDN {, IISVirtualPath});

    

      if (IsComponentSelected('codesite')) then
        CodeSiteAfterInstall(DataPath('Setup')); 
  end;
end;



procedure RegisterExtraCloseApplicationsResources;
begin
  // To register extra files which Setup should check for being in-use if CloseApplications
  // is set to yes, place a RegisterExtraCloseApplicationsResources event function in the
  // Pascal script and call RegisterExtraCloseApplicationsResource inside it, once per file.
  if IsComponentSelected('CodeSite') then
    RegisterCloseCodeSiteFiles;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
// You can use this event function to detect and install missing prerequisites and/or to shutdown any application which is about to be updated.
// Return a non empty string to instruct Setup to stop at the Preparing to Install wizard page, showing the returned string as the error message. 
// Set NeedsRestart to True if a restart is needed. This function is only called if Setup didn't already determine it can't continue because one or
// more files specified in the [Files] and [InstallDelete] sections were queued (by some other installation) to be replaced or deleted on the next restart.
// This event function is called before Setup checks for files being in-use if CloseApplications is set to yes.
begin
  // uncheck movies. Copying is done in code. Target folder is only known after installation.
  MoviesSelected := WizardForm.ComponentsList.checked[ComponentIndex('{#coTrainingMovies}')];
  WizardForm.ComponentsList.checked[ComponentIndex('{#coTrainingMovies}')] := False;
end;

procedure RegisterPreviousData(PreviousDataKey: Integer);
// To store user settings entered on custom wizard pages, place a RegisterPreviousData event function in the Pascal script and call 
// SetPreviousData(PreviousDataKey, ...) inside it, once per setting.
var WebServerUrl:string;
begin
  WebServerUrl := AddProtocolUrl(WebClientConfigPage.Values[0] + IISVirtualPath.Text);
    if LastChar(WebServerUrl) = '/' then
      WebServerUrl := Copy(WebServerUrl, 0, Length(WebServerUrl) - 1);

  SetPreviousData(PreviousDataKey, 'EASuffix', GetEASuffix(''));
  SetPreviousData(PreviousDataKey, 'Data', DataPath(''));
  SetPreviousData(PreviousDataKey, 'Site', IISSite.Text);
  SetPreviousData(PreviousDataKey, 'Path', IISVirtualPath.Text);
  SetPreviousData(PreviousDataKey, 'WebServerUrl', WebClientConfigPage.Values[0]);
  SetPreviousData(PreviousDataKey, 'AppServerUrl', WebClientConfigPage.Values[1]);
  SetPreviousData(PreviousDataKey, 'BasePort', WebClientConfigPage.Values[2]);
  SetPreviousData(PreviousDataKey, 'IsHttps', BoolToStr(IsHTTPSCertificateComponentSelected));
  SetPreviousData(PreviousDataKey, WEBSERVER_COMPONENT, WebServerUrl);
  SetPreviousData(PreviousDataKey, ITMANAGEMENTCONSOLE_COMPONENT, WebServerUrl + '/admin');
  SetPreviousData(PreviousDataKey, 'IISPhysicalPath', GetIISPhysicalPath(IISSite.Text, IISVirtualPath.Text, true));
 
   if IsComponentSelected('OData') then
      begin
        SetPreviousData(PreviousDataKey, ODATA_COMPONENT, ODataSettingsPage.Values[0]);
      end;

  // TODO: if new installation AND datapath.endswith 'WebClient', Shared datapath is datapath - 'WebClient'
  // SetEASharedRegistryKey('Data', DataPath(''));
end;


// If Setup finds the UpdateReadyMemo event function in the Pascal script, it is called automatically when the Ready to Install wizard page becomes
// the active page. It should return the text to be displayed in the settings memo on the Ready to Install wizard page as a single string with
// lines separated by the NewLine parameter. Parameter Space contains a string with spaces. Setup uses this string to indent settings.
// The other parameters contain the (possibly empty) strings that Setup would have used as the setting sections. The MemoDirInfo parameter
// for example contains the string for the Selected Directory section.
function UpdateReadyMemo(Space, NewLine, MemoUserInfoInfo, MemoDirInfo, MemoTypeInfo, MemoComponentsInfo, MemoGroupInfo, MemoTasksInfo: String): String;
var
  Settings: string;
begin
  Settings := 'Selected parameters:' + NewLine;
  if GetEASuffix('') <> '' then
    Settings := Settings + Space + 'EASuffix: ' + GetEASuffix('') + NewLine;

  if not ShouldSkipPage(WebClientConfigPage.ID) then
    AddPageSettings(WebClientConfigPage, Space, NewLine, {var}Settings);

  if CertificateCheckbox.Checked then
  begin
    Settings := Settings + Space + 'Certificate file: ' + CertificatePage.Values[0] + NewLine;
    Settings := Settings + Space + 'Certificate password: *********' + NewLine;
  end;

  if not ShouldSkipPage(ODataSettingsPage.ID) then
    AddPageSettings(ODataSettingsPage, Space, NewLine, {var}Settings);

  Result := 'Selected locations:' + NewLine +
            Space + 'Data: ' + DataPath('') + NewLine + NewLine +
            MemoComponentsInfo + NewLine + NewLine +
            Settings + NewLine;
end;

// Return a non zero number to instruct Setup to return a custom exit code.
// This function is only called if Setup was successfully run to completion and the exit code would have been 0.
// Also see Setup Exit Codes.
function GetCustomSetupExitCode: Integer;
begin
  result := {custom_pages.}CustomExitCode;
end;

// Called just before Setup terminates. Note that this function is called even if the user exits Setup before anything is installed.
procedure DeinitializeSetup();
var
  logfilepathname, logfilename, newfilepathname: string;

begin
  if AppConstantInitialized then
  begin
    logfilepathname := expandconstant('{log}');
    logfilename := ExtractFileName(logfilepathname);
    newfilepathname := LogFolder + '\' + logfilename;
    filecopy(logfilepathname, newfilepathname, {failIfExists=}false)
  end
  else
    Log('[i]Installation directory not known. Skip copying log file.');
end; 

// ----------------------------------------------------------------------------
// Uninstall handling  
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then
  begin 

    if DeRegisterComponents()  then 
   
    begin
      ExecuteWebUndeploy; 
	  
    end
    else
    begin
      log('[E]msgbox: WebServer cannot be deregistered, uninstallation failed.');
      if not UninstallSilent then
	    MsgBox('WebServer cannot be deregistered, uninstallation failed.', mbError, MB_OK);
      Abort;
    end;

  end;
end;   