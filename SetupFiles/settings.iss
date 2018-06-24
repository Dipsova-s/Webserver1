[code]
//
// Provides support for automatically deal with settings from the EA Build server
// 
// usage:
// put the following lines into your iss file:
// 
// #include "settings.iss"
// PRIVATE
var pri_CheckedAppDir : AnsiString;

function pri_GetSParam(aName: string): String;
// scans the setup.exe cmdline for '/S:<Value>=<data>', returns <data>.
var 
  i : integer;
  v : string;
  p : string;
begin
  v := '/S:'+aName+'=';
  for i:= 0 to ParamCount do
  begin
    p := ParamStr(i);
    if (CompareText(v,Copy(p,0,Length(v)))=0) then
    begin
      Result:=RemoveQuotes(Copy(p,Length(v)+1, Length(p)));
      log(format('[i]var: "%s:=%s" (Command Line)', [aName, Result]));
      exit;
    end;
  end;
end;

function pri_GetOverrideValue(aName: string): String;
// checks cmdline or EASetup.ini for override of <Value>, returns <data> if so.
begin
  // returns any overriden values (either via cmd line or EASetup.ini)
  Result := pri_GetSParam(aName);
  if (not IsUninstaller) and (Result = '') then
  begin
    Result := GetIniString('Paths', aName, '', AddBackslash(ExtractFilePath(ExpandConstant('{srcexe}'))) + 'EASetup.ini');
    if Result <> '' then
    begin
      if (Pos('password', LowerCase(aName)) > 0) then
        log(format('[i]var: "%s:=*************" (EASetup.ini)', [aName]))
      else
        log(format('[i]var: "%s:=%s" (EASetup.ini)', [aName, Result])); 
    end
  end;
end;

function pri_AddNameValueNode(var aXmlConfigFile: Variant; const aPath, aNodeName, aKeyName, aKey, aValueName, aValue: string): boolean;
var
  NewNode,
  XmlNode :Variant;
begin
  try
    XmlNode := aXmlConfigFile.selectSingleNode(aPath);
    NewNode := aXmlConfigFile.CreateNode(1, aNodeName, '');
    NewNode.setAttribute(aKeyName, aKey);
    NewNode.setAttribute(aValueName, aValue);
    XmlNode.appendChild(NewNode);
    log(format('[i]AddNameValueNode: "%s/%s" @%s:=%s, @%s:=%s', [aPath, aNodeName, aKeyName, aKey, aValueName, aValue]));
    result := true;
  except
    log(format('[E]AddNameValueNode failed: "%s/%s" @%s:=%s, @%s:=%s', [aPath, aNodeName, aKeyName, aKey, aValueName, aValue]));
    result := false;
  end;
end;

// PUBLIC

function getParameter(const aName: string): string;
begin
  result := pri_GetOverrideValue(aName);
end;

function GetOverrideValueOrDefault(aName, aDefault: string): string;
begin
  Result := pri_GetOverrideValue(aName);
  if Result = '' then
  begin
    Result := aDefault;
    log(format('[i]var: %s:=%s (default)', [aName, Result]))
  end;
end;

function TranslateIniKey(aKey: string): string;
begin
  if StartsWith(aKey, 'ModServer') and EndsWith(aKey, 'Dir') then
    Result := Copy(aKey, 10, length(aKey) - 12)
  else
    Result := aKey
end;

// Handle IniFile settings
function GetIniSettingOrOverride(const aIniFile, aSection, aKey, aDefault: string): string;
begin
  // returns current key, unless overriden
  Result := pri_GetOverrideValue(aKey);
  if Result = '' then
  begin
    Result := GetIniString(aSection, TranslateIniKey(aKey), '', aIniFile);
    if Result <> '' then
      log(format('[i]var: %s:=%s (%s)', [aKey, Result, aIniFile]))
    else
    begin
      Result := aDefault;
      log(format('[i]var: %s:=%s (default)', [aKey, Result]))
    end;
  end;
