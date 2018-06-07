[code]
// Include file for InnoSetup to provide XML functions 

function xmlNewDocument: Variant;
begin
  Result := CreateOleObject('Msxml2.DOMDocument.6.0');
  Result.async := False;
end;

function xmlLoadDocument(const aFileName: string; out aXmlDocument: Variant): boolean;
begin
  result := false;
  try
    aXMLDocument := xmlNewDocument;
    aXMLDocument.load(AFileName);
    if (aXMLDocument.parseError.errorCode <> 0) then
      log('[E]Parsing xml failed for file "' + aFileName + '": ' + aXMLDocument.parseError.reason)
    else
    begin
      aXMLDocument.setProperty('SelectionLanguage', 'XPath');
      log('[i]loaded xml file "' + aFileName + '"');
      result := true;
    end;
  except
    log('[E]Loading xml failed for file "' + aFileName + '": ' + GetExceptionMessage);
  end;
end;

function xmlSaveDocument(const aXmlDocument: variant; const aFileName: string): boolean;
begin
  try
    aXMLDocument.save(aFileName);
    result := true;
    log('[i]saved xml file "' + aFileName + '"');
    result := true;
  except
    log('[E]Saving xml failed for file "' + aFileName + '": ' + GetExceptionMessage);
    result := false;
  end;
end;

function xmlCopyDocument(aXmlDocument: Variant): variant;
begin
  try
    Result := xmlNewDocument;
    Result.load(aXmlDocument);
  except
    log('[E]xmlCopyDocument failed: ' + GetExceptionMessage);
  end;
end;

function xmlGetNode(const aXmlDocument: Variant; aPath: string): variant;
begin
  try
    Result := aXMLDocument.selectSingleNode(aPath);
  except
    log('[E]xmlGetNode failed: "' + aPath + '": ' + GetExceptionMessage);
    result := '';
  end;
end;

function xmlGetNodeText(const aXmlDocument: Variant; aPath: string): string;
var
  XMLNode: Variant;
begin
  try
    XMLNode := aXMLDocument.selectSingleNode(aPath);
    Result := XMLNode.text;
  except
    log('[E]xmlGetNodeText failed: "' + aPath + '": ' + GetExceptionMessage);
    result := '';
  end;
end;

function xmlSetNodeText(var aXmlDocument: Variant; aPath, aValue: string): boolean;
var
  XMLNode: Variant;
begin
  try
    XMLNode := aXMLDocument.selectSingleNode(aPath);
    XMLNode.text := aValue;
    Result := true;
  except
    log('[E]xmlSetNodeText failed: "' + aPath + ':=' +  aValue + '": ' + GetExceptionMessage);
    result := false;
  end;
end;

function xmlGetAttribute(const aXmlDocument: Variant; aPath, aAttribute: string): string;
var
  value,
  XMLNode: Variant;
begin
  try
    result := '';
    XMLNode := aXMLDocument.selectSingleNode(aPath);
    value := XMLNode.GetAttribute(aAttribute);
    if not VarIsNull(value) then
      result := value;
  except
    // log('[E]xmlGetAttribute failed: "' + aPath + '@' +  aAttribute + '": ' + GetExceptionMessage);
  end;
end;

function xmlSetAttribute(var aXmlDocument: Variant; aPath, aAttribute, aValue: string): boolean;
var
  XMLNode: Variant;
begin
  try
    XMLNode := aXMLDocument.selectSingleNode(aPath);
    XMLNode.SetAttribute(aAttribute, aValue);
    log('[i]xmlSetAttribute: "' + aPath + '@' +  aAttribute + ':=' + aValue + '"');
    result := true;
  except
    result := false;
  end;
end;

function xmlGetAttributes(const aXmlDocument: Variant; aPath, aAttribute: string): TStringList;
var
  XMLNodes: Variant;
  i: integer;
begin
  try
    // Get all nodes that contain the attribute specified
    XMLNodes := aXMLDocument.SelectNodes(aPath + '[@' + aAttribute + ']');

    Result := TstringList.Create;

    for i := 0 to XMLNodes.Length - 1 do
      Result.Add(XMLNodes.Item[i].GetAttribute(aAttribute));
  except
    log('[E]xmlGetAttributeArray failed: "' + aPath + '@' +  aAttribute + '": ' + GetExceptionMessage);
  end;
end;
