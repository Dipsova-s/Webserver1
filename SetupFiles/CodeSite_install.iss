[Code]

function CodeSiteDispatcherPath(Param: String): string;
begin
  if not RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SOFTWARE\Wow6432Node\Raize\CodeSite\5.0', 'DisPatcher', Result) then
    Result := '';
end;

function CodeSiteInstalled: boolean;
begin
  Result := FileExists(CodeSiteDispatcherPath(''));
end;

function CodeSiteVersion: string;
begin
  if not GetVersionNumbersString(CodeSiteDispatcherPath(''),{var} Result) then
    Result := '0.0.0.0';
end;

procedure RegisterCloseCodeSiteFiles;
var
  CodeSitePath : string;
begin
  if CodeSiteInstalled then
  begin
    CodeSitePath := ExtractFilePath(CodeSiteDispatcherPath(''));
    RegisterExtraCloseApplicationsResource(True, CodeSitePath + 'CSDispatcher.exe');
    RegisterExtraCloseApplicationsResource(True, CodeSitePath + 'CSController.exe');
    RegisterExtraCloseApplicationsResource(True, CodeSitePath + 'CSFileViewer.exe');
    RegisterExtraCloseApplicationsResource(True, CodeSitePath + 'CSLiveViewer.exe');
  end;
end;

function CodeSiteVersionIsCurrent(aVersion: string): bool;
begin
  // True when the currently installed version is same or newer than what this setup contains
  Result := CodeSiteVersion >= aVersion;
  Log(Format('[i]CodeSite: InstalledVersion: %s, SetupVersion: %s, CodeSiteCurrent: %s', [CodeSiteVersion, aVersion, BoolToStr(Result)])); 
end;

// Install CodeSite and register dispatcher service
procedure CodeSiteAfterInstall(SetupLocation: string);
var
  Path, 
  ServiceName,
  Msg1 : string;
begin
  msg1 := 'Installing CodeSite';
  InitProgress(msg1, 'Start');

  // Stop and remove existing service
  ShowProgressAndText(1, msg1, 'Deleting dispatcher service');
  ServiceName := 'CodeSiteDispatcher';
  EADeleteService(ServiceName);

  // Run codesite installer
  ShowProgressAndText(25, msg1, 'Running setup');
  ExecuteAndLog(SetupLocation, 'CS5_Tools.exe', '/s /m=CodeSiteToolsSetup.txt');

  // Register codesite as a service  and start this service
  ShowProgressAndText(75, msg1, 'Installing dispatcher service');
  Path := CodeSiteDispatcherPath('');
  if Path <> '' then
    EAInstallService(ServiceName, 'CodeSite Dispatcher', 'CodeSite Log Dispatcher Service', Path);

  HideProgress();
end;