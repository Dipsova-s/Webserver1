*** Variables ***
${lbNumberOfObject}                 jquery=#popupAngleResultSummary td:contains(Number of objects) + td
${lbExecutionTime}                  jquery=#popupAngleResultSummary td:contains(Response time) + td
${btnCloseResultSummary}            css=.popupAngleResultSummary .k-i-close
${divPopupAngleResultSummary}       css=.popupAngleResultSummary

*** Keywords ***
Wait Angle Execution Info Element Loaded
    Wait Until Page Contains    Number of objects
    Wait Until Page Contains    Response time
    Wait Until Page Contains Element    ${divPopupAngleResultSummary}
    Wait Until Element Is Visible    ${divPopupAngleResultSummary}

Close Angle Execution Info Popup
    Click Element     ${btnCloseResultSummary}

Get Number Of Object
    Open Execution Info Popup
    ${result}    Get Number From Element Text    ${lbNumberOfObject}
    Close Angle Execution Info Popup
    [return]    ${result}

Get Execution Time
    Open Execution Info Popup
    ${result}    Get Number From Element Text    ${lbExecutionTime}
    Close Angle Execution Info Popup
    [return]    ${result}

Execution Result Should Be Empty
    ${totalResult}    Get Number Of Object
    Should Be True    ${totalResult}==0
