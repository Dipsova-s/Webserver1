*** Variables ***
${divExecuteParametersPopup}     css=#popupExecuteParameters
${pgbExecuteParameters}          css=#popupExecuteParameters > div.k-loading-mask
${btnSubmitExecuteParameters}    css=#btn-popupExecuteParameters3
${searchPageTitle}               Every Angle - Search page

*** Keywords ***
Wait Until Dashboard Execute Parameters Popup Loaded
    Wait Until Page Contains Element       ${divExecuteParametersPopup}
    Wait Until Page Does Not Contain Element    ${pgbExecuteParameters}

Check If Dashboard Has Execute Parameters From Search Page Then Execute The Popup
    ${foundPopup}    Set Variable    False
    : FOR    ${INDEX}    IN RANGE    0    ${TIMEOUT_AJAX_COMPLETE}
    \    ${currentTitle} =    Get Page Title
    \    ${statusWarningPopup} =   Is Element Visible    ${btnSubmitExecuteParameters}
    \    ${foundPopup} =    Set Variable If    ${statusWarningPopup} == True    True
    \    Run Keyword If    ${statusWarningPopup} == True or '${searchPageTitle}' != '${currentTitle}'    Exit For Loop
    Run Keyword If    ${foundPopup} == True    Click Submit Dashboard Execution Parameters

Check If Dashboard Has Execute Parameters From Dashboard Page Then Execute The Popup
    Sleep   ${TIMEOUT_GENERAL}
    ${statusWarningPopup} =   Is Element Visible    ${btnSubmitExecuteParameters}
    Run Keyword If    ${statusWarningPopup} == True    Click Submit Dashboard Execution Parameters

Check If Dashboard Has Execute Parameters Then Execute The Popup
    ${pageTitle} =    Get Page Title
    Run Keyword If    '${pageTitle}' == '${searchPageTitle}'    Check If Dashboard Has Execute Parameters From Search Page Then Execute The Popup
    ...    ELSE    Check If Dashboard Has Execute Parameters From Dashboard Page Then Execute The Popup

Click Submit Dashboard Execution Parameters
    Wait Until Dashboard Execute Parameters Popup Loaded
    Wait Until Element Is Visible    ${btnSubmitExecuteParameters}
    Click Element    ${btnSubmitExecuteParameters}
    Wait Dashboard Document Loaded

Click Submit Adhoc Dashboard Execution Parameters
    Click Submit Dashboard Execution Parameters
    Wait Dashboard Detail Document Loaded

Expand Dashboard Parameters First Filter Panel
    Expand Filter Panel    0

Expand Dashboard Parameters Second Filter Panel
    Expand Filter Panel    1

Choose First Dropdown Filter Operator Dashboard Parameters
    [Arguments]    ${operator}
    Choose Dropdown Filter Operator    0    ${operator}

Choose Second Dropdown Filter Operator Dashboard Parameters
    [Arguments]    ${operator}
    Choose Dropdown Filter Operator    1    ${operator}

Input First Filter Set Select Value Dashboard Parameters
    [Arguments]    ${value}
    Input Filter Set Select Value    0    ${value}

Input Second Filter Set Select Value Dashboard Parameters
    [Arguments]    ${value}
    Input Filter Set Select Value    1    ${value}
