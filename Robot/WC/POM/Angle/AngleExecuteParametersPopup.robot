*** Variables ***
${divExecuteParametersPopup}     css=#popupExecuteParameters
${pgbExecuteParameters}          css=#popupExecuteParameters > div.k-loading-mask
${btnSubmitExecuteParameters}    css=#btn-popupExecuteParameters3
${searchPageTitle}               Every Angle - Search page

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
    ${pageTitle}    Get Page Title
    Run Keyword If    '${pageTitle}' == '${searchPageTitle}'    Check If Angle Or Display Has Execute Parameters From Search Page Then Execute The Popup
    ...    ELSE    Check If Angle Or Display Has Execute Parameters From Angle Page Then Execute The Popup

Click Submit Angle Execution Parameters
    Wait Until Angle Execute Parameters Popup Loaded
    Wait Until Element Is Visible    ${btnSubmitExecuteParameters}
    Click Element    ${btnSubmitExecuteParameters}
    Wait Angle Page Document Loaded
