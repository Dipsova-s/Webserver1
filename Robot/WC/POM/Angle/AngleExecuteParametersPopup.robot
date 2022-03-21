*** Variables ***
${divExecuteParametersPopup}            css=#PopupExecutionParameter
${pgbExecuteParameters}                 css=#PopupExecutionParameter > div.k-loading-mask
${btnCloseExecuteParametersPopup}       jquery=.popup-execution-parameter .k-window-action[aria-label="Close"]
${btnSubmitExecuteParameters}           css=#btn-PopupExecutionParameter1
${btnSwitchAngleExecuteParameters}      css=.btnChangeAngleParameters
${btnSwitchDisplayExecuteParameters}    css=.btnChangeDisplayParameters
${searchPageTitle}                      Magnitude Angles for SAP - Search page

*** Keywords ***
Wait Until Angle Execute Parameters Popup Loaded
    Wait Until Page Contains Element       ${divExecuteParametersPopup}
    Wait Until Page Does Not Contain Element    ${pgbExecuteParameters}

Check If Angle Or Display Has Execute Parameters From Search Page Then Execute The Popup
    ${foundPopup}    Set Variable    False
    : FOR    ${INDEX}    IN RANGE    0    ${TIMEOUT_AJAX_COMPLETE}
    \    ${currentTitle} =    Get Page Title
    \    ${statusWarningPopup} =   Is Element Visible    ${btnSubmitExecuteParameters}
    \    ${foundPopup} =    Set Variable If    ${statusWarningPopup} == True    True
    \    Run Keyword If    ${statusWarningPopup} == True or '${searchPageTitle}' != '${currentTitle}'    Exit For Loop
    Run Keyword If    ${foundPopup} == True    Click Submit Angle Execution Parameters

Check If Angle Or Display Has Execute Parameters From Angle Page Then Execute The Popup
    Sleep   ${TIMEOUT_GENERAL}
    ${statusWarningPopup} =   Is Element Visible    ${btnSubmitExecuteParameters}
    Run Keyword If    ${statusWarningPopup} == True    Click Submit Angle Execution Parameters

Check If Angle Or Display Has Execute Parameters Then Execute The Popup
    Sleep   ${TIMEOUT_GENERAL}
    ${statusWarningPopup} =  Is Element Visible   ${btnSubmitExecuteParameters}
    Run Keyword If    ${statusWarningPopup} == True   Check If Angle Or Display Has Execute Parameters From Search Page Then Execute The Popup
    ...    ELSE    Check If Angle Or Display Has Execute Parameters From Angle Page Then Execute The Popup

Add Compare Filter From Angle Execution Parameters Popup
    [Arguments]   ${fieldKeyword}    ${fieldId}  ${isSelfSource}
    Click Select Field On Popup Execution Parameter
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}  ${isSelfSource}

Click Submit Angle Execution Parameters
    Wait Until Angle Execute Parameters Popup Loaded
    Wait Until Element Is Visible    ${btnSubmitExecuteParameters}
    Click Element    ${btnSubmitExecuteParameters}
    Wait Angle Page Document Loaded

Switch To Angle Parameters
    Click Element  ${btnSwitchAngleExecuteParameters}

Switch To Display Parameters
    Click Element  ${btnSwitchDisplayExecuteParameters}

Close Angle Execution Parameters Popup
    Click Element  ${btnCloseExecuteParametersPopup}