*** Variables ***
${btnSaveModelLanguage}           css=.btnSave
${Locator-Button-Reload}           css=a.btn.btnReload


*** Keywords ***
Click on Enable radio button for language:"${language}"    
    Wait Until Model Language Page Ready
    ${name}=  Run Keyword If   '${language}'=='Dutch'    set variable    nl
    ...   ELSE IF  '${language}'=='French'   set variable    fr
    ...   ELSE IF  '${language}'=='German'   set variable    de
    ...   ELSE IF  '${language}'=='Spanish'   set variable    es
    ...   ELSE IF  '${language}'=='Russian'   set variable    ru
    ...   ELSE   Fail   Language '${language}' not found 
    Select Radio Button  ${name}  True

Click on save Language settings
    Custom click element  ${btnSaveModelLanguage}
    Wait Until Model Language Page Ready

Validate Radio button:"${Language}" is selected
    Reload Page
    ${name}=  Run Keyword If   '${language}'=='Dutch'    set variable    nl
    ...   ELSE IF  '${language}'=='French'   set variable    fr
    ...   ELSE IF  '${language}'=='German'   set variable    de
    ...   ELSE IF  '${language}'=='Spanish'   set variable    es
    ...   ELSE IF  '${language}'=='Russian'   set variable    ru
    ...   ELSE   Fail   Language '${language}' not found
    
    Wait Until Model Language Page Ready
    Radio Button Should Be Set To  ${name}  True

Wait Until Model Language Page Ready
    Wait Until Page Contains Element     ${Locator-Button-Reload}
    Wait MC Progress Bar Closed