end;

function SetIniSetting(const aSection, aKey, aValue, aIniFile: string): boolean;
begin
  Result := SetIniString(aSection, aKey, aValue, aIniFile);
  if Result then
    log(format('[i]Written: %s:=%s (%s)', [aKey, aValue, aIniFile]))
  else
    log(format('[E]Failed: %s:=%s (%s)', [aKey, aValue, aIniFile]))
end;

// Handle general AppSettings
function GetAppSetting(const aXmlConfigFile: Variant; const aKey: string): string;
begin
  Result := xmlGetAttribute(aXmlConfigFile, '/configuration/appSettings/add[@key="' + aKey + '"]', 'value');
end;

function GetAppSettingOrOverride(const aXmlConfigFile: Variant; aKey: string; aDefault: string; SkipConfigFile: boolean): string;
begin
  // returns current key, unless overriden
  Result := pri_GetOverrideValue(aKey);
  if Result = '' then
  begin
    if not SkipConfigFile then
      Result := GetAppSetting(aXmlConfigFile, aKey);
    if Result <> '' then
	  
		if (Pos('password', LowerCase(aKey)) > 0) then 
			log(format('[i]var: %s:=************* (AppSettings)', [aKey]))
		else
			log(format('[i]var: %s:=%s (AppSettings)', [aKey, Result]))
	  
    else
      begin
        Result := aDefault;
        log(format('[i]var: %s:=%s (Default)', [aKey, Result]))
      end;
  end;
end;

function SetAppSetting(var aXmlConfigFile: Variant; const aKey, aValue: string): boolean;
begin
  result := xmlSetAttribute(aXmlConfigFile, '/configuration/appSettings/add[@key="' + aKey + '"]', 'value', aValue);
  if not result then
    result := pri_AddNameValueNode(aXmlConfigFile, '/configuration/appSettings', 'add', 'key', aKey, 'value', aValue);
end;

procedure SetConnectionString(var aXmlConfigFile: Variant; aName, aConnectionString: String);
begin
  xmlSetAttribute(aXmlConfigFile, '/configuration/connectionStrings/add[@name="' + aName + '"]', 'connectionString', aConnectionString);
end;

function MergeAppSettings(aOldXmlConfigDoc, aNewXmlConfigDoc: variant): variant;
var
  OldNodeList,
  OldNode: variant;
  i: integer;
  k, vOld, vNew: string;
begin
  try
    Result := xmlCopyDocument(aNewXmlConfigDoc);
    OldNodeList := aOldXmlConfigDoc.SelectNodes('/configuration/appSettings/add');
    for i := 0 to OldNodeList.length -1 do
    begin
      OldNode := OldNodeList.item[i];
      k := OldNode.GetAttribute('key');
      vOld:= OldNode.GetAttribute('value');
      vNew:= GetAppSetting(Result, k);
      if vOld <> vNew then
        SetAppSetting(Result, k, vOld)
    end;
    
  except
    log('[E]MergeAppSettings failed:' +  GetExceptionMessage);
  end;
end;

function MergeConfigFile(aOldXmlConfigFile, aNewXmlConfigFile: string): boolean;
var
  OldXmlConfigDoc, 
  NewXmlConfigDoc,
  MergedXmlConfigDoc: variant;
