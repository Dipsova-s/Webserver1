[code]
//
// Provides a general toolkit
// 
// usage:
// put the following lines into your iss file:
// 
// #include "tools.iss"
const
  CRLF = #13#10;

type
  LogDestinations = (none, ToFile, ToFileAppend, ToSetupLog);

procedure MoveToSetupLog(aLogFile: string);
var
  LogLines: TstringList;
  i : Integer;
begin
  LogLines := TstringList.Create;
  try
    LogLines.LoadFromFile(aLogFile);
    for i := 0 to LogLines.Count - 1 do
      Log('[i]con: ' + LogLines[i]);
    DeleteFile(aLogFile);
  except
    log('[W]Error reading logfile: "' + aLogFile + '":' + CRLF + GetExceptionMessage);
  finally
    LogLines.Free;
  end;
end;

function ShowError(const Text: String; const Typ: TMsgBoxType; const Buttons: Integer): Integer;
begin
  Result := 1;
  log('[E]msgbox: ' + Text);
  if not  WizardSilent then
    Result := MsgBox(Text, Typ, Buttons);
end;

// ****************************************************************************
// String functions
// ****************************************************************************

function FirstChar(s: string): string;
begin
  Result := Copy(trim(s), 1, 1);
end;

function LastChar(s: string): string;
begin
  Result := Trim(s);
  Result := Copy(Result, Length(Result), 1);
end;

function StartsWith(aString, aText: string): Boolean;
begin
  Result := Copy(aString, 0, Length(aText)) = aText;
end;

function EndsWith(aString, aText: string): Boolean;
begin
  Result := Copy(aString, Length(aString) - (Length(aText)-1), 9999) = aText;
end;

function NameOnly(s: string): string;
begin
  Result := Copy(s, 1, Pos('.', s) -1);
end;

function BoolToStr(aBool: Boolean): string;
begin
  if aBool then
    Result := 'true'
  else
    Result := 'false';
end;

function StrToBool(aString: string): Boolean;
begin
  Result := LowerCase(aString) = 'true';
end;

function StrSplit(Text: String; Separator: String): TArrayOfString;
var
  i, p: Integer;
  Dest: TArrayOfString; 
begin
  i := 0;
  repeat
    SetArrayLength(Dest, i+1);
    p := Pos(Separator,Text);
    if p > 0 then begin
      Dest[i] := Copy(Text, 1, p-1);
      Text := Copy(Text, p + Length(Separator), Length(Text));
      i := i + 1;
    end else begin
      Dest[i] := Text;
      Text := '';
    end;
  until Length(Text)=0;
  Result := Dest
end;

function TrimLastSlashes(s: string): string;
var sLength: Integer;
begin
  Result := s;
  sLength := Length(Result);

  // not only '/' then remove the last slash e.g. http://xxx.com/ -> http://xxx.com
  if (sLength > 0) and (LastChar(Result) = '/') then
  begin
    Result := Copy(Result, 0, sLength - 1);
    Result := TrimLastSlashes(Result);
  end;
end;

// ****************************************************************************
// Windows support functions
// ****************************************************************************

function Private_ExecuteWithLog(aCommand, aStartInDir, aLogFile: string; aAppend: boolean; var aResultMessage: string): integer;
var
  Command,
  Redirection: string;
  ResultCode: integer;
begin
  Command := ExpandConstant(aCommand);
  
  try
    if aAppend then 
    begin
      redirection := ' >> '
      SaveStringToFile(aLogFile, Format('----- %s cmd.exe /C "%s"', [GetDateTimeString('yyyy/mm/dd hh:nn:ss', '/', ':'), Command]), true);
    end
    else 
      redirection := ' > ';
    
    Command := Command + redirection + '"' + aLogFile + '" 2>&1'   

    Log('[i]Executing: ' + Command);
    Exec('cmd.exe', '/C "' + Command + '"', aStartInDir, SW_HIDE, ewWaitUntilTerminated, ResultCode);
    aResultMessage := 'Ok';
  except
    aResultMessage := 'Execution error: ' + GetExceptionMessage;
    if ResultCode = 0 then 
      ResultCode := 999;
  end;
  Result := ResultCode;

  log(format('[i]Execution finished [%d] %s', [ResultCode, aResultMessage]))
