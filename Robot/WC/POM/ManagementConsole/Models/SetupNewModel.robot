*** Variables ***
${ddlModelId}                           jquery=#modelId
${btnModelColorPicker}                  jquery=.modelColorPickerButton
${txtModelShortName}                    jquery=#short_name
${txtModelLongName}                     jquery=#long_name
${txtModelEnvironment}                  jquery=#environment

${msgNoModelsAvailable}                 No models available

*** Keywords ***
Check Model Id DropdownList
    ${hasModelsAvailable}    Run Keyword And Return Status    Page Should Not Contain    ${msgNoModelsAvailable}
    Run Keyword If    ${hasModelsAvailable}    Verify Model Id DropdownList

Verify Model Id DropdownList
    Wait Until Page Contains Element    ${ddlModelId}
    Page Should Contain Element    ${ddlModelId}

Verify Model Color Picker
    Wait Until Page Contains Element     ${btnModelColorPicker}
    Page Should Contain Element    ${btnModelColorPicker}

Verify Model Short Name
    Wait Until Page Contains Element     ${txtModelShortName}
    Page Should Contain Element    ${txtModelShortName}

Verify Model Name
    Wait Until Page Contains Element    ${txtModelLongName}
    Page Should Contain Element    ${txtModelLongName}

Verify Model Environment
    Wait Until Page Contains Element    ${txtModelEnvironment}
    Page Should Contain Element    ${txtModelEnvironment}