begin
  Result := false;
  log(format('[i]Mergeing "%s" to "%s"', [aOldXmlConfigFile, aNewXmlConfigFile]));

  if not xmlLoadDocument(aOldXmlConfigFile, {out}OldXmlConfigDoc) then
  begin
    log('[E]MergeConfigFile failed loading old file: "' + aOldXmlConfigFile + '"');
    exit;
  end;

  if not xmlLoadDocument(aNewXmlConfigFile, {out}NewXmlConfigDoc) then 
  begin
    log('[E]MergeConfigFile failed loading new file: "' + NewXmlConfigDoc + '"');
    exit;
  end;
                         
  MergedXmlConfigDoc :=  MergeAppSettings(OldXmlConfigDoc, NewXmlConfigDoc);
  if not xmlSaveDocument(MergedXmlConfigDoc, aNewXmlConfigFile) then
  begin
    log('[E]MergeConfigFile failed saving merged file: "' + NewXmlConfigDoc + '"');
    exit;
  end;

  log(format('[i]Merged "%s" to "%s"', [aOldXmlConfigFile, aNewXmlConfigFile]));

  Result := true;
end;

function GetDeployParameter(const aXmlConfigFile: Variant; aKey: string): string;
begin
   Result := xmlGetAttribute(aXmlConfigFile, '/parameters/setParameter[@name="' + aKey + '"]', 'value');
end;

//Handle WebDeploy parameters
function GetDeployParameterOrOverride(const aXmlConfigFile: Variant; aKey: string; aDefault: string; SkipConfigFile: boolean): string;
begin
  // returns current key, unless overriden
  Result := pri_GetOverrideValue(aKey);
  if Result = '' then
  begin
    if not SkipConfigFile then 
      Result := GetDeployParameter(aXmlConfigFile, aKey);
    if Result <> '' then
      log(format('[i]var: %s:=%s (DeployParameters)', [aKey, Result]))
    else
      begin
        Result := aDefault;
        log(format('[i]var: %s:=%s (Default)', [aKey, Result]))
      end;
  end;
end;

function SetDeployParameter(var aXmlConfigFile: Variant; const aKey, aValue: string): boolean;
begin
  result := xmlSetAttribute(aXmlConfigFile, '/parameters/setParameter[@name="' + aKey + '"]', 'value', aValue);
  if not result then
    result := pri_AddNameValueNode(aXmlConfigFile, '/parameters', 'setParameter', 'name', aKey, 'value', aValue);
end;

// Supporting functions
function emptyAppSettings: Variant;
begin
  try
    Result := xmlNewDocument();
    Result.loadXML('<configuration><appSettings></appSettings></configuration>');
  except
    log('[E]emptyAppSettings failed: ' + GetExceptionMessage);
  end;
end;

       
function LoadXMLConfigFileEx(aConfigFilePath, aConfigFileName: string; FromSetupWhenNotFound: boolean; var aConfigFile: Variant): boolean;
// Loads XML based config file, and returns XmlDocument 
var
  cf: AnsiString;
begin
  // Load either existing config, or config from setup
  cf := AddBackslash(ExpandConstant(aConfigFilePath)) + aConfigFileName;
  if (not FileExists(cf))
  and (not IsUninstaller)
  and FromSetupWhenNotFound then
  begin
    log('[i]file not found, Extracting from setup: ' + cf);
    cf := ExpandConstant('{tmp}\') + aConfigFileName;
    ExtractTemporaryFile(aConfigFileName);
  end;
  Result := xmlLoadDocument(cf, {out}aConfigFile);
end;

function LoadXMLConfigFile(aConfigFilePath, aConfigFileName: string): Variant;
begin
  LoadXMLConfigFileEx(aConfigFilePath, aConfigFileName, true, {out}Result);
end;

procedure SaveXMLConfigFile(const aXmlDocument: variant; aConfigFilePath, aConfigFileName: string);
// Saves XML based config file, based on aContent
var
  cf: AnsiString;
begin
  cf := AddBackslash(ExpandConstant(aConfigFilePath)) + aConfigFileName;
  log('[i]writing config to: ' + cf);
  xmlSaveDocument(aXmlDocument, cf);
end;

function ConfigNeedsReloading: boolean;
// if true, then settings-dir was changed (or first time)
begin
  result := pri_CheckedAppDir <> ExpandConstant('{app}');
  pri_CheckedAppDir := ExpandConstant('{app}');
end;