end;

function ExecuteAndRedirect(aCommand, aParameters, aOutputFile: string): integer;
var
  ResultMessage,
  CommandLine: string;
begin
  CommandLine := '"' + aCommand + '" ' + aParameters;

  Result := Private_ExecuteWithLog(CommandLine, '', aOutputFile, {aAppend=}false, {out}ResultMessage);
end;

function ExecuteAndLogEx(aPath, aCommand, aParameters: string; LogDestination: LogDestinations): integer;
var
  ResultMessage,
  CommandLine, LogFile: string;
begin
  CommandLine := '"' +aPath + '\' + aCommand + '" ' + aParameters;

  case LogDestination of
    ToFile,
    ToFileAppend: LogFile := ExpandConstant(LogFolder) + '\' + aCommand + '.log';
    ToSetupLog: LogFile := ExpandConstant(LogFolder) + '\' + aCommand + '.$$$';
  else
    LogFile := 'nul';
  end;
  
   //Execute command.
  Result := Private_ExecuteWithLog(CommandLine,  ExpandConstant(aPath), LogFile, {aAppend=}(LogDestination=ToFileAppend), {out}ResultMessage);
  // Add console output to setup log if requested.
  if LogDestination = ToSetupLog then
    MoveToSetupLog(LogFile);
end;

function ExecuteAndLog(aPath, aCommand, aParameters : string): integer;
begin
  Result := ExecuteAndLogEx(aPath, aCommand, aParameters, ToFile);
end;

function ExecuteWebDeploy(command,logname: string): integer;
var
  LogFile: string;
  ErrorMessage: string;
  ResultCode: integer;
