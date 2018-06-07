[code]
// ***** Custom Progress page ***************************************************
var
  ProgressPage: TOutputProgressWizardPage;

Procedure ShowProgressAndText(progress: integer; msg1, msg2: string);
begin
  log(format('[i]Progress: "%s", "%s"', [msg1, msg2]));
  ProgressPage.SetText(msg1, msg2);
  ProgressPage.SetProgress(progress, 100);
end;

Procedure ShowProgress(progress: integer);
begin
  ProgressPage.SetProgress(progress, 100);
end;

Procedure InitProgress(msg1, msg2: string);
begin
  // Create (hidden) progress page to show progress when needed.
  if not Assigned(ProgressPage) then  
    ProgressPage := CreateOutputProgressPage('Every Angle installation','');

  ShowProgressAndText(0, msg1, msg2);
  ProgressPage.Show
end;

Procedure HideProgress;
begin
  ProgressPage.Hide
end;

Procedure DoAbort;
begin
  Log('[E]DoAbort');
  HideProgress;
  Abort;
end;

procedure AbortWithError(const Text: String);
begin
  {Tools.}ShowError(Text, mbError, MB_OK);
  DoAbort;
end;

// **** Routines for collection the settings on the different pages

// Returns the text of the selected option on a TInputOptionWizardPage
function SelectedOption(Page: TInputOptionWizardPage) : string;
begin
  Result := Page.CheckListBox.ItemCaption[Page.SelectedValueIndex];
end;

procedure AddPageOption(Page: TInputOptionWizardPage;Caption, Space, NewLine: string; var Settings: string);
begin
  Settings := Settings + Space + Caption + ': ' + SelectedOption(Page) + NewLine;
end;

// List all settings on a TInputQueryWizardPage
function ListSettings(Page: TInputQueryWizardPage; Space, NewLine: string): string;
var
 NrOfEdits,
 i : integer;
 Value : string;
begin
  Result := '';
  NrOfEdits := (Page.ComponentCount - 2) div 2;
  for i := 0 to NrOfEdits - 1 do
  begin
    if page.Edits[i].Password then
      Value := '********'
    else
      Value := page.Values[i];
    Result := Result + Format('%s%s %s%s', [Space, page.PromptLabels[i].Caption, Value, NewLine]);
  end;
  log(Result);
end;

procedure AddPageSettings(Page: TInputQueryWizardPage; Space, NewLine: string; var Settings: string);
begin
  Settings := Settings + ListSettings(Page, Space, NewLine);
end;
// END: *** Routines for collection the settings on the different pages

procedure SetHidden(aPage: TInputQueryWizardPage; aComponentNumber: integer; aHidden: Boolean);
begin
  aPage.Edits[aComponentNumber].Visible := not aHidden;
  aPage.PromptLabels[aComponentNumber].Visible :=  not aHidden;
end;

procedure RespaceQueryPage(aPage: TInputQueryWizardPage; aDelta, aLabelWidth: integer);
var
  NrOfEdits,
  i : integer;
begin
  NrOfEdits := (aPage.ComponentCount - 2) div 2;
  for i := 0 to NrOfEdits - 1 do
  begin
    aPage.PromptLabels[i].BringToFront;
    aPage.Edits[i].BringToFront;
    aPage.PromptLabels[i].Top := aPage.PromptLabels[i].Top - 20 + (i * aDelta);
    if aLabelWidth > 0 then
    begin
      aPage.PromptLabels[i].Width := aLabelWidth;
      aPage.Edits[i].Top := aPage.PromptLabels[i].Top;
      aPage.Edits[i].Left := aPage.PromptLabels[i].Left + aLabelWidth;
      aPage.Edits[i].Width := aPage.Edits[i].Width - aLabelWidth;
    end
    else
    aPage.Edits[i].Top := aPage.Edits[i].Top - 20 + (i * aDelta); 
  end;
end;

function ComponentIndex(aComponentName: string): integer;
begin
  Result := WizardForm.ComponentsList.items.IndexOf(aComponentName);
end;

function addLabel(aPage: TWizardPage; Left, Top: integer; aLabelText: string): TLabel;
begin
  Result := TLabel.Create(aPage);
  Result.Parent := aPage.Surface;
  Result.Left := Left;
  Result.Top := Top;
  Result.Caption := aLabelText;
end;

function addComboBox(aPage: TWizardPage; Left, Top: integer; aLabelText: string; aItems: TStringList; aDefault: string): TComboBox;
var
  DescLabel : TLabel;
  i : integer;
begin
  DescLabel := addLabel(aPage, Left, Top, aLabelText);

  Result := TNewComboBox.Create(aPage);
  Result.Parent := aPage.Surface;
  Result.Left := Left;
  Result.Top := DescLabel.Top + DescLabel.Height + 6;  
  Result.Width := 220;
  Result.Style := csDropDownList;

  for i := 0 to aItems.Count -1 do
  begin
    Result.Items.Add(aItems[i]);
    if CompareText(aDefault, aItems[i]) = 0 then
      Result.ItemIndex := i;
  end;

  if Result.ItemIndex = -1 then
    Result.ItemIndex := 0;
end;

function addEditBox(aPage: TWizardPage; Left, Top: integer; aLabelText: string; aDefault: string): TEdit;
var
  DescLabel : TLabel;
begin
  DescLabel := addLabel(aPage, Left, Top, aLabelText);

  Result := TEdit.Create(aPage);
  Result.Parent := aPage.Surface;
  Result.Left := Left;
  Result.Top := DescLabel.Top + DescLabel.Height + 6;  
  Result.Width := 220;
  Result.Text := aDefault;
end;
