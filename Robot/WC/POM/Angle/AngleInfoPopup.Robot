*** Variables ***
${btnDataInfo}                      css=#ExecutionResults .btnInfo
${lbNumberOfObject}                 jquery=#popupAngleResultSummary td:contains(Number of objects) + td
${lbExecutionTime}                  jquery=#popupAngleResultSummary td:contains(Response time) + td
${btnCloseResultSummary}            css=.popupAngleResultSummary .k-i-close
${divPopupAngleResultSummary}       css=.popupAngleResultSummary

*** Keywords ***
Wait Angle Execution Info Element Loaded
    Sleep    ${TIMEOUT_LARGEST}
    Wait Until Page Contains Element    ${btnDataInfo}
    Wait Until Element Is Visible    ${btnDataInfo}
    Sleep    ${TIMEOUT_LARGEST}
    Click Element    ${btnDataInfo}
    Wait Until Page Contains    Number of objects
    Wait Until Page Contains    Response time
    Wait Until Page Contains Element    ${divPopupAngleResultSummary}
    Wait Until Element Is Visible    ${divPopupAngleResultSummary}

Close Angle Execution Info Popup
    Click Element     ${btnCloseResultSummary}

Get Number Of Object
    Wait Angle Execution Info Element Loaded
    ${result}    Get Number From Element Text    ${lbNumberOfObject}
    Close Angle Execution Info Popup
    [return]    ${result}

Get Execution Time
    Wait Angle Execution Info Element Loaded
    ${result}    Get Number From Element Text    ${lbExecutionTime}
    Close Angle Execution Info Popup
    [return]    ${result}

Execution Result Should Be Empty
    ${totalResult}    Get Number Of Object
    Should Be True    ${totalResult}==0