begin
  LogFile := ExpandConstant(LogFolder) + '\' + logname + '.log';
 
  try
    command := command + ' > ' + '"' + LogFile + '" 2>&1';   

    Log('[i]Executing: ' + command);
    Exec('cmd.exe', '/C "' + command + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    ErrorMessage := 'Ok';
  except
    ErrorMessage := 'Execution error: ' + GetExceptionMessage;
    if ResultCode = 0 then 
      ResultCode := 999;
  end;
  Result := ResultCode;
  log(format('[i]Execution finished [%d] %s', [ResultCode, ErrorMessage]))
end;


function CheckForAdmin(): Boolean;
begin
  log('[i]started by user: ' + GetUserNameString);
  log('[i]started on host: ' + GetComputerNameString);
  log('[i]IsAdminLoggedOn: ' + BoolToStr(IsAdminLoggedOn) + ', IsPowerUserLoggedOn: ' + BoolToStr(IsPowerUserLoggedOn));
  Result := IsAdminLoggedOn; 
end;

function FilePatternExists(source, pattern: string): Boolean;
var
  FindRec: TFindRec;
begin
  result := FindFirst(ExpandConstant(source + '\' + pattern), FindRec);
  if result then
    FindClose(FindRec);
end;

function EnumerateFindRecs(Path, Pattern: string; FullPath, Directories: boolean): TStringList;
var
  Entry : string;
  FindRec: TFindRec;
  DirectoryAttr : integer;
begin
  Path := AddBackslash(ExpandConstant(Path));
  if Directories then
     DirectoryAttr :=  FILE_ATTRIBUTE_DIRECTORY
  else
     DirectoryAttr := 0;

  result := TStringList.Create();

  if FindFirst(Path + Pattern, FindRec) then 
  begin
    try
      repeat
        if (FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY = DirectoryAttr)
        and (FindRec.Name <> '.')
        and (FindRec.Name <> '..') then
        begin
          
          if FullPath then
            Entry := Path + Entry
          else
            Entry := FindRec.Name;

          result.Add(Entry);
        end;
      until not FindNext(FindRec);
    finally
      FindClose(FindRec);
    end;
  end;
end;

function EnumerateFiles(Path, Pattern: string; FullPath: Boolean): TStringList;
begin
  result := EnumerateFindRecs(Path, Pattern, FullPath, true);
end;

function EnumerateDirectories(Path, Pattern: string; FullPath: Boolean): TStringList;
begin
  result := EnumerateFindRecs(Path, Pattern, FullPath, false);
end;

procedure CopyFiles(source, target, pattern: string);
var
  sFile, tFile : string;
  FindRec: TFindRec;
begin
  if FindFirst(ExpandConstant(source + '\' + pattern), FindRec) then begin
    try
      repeat
        if FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY = 0 then
        begin
          sFile := ExpandConstant(source + '\' + FindRec.Name);
          tFile := ExpandConstant(target + '\' + FindRec.Name);
          if FileCopy(sFile, tFile, false) then
            Log('[I]Copied "' + sFile + '" to "' + tFile + '"')
          else
            Log('[W]Copy failed for "' + sFile + '" to "' + tFile + '"');
        end;
      until not FindNext(FindRec);
    finally
      FindClose(FindRec);
    end;
  end;
end;

function IsDotNetDetected(version: string; service: cardinal): boolean;
// Indicates whether the specified version and service pack of the .NET Framework is installed.
//
// version -- Specify one of these strings for the required .NET Framework version:
//    'v1.1'          .NET Framework 1.1
//    'v2.0'          .NET Framework 2.0
//    'v3.0'          .NET Framework 3.0
//    'v3.5'          .NET Framework 3.5
//    'v4\Client'     .NET Framework 4.0 Client Profile
//    'v4\Full'       .NET Framework 4.0 Full Installation
//    'v4.5'          .NET Framework 4.5
//    'v4.5.1'        .NET Framework 4.5.1
//    'v4.5.2'        .NET Framework 4.5.2
//    'v4.6'          .NET Framework 4.6
//    'v4.6.1'        .NET Framework 4.6.1
//    'v4.6.2'        .NET Framework 4.6.2
//    'v4.7'          .NET Framework 4.7
//
// service -- Specify any non-negative integer for the required service pack level:
//    0               No service packs required
//    1, 2, etc.      Service pack 1, 2, etc. required
//
// HMulder: taken from http://www.kynosarges.de/DotNetVersion.html
var
    key, versionKey: string;
    install, release, serviceCount, versionRelease: cardinal;
    success: boolean;
begin
    versionKey := version;
    versionRelease := 0;

    // .NET 1.1 and 2.0 embed release number in version key
    if version = 'v1.1' then begin
        versionKey := 'v1.1.4322';
    end else if version = 'v2.0' then begin
        versionKey := 'v2.0.50727';
    end

    // .NET 4.5 and newer install as update to .NET 4.0 Full
    else if Pos('v4.', version) = 1 then begin
        versionKey := 'v4\Full';
        case version of
          'v4.5':   versionRelease := 378389;
          'v4.5.1': versionRelease := 378675; // 378758 on Windows 8 and older
          'v4.5.2': versionRelease := 379893;
          'v4.6':   versionRelease := 393295; // 393297 on Windows 8.1 and older
          'v4.6.1': versionRelease := 394254; // 394271 before Win10 November Update
          'v4.6.2': versionRelease := 394802; // 394806 before Win10 Anniversary Update
          'v4.7':   versionRelease := 460798; // 460805 before Win10 Creators Update
        end;
    end;

    // installation key group for all .NET versions
    key := 'SOFTWARE\Microsoft\NET Framework Setup\NDP\' + versionKey;

    // .NET 3.0 uses value InstallSuccess in subkey Setup
    if Pos('v3.0', version) = 1 then begin
        success := RegQueryDWordValue(HKLM, key + '\Setup', 'InstallSuccess', install);
    end else begin
        success := RegQueryDWordValue(HKLM, key, 'Install', install);
    end;

    // .NET 4.0 and newer use value Servicing instead of SP
    if Pos('v4', version) = 1 then begin
        success := success and RegQueryDWordValue(HKLM, key, 'Servicing', serviceCount);
    end else begin
        success := success and RegQueryDWordValue(HKLM, key, 'SP', serviceCount);
    end;

    // .NET 4.5 and newer use additional value Release
    if versionRelease > 0 then begin
        success := success and RegQueryDWordValue(HKLM, key, 'Release', release);
        success := success and (release >= versionRelease);
    end;

    result := success and (install = 1) and (serviceCount >= service);
end;

type
  TComputerNameFormat = (
    ComputerNameNetBIOS,
    ComputerNameDnsHostname,
    ComputerNameDnsDomain,
    ComputerNameDnsFullyQualified,
    ComputerNamePhysicalNetBIOS,
    ComputerNamePhysicalDnsHostname,
    ComputerNamePhysicalDnsDomain,
    ComputerNamePhysicalDnsFullyQualified,
    ComputerNameMax
  );

const
  ERROR_MORE_DATA = 234;

#ifdef UNICODE
  #define AW "W"
#else
  #define AW "A"
#endif

function GetComputerNameEx(NameType: TComputerNameFormat; lpBuffer: string; var nSize: DWORD): BOOL;
  external 'GetComputerNameEx{#AW}@kernel32.dll stdcall';

// Usage example: ComputerName := GetComputerName(ComputerNameDnsFullyQualified);
function GetComputerName(Format: TComputerNameFormat): string;
var
  BufLen: DWORD;
begin
  Result := '';
  BufLen := 0;
  if not Boolean(GetComputerNameEx(Format, '', {out}BufLen)) and (DLLGetLastError = ERROR_MORE_DATA) then
  begin
    SetLength(Result, BufLen);
    if GetComputerNameEx(Format, Result, BufLen) then
      SetLength(Result, BufLen)
    else
      Result := '';
  end;
  
end;

function ExpandEnvironmentStrings(lpSrc: String; lpDst: String; nSize: DWORD): DWORD;
external 'ExpandEnvironmentStringsW@kernel32.dll stdcall';

function ExpandEnvVars(const Input: String): String;
var
  Buf: String;
  BufSize: DWORD;
begin
  BufSize := ExpandEnvironmentStrings(Input, #0, 0);
  if BufSize > 0 then
  begin
    SetLength(Buf, BufSize);  // The internal representation is probably +1 (0-termination)
    if ExpandEnvironmentStrings(Input, Buf, BufSize) = 0 then
      RaiseException(Format('Expanding env. strings failed. %s', [SysErrorMessage(DLLGetLastError)]));
    Result := Copy(Buf, 1, BufSize - 1);
  end
  else
    RaiseException(Format('Expanding env. strings failed. %s', [SysErrorMessage(DLLGetLastError)]));
end;  

function CheckPrerequisites(version: string) : boolean;
begin
  if  WizardSilent then
    log( '[i]Running in "(very)silent" mode');

  if not CheckForAdmin then
  begin
    ShowError('Current user has no administrator privileges,'#13
              'setup can not continue!', mbError, MB_OK);
    result := false;
  end
  else if not IsDotNetDetected(version, 0) then 
  begin
    ShowError(ExpandConstant('{#MyAppName} requires Microsoft .NET Framework ' + version + '.'#13#13
                          'Please use Windows Update to install this version,'#13
                          'and then re-run the {#MyAppName} setup program.'), mbInformation, MB_OK);
    result := false;
  end
  else
    result := true;
end;

// ****************************************************************************
// Windows Services support functions
// ****************************************************************************

#include "services_unicode.iss"

function EADeleteService(aServiceName: string): boolean;
begin
  result := true;
  try
    if ServiceExists(aServiceName) then
    begin
      log('[i]EADeleteService: "' + aServiceName + '"');
      SimpleStopService(aServiceName, {Wait=}true, {IgnoreStopped=}true);
      SimpleDeleteService(aServiceName);
    end;
  except
    log('[E]EADeleteService: "' + aServiceName + '" Failed!');
    ShowError(GetExceptionMessage, mbError, MB_OK);
    result := false;
  end;
end;

function EAStopService(aService: string): boolean;
begin
  result := true;
  try
    if ServiceExists(aService) then
    begin
      log('[i]StopService: "' + aService + '"');
      SimpleStopService(aService, {Wait=}true, {IgnoreStopped=}true);
    end;
  except
    log('[E]StopService: Stopping "' + aService + '" Failed!');
    ShowError(GetExceptionMessage, mbError, MB_OK);
    result := false;
  end;
end;

procedure EAInstallService(aServiceName, aDisplayName, aDescription, aExec: string);
var 
  mng,
  svc : longword;
begin
  log('[i](Re)Installing Service: ' + aDisplayName + ' (' + aServiceName + ' ['+ aExec +'])');

  EADeleteService(aServiceName);

  mng := OpenSCManager( '', '', STANDARD_RIGHTS_REQUIRED + SC_MANAGER_CONNECT + SC_MANAGER_CREATE_SERVICE);
  if (mng <> 0) then
  begin
    log('[i]Creating Service: ' + aServiceName);
    svc := CreateService( mng, aServiceName, aDisplayName,
            SC_MANAGER_ALL_ACCESS, SERVICE_WIN32_OWN_PROCESS, SERVICE_AUTO_START, SERVICE_ERROR_NORMAL,
            aExec, '', 0, '', '','');
  
    if (svc <> 0) then
    begin
      SimpleChangeServiceDescription(aServiceName, aDescription); 
      log('[i]Starting Service: ' + aServiceName);
      StartService(svc, 0, '');
    end;
  end;
end;

// ****************************************************************************
// ADO Database support functions
// ****************************************************************************

const
  adCmdUnspecified = $FFFFFFFF;
  adCmdUnknown = $00000008;
  adCmdText = $00000001;
  adCmdTable = $00000002;
  adCmdStoredProc = $00000004;
  adCmdFile = $00000100;
  adCmdTableDirect = $00000200;
  adOptionUnspecified = $FFFFFFFF;
  adAsyncExecute = $00000010;
  adAsyncFetch = $00000020;
  adAsyncFetchNonBlocking = $00000040;
  adExecuteNoRecords = $00000080;
  adExecuteStream = $00000400;
  adExecuteRecord = $00000800;

function OpenADODBConnection(aDataSource, aDatabaseName, aUserID, aPassword: string; out aADODBConnection: Variant): boolean;
var
  ConStr : string;
begin
  //Build the connection string
  ConStr := 
    'Provider=SQLOLEDB' + 
    ';MultipleActiveResultSets=True' +
    ';Data Source=' + aDataSource;
  if (aUserId <> '') then
    ConStr := ConStr + format(';User Id=''%s'';Password=''XXXXXXXX''', [aUserId])
  else
    ConStr := ConStr + ';Integrated Security=SSPI';
  if aDatabaseName <> '' then
    ConStr := ConStr + format(';Initial Catalog=''%s''', [aDatabaseName]);

  try
    // create the ADO connection object
    log('[i]Opening DB connection: ' + ConStr);
    StringChangeEx(ConStr, 'XXXXXXXX', aPassword, true);
    aADODBConnection := CreateOleObject('ADODB.Connection');
    aADODBConnection.ConnectionString := ConStr;
    aADODBConnection.Open;
    Result := True;
  except
    log('[E]Opening DB connection failed:');
    ShowError(GetExceptionMessage, mbError, MB_OK);
    Result := false;
  end;
end;

procedure DBExecute(aADOCommand: Variant; aCommandText: string);
begin
  aADOCommand.CommandText := aCommandText;
  aADOCommand.Execute(NULL, NULL, adCmdText or adExecuteNoRecords);
end;

function ExecuteSQLScript(ADOCommand: variant; SQLScriptFile: string; Params: TArrayOfString): Boolean;
var
  LstFull,
  LstPart: TStringList;
  i, j, go: integer;
  len: integer;
  t: string;

begin
  Result := False;
  log(format('[i]Running SQLscript: "%s"', [SQLScriptFile]));

  if not FileExists(SQLScriptFile) then
  begin
    log(format('[E]File not found: "%s"', [SQLScriptFile]));
    exit;
  end;

  LstFull := TStringList.Create; 
  LstPart := TStringList.Create; 
  LstFull.LoadFromFile(SQLScriptFile);

  // Replace parameters in file
  if GetArrayLength(Params) > 0 then
  begin
    t := LstFull.Text;       
    for j := 0 to GetArrayLength(Params) - 1 do
       StringChangeEx(t, Format('@PARAM%d', [i]), Params[i], true);
    LstFull.Text := t;       
  end;

  try
    go := 0;
    // create the ADO command object
    len := LstFull.Count;
    log(format('[i]Executing SQL: %d lines', [len]));

    for i := 0 to len - 1 do
    begin
      if (UpperCase(Trim(LstFull[i])) = 'GO') then
      begin
        if (LstPart.Count > 0) then
        begin
          // Execute partial SQL Script
          DBExecute(ADOCommand, LstPart.Text);
          LstPart.Clear;
          go := go + 1;
        end;
      end
      else
        LstPart.Add(LstFull[i]);

      // Log Progress every 10 percent
      if i mod (len div 10) = 0 then
        log(format('[i]Executing SQL: Line %d (%d%%)', [i, (i * 100) div len]));    
    end;
  except
    log('[E]Error in last SQL command: ' + LstPart.Text);
    ShowError(GetExceptionMessage, mbError, MB_OK);
    exit;
  end;

  log(format('[i]Executed SQL: %d GO''s', [go]));

  Result := true;
end;

// ****************************************************************************
// Base64 Encode/Decode
// From: http://www.vincenzo.net/isxkb/index.php?title=Encode/Decode_Base64
// ****************************************************************************

const
  Codes64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function Encode64(S: AnsiString): AnsiString;
var
	i: Integer;
	a: Integer;
	x: Integer;
	b: Integer;
begin
	Result := '';
	a := 0;
	b := 0;
	for i := 1 to Length(s) do
	begin
		x := Ord(s[i]);
		b := b * 256 + x;
		a := a + 8;
		while (a >= 6) do
		begin
			a := a - 6;
			x := b div (1 shl a);
			b := b mod (1 shl a);
			Result := Result + copy(Codes64,x + 1,1);
		end;
	end;
	if a > 0 then
	begin
		x := b shl (6 - a);
		Result := Result + copy(Codes64,x + 1,1);
	end;
	a := Length(Result) mod 4;
	if a = 2 then
		Result := Result + '=='
	else if a = 3 then
		Result := Result + '=';
end;

function Decode64(S: AnsiString): AnsiString;
var
	i: Integer;
	a: Integer;
	x: Integer;
	b: Integer;
begin
	Result := '';
	a := 0;
	b := 0;
	for i := 1 to Length(s) do
	begin
		x := Pos(s[i], codes64) - 1;
		if x >= 0 then
		begin
			b := b * 64 + x;
			a := a + 6;
			if a >= 8 then
			begin
				a := a - 8;
				x := b shr a;
				b := b mod (1 shl a);
				x := x mod 256;
				Result := Result + chr(x);
			end;
		end
	else
		Exit; // finish at unknown
	end;
end;

function GetLastError: Cardinal; external 'GetLastError@kernel32.dll stdcall';

// Source of FileCopyLogged
// https://stackoverflow.com/questions/39535942/inno-setup-filecopy-failing
function FileCopyLogged(ExistingFile, NewFile: String; FailIfExists: Boolean): Boolean;
var
  Error: Cardinal;
begin
  Result := FileCopy(ExistingFile, NewFile, FailIfExists);

  if not Result then
  begin
    Error := GetLastError;
    Log(
      Format(
        'Copying "%s" to "%s" failed with code %d (0x%x) - %s', [
        ExistingFile, NewFile, Error, Error, SysErrorMessage(Error)]));
  end
    else
  begin
    Log(Format('Copying "%s" to "%s" succeeded', [ExistingFile, NewFile]));
  end;
end;

// Source of DirectoryCopy:
// https://stackoverflow.com/questions/33391915/inno-setup-copy-folder-subfolders-and-files-recursively-in-code-section
procedure DirectoryCopy(SourcePath, DestPath: string);
var
  FindRec: TFindRec;
  SourceFilePath: string;
  DestFilePath: string;
begin
  if FindFirst(SourcePath + '\*', FindRec) then
  begin
    try
      repeat
        if (FindRec.Name <> '.') and (FindRec.Name <> '..') then
        begin
          SourceFilePath := SourcePath + '\' + FindRec.Name;
          DestFilePath := DestPath + '\' + FindRec.Name;
          if FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY = 0 then
          begin
            FileCopyLogged(SourceFilePath, DestFilePath, False)
          end
          else
          begin
            if DirExists(DestFilePath) or CreateDir(DestFilePath) then
            begin
              Log(Format('Created %s', [DestFilePath]));
              DirectoryCopy(SourceFilePath, DestFilePath);
            end
            else
            begin
              Log(Format('Failed to create %s', [DestFilePath]));
            end;
          end;
        end;
      until not FindNext(FindRec);
    finally
      FindClose(FindRec);
    end;
  end
  else
  begin
    Log(Format('Failed to list %s', [SourcePath]));
  end;
end;