*** Variables ***
${ddlModelId}                           jquery=#modelId
${btnModelColorPicker}                  jquery=.modelColorPickerButton
${txtModelShortName}                    jquery=#short_name
${txtModelLongName}                     jquery=#long_name
${txtModelEnvironment}                  jquery=#environment

${msgNoModelsAvailable}                 No models available
${ModifymodelShortname}                 ModifiedModelShortName
${ModifymodelName}                      ModifiedModelName
${ModifymodelEnviroment}                ModifiedEnv


*** Keywords ***
Check Model Id DropdownList
    ${hasModelsAvailable}    Run Keyword And Return Status    Page Should Not Contain    ${msgNoModelsAvailable}
    Run Keyword If    '${hasModelsAvailable}'=='True'    Verify Model Id DropdownList

Verify Model Id DropdownList
    Wait Until Page Contains Element    ${ddlModelId}
    Page Should Contain Element    ${ddlModelId}
    
Verify Model Short Name
    Wait Until Page Contains Element     ${txtModelShortName}
    Page Should Contain Element    ${txtModelShortName}

Verify Model Name
    Wait Until Page Contains Element    ${txtModelLongName}
    Page Should Contain Element    ${txtModelLongName}

Verify Model Environment
    Wait Until Page Contains Element    ${txtModelEnvironment}
    Page Should Contain Element    ${txtModelEnvironment}

Enter Model Short Name
    [Arguments]     ${ModelShortName}
    Wait Until Page Contains Element     ${txtModelShortName}
    Page Should Contain Element    ${txtModelShortName}
    Clear Element Text    ${txtModelShortName}
    Input Text      ${txtModelShortName}    ${ModelShortName}

Enter Model Name
    [Arguments]     ${ModelName}
    Wait Until Page Contains Element    ${txtModelLongName}
    Page Should Contain Element    ${txtModelLongName}
    Clear Element Text      ${txtModelLongName}
    Input Text      ${txtModelLongName}    ${ModelName}

Enter Model Environment
    [Arguments]     ${ModelEnvironment}
    Wait Until Page Contains Element    ${txtModelEnvironment}
    Page Should Contain Element    ${txtModelEnvironment}
    Clear Element Text      ${txtModelEnvironment}
    Input Text      ${txtModelEnvironment}    ${ModelEnvironment}

Get and Modify Model Short Name
    Wait Until Page Contains Element     ${txtModelShortName}
    Page Should Contain Element    ${txtModelShortName}
    ${ModelShortName}   Get Value  ${txtModelShortName}
    Set Global Variable     ${ModelShortName}   ${ModelShortName}
    Clear Element Text    ${txtModelShortName}  
    Input Text      ${txtModelShortName}    ${ModifymodelShortname}

Get and Modify Model Name
    Wait Until Page Contains Element    ${txtModelLongName}
    Page Should Contain Element    ${txtModelLongName}
    ${ModelName}    Get Value  ${txtModelLongName}
    Set Global Variable     ${ModelName}   ${ModelName}
    Clear Element Text      ${txtModelLongName}
    Input Text      ${txtModelLongName}    ${ModifymodelName}

Get and Modify Model Environment
    Wait Until Page Contains Element    ${txtModelEnvironment}
    Page Should Contain Element    ${txtModelEnvironment}
    ${ModelEnvironment}     Get Value  ${txtModelEnvironment}
    Set Global Variable     ${ModelEnvironment}   ${ModelEnvironment}
    Clear Element Text      ${txtModelEnvironment}
    Input Text      ${txtModelEnvironment}    ${ModifymodelEnviroment}

Verify model name is displayed in overview page
    Wait Until Page Contains Element    xpath=//h2[contains(text(),'${Modeldetails}')]
    Page Should Contain Element    xpath=//h2[contains(text(),'${Modeldetails}')]
    Element Text Should Be     xpath=//h2[contains(text(),'${Modeldetails}')]   ${Modeldetails}

Verify modified model name is displayed in overview page
    Click Hyperlink Overview
    Wait Until Overview Page Loaded
    Page Should Contain    ${ModifymodelShortname}

Verify deleted model is not displayed in overview page
    Wait Until All Models Page Loaded
    Wait Until Page Does Not Contain Element    ${trRowAllModelGrid}:contains(AuthTest)
    # Wait Until Page Contains Element    ${Overview}
    # Click Element   ${Overview}
    # Wait Until Page Contains Element    ${EA2800}      
    # Page Should Not Contain Element     ${ModelNameheading}


