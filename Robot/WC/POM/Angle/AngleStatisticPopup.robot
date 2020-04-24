*** Variables ***
${divPopupAngleStatistic}        jquery=.popup-info
${btnCloseAngleStatisticPopup}   ${divPopupAngleStatistic} .k-window-action[aria-label="Close"]
${rowAngleExecutionInfo}         ${divPopupAngleStatistic} .row-execution-info
${rowAngleSerarator}             ${divPopupAngleStatistic} .row-separator
${rowAngleStatistic}             ${divPopupAngleStatistic} .row-statistic
${lbNumberOfObject}              ${divPopupAngleStatistic} .info-displaytotalrow
${lbExecutionTime}               ${divPopupAngleStatistic} .info-responsetime
${lblLastExecutedDate}           ${divPopupAngleStatistic} .row-last-executed .label-data-date
${btnAngleInfo}                  ${tabAngle} .action.btn-info

*** Keywords *** 
Open Angle Statistic Popup
    Sleep    ${TIMEOUT_LARGEST}
    Mouse Over      ${tabAngle}
    Click Element   ${btnAngleInfo}

Close Angle Statistic Popup
    Click Element   ${btnCloseAngleStatisticPopup}

Check Angle Execution Info
    Page Should Contain    SAP system
    Page Should Contain    Date & time download
    Page Should Contain    Start object
    Page Should Contain    Number of items
    Page Should Contain    Runtime Model Server
    Page Should Contain    Response time

Check Angle Statistic Info
    Page Should Contain    Statistics
    Page Should Contain    Created by
    Page Should Contain    Last changed by
    Page Should Contain    Last executed by
    Page Should Contain    Number of executes
    Page Should Contain    Validation last changed by

Angle Should Contain Execution Info
    Page Should Contain Element  ${rowAngleExecutionInfo}
    Check Angle Execution Info

Angle Should Not Contain Execution Info
    Page Should Not Contain Element  ${rowAngleExecutionInfo}

Angle Should Contain Serarator
    Page Should Contain Element  ${rowAngleSerarator}

Angle Should Not Contain Serarator
    Page Should Not Contain Element  ${rowAngleSerarator}

Angle Should Contain Statistic Info
    Page Should Contain Element  ${rowAngleStatistic}
    Check Angle Statistic Info

Angle Should Not Contain Statistic Info
    Page Should Not Contain Element  ${rowAngleStatistic}

Get Last Execute Angle Date
    ${lastExecuteText}    Get Text    ${lblLastExecutedDate}
    ${lastExecuteDateString}    Get Substring    ${lastExecuteText}    3    14
    ${lastExecuteTimeString}    Get Substring    ${lastExecuteText}    18    23
    ${lastExecuteDateTimeString}    Catenate    ${lastExecuteDateString}    ${lastExecuteTimeString}
    [Return]    ${lastExecuteDateTimeString}

Get Number Of Object
    Open Angle Statistic Popup
    ${result}    Get Number From Element Text    ${lbNumberOfObject}
    Close Angle Statistic Popup
    [return]    ${result}

Get Execution Time
    Open Angle Statistic Popup
    ${result}    Get Number From Element Text    ${lbExecutionTime}
    Close Angle Statistic Popup
    [return]    ${result}

Execution Result Should Be Empty
    ${totalResult}    Get Number Of Object
    Should Be True    ${totalResult}==0