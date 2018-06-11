*** Variables ***
${btnSaveRefreshCycle}             css=.btnSave

${trRowInRefreshCycleGrid}         jquery=#TaskDetailGrid tbody tr


${txtRefreshCycleName}             input[name=TaskName]
${chkEnabled}                      input[name^=IsEnabled]
${chkContinuous}                   input[name^=IsContinuous]
${ddlActionList}                   .ddlActionsList
${chkDelta}                        input[name^=IsDelta]

${chkDaySunday}                    .checkbox [value=S]
${chkDayMonday}                    .checkbox [value=M]
${chkDayThueseday}                 .checkbox [value=T]
${chkDayWednesday}                 .checkbox [value=W]
${chkDayThursday}                  .checkbox [value=TH]
${chkDayFriday}                    .checkbox [value=F]
${chkDaySaturday}                  .checkbox [value=Sat]

${txtStartTime}                    input[name=StartTime]
${txtRestartDelay}                 input[name=RestartDelay]
${txtUntil}                        input[name=EndTime]
${txtMaximunRunTime}               input[name=TimeStop]

${btnEditRefreshCycle}             .btnEdit
${btnExecuteRefreshCycle}          .btnExecute
${btnAbortRefreshCycle}            .btnDelete
${btnDeleteRefreshCycle}           .btnAbort

${trEditRow}                       css=.editRow
${trAddRow}                        css=.newRow

${btnAddRefreshCommand}            css=.gridToolbarBottom .btnAdd
${btnShowActionLists}              btnShowActionLists
${btnTestExtraction}               btnTestExtraction

#Refresh Cycle History
${trRowInHistoryGrid}              jquery=#TaskHistoryGrid tbody tr
${btnHistoryInfo}                  .btnInfo

*** Keywords ***
Click Save Refresh Cycle
    Wait Until Element Is Visible    ${btnSaveRefreshCycle}
    Click Element    ${btnSaveRefreshCycle}
    Wait MC Progress Bar Closed

Click Show Refresh Cycle Action By Name
    [Arguments]    ${name}
    Click Show Action Dropdown In Grid By Name    ${name}    ${trRowInRefreshCycleGrid}

Click Execute Refresh Cycle By Name
    [Arguments]    ${name}
    Click Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnExecuteRefreshCycle}
    Wait MC Progress Bar Closed

Click Abort Refresh Cycle By Name
    [Arguments]    ${name}
    Click Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnAbort}
    Wait MC Progress Bar Closed

Click Delete Refresh Cycle By Name
    [Arguments]    ${name}
    Click Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnAbortRefreshCycle}
    Wait MC Progress Bar Closed

#Edit Refresh Cycle
Click Edit Refresh Cycle By Name
    [Arguments]    ${name}
    Click Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnEditRefreshCycle}

Fill Refresh Cycle Name In Edit Row
    [Arguments]     ${name}
    Wait Until Page Contains Element    ${trEditRow} ${txtRefreshCycleName}
    Input Text    ${trEditRow} ${txtRefreshCycleName}    ${name}

Click Enable Refresh Cycle In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkEnabled}
    Click Element    ${trEditRow} ${chkEnabled}

Click Contiinuous Refresh Cycle In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkContinuous}
    Click Element    ${trEditRow} ${chkContinuous}

Select Refresh Cycle Action List Dropdown In Edit Row
    [Arguments]    ${actionName}
    Select Dropdown By InnerText    ${trEditRow} ${ddlActionList}    ${actionName}

Click Delta Refresh Cycle In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDelta}
    Click Element    ${trEditRow} ${chkDelta}

Click Refresh Cycle Sunday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDaySunday}
    Click Element    ${trEditRow} ${chkDaySunday}

Click Refresh Cycle Monday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDayMonday}
    Click Element    ${trEditRow} ${chkDayMonday}

Click Refresh Cycle Thueseday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDayThueseday}
    Click Element    ${trEditRow} ${chkDayThueseday}

Click Refresh Cycle Wednesday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDayWednesday}
    Click Element    ${trEditRow} ${chkDayWednesday}

Click Refresh Cycle Thursday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDayThursday}
    Click Element    ${trEditRow} ${chkDayThursday}

Click Refresh Cycle Friday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDayFriday}
    Click Element    ${trEditRow} ${chkDayFriday}

Click Refresh Cycle Saturday In Edit Row
    Wait Until Page Contains Element    ${trEditRow} ${chkDaySaturday}
    Click Element    ${trEditRow} ${chkDaySaturday}

Input Refresh Cycle Start Time In Edit Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trEditRow} ${txtStartTime}    ${valueText}

Input Refresh Cycle Restart Delay In Edit Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trEditRow} ${txtRestartDelay}    ${valueText}

Input Refresh Cycle Until In Edit Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trEditRow} ${txtUntil}    ${valueText}

Input Refresh Cycle Maximum Runtime In Edit Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trEditRow} ${txtMaximunRunTime}    ${valueText}

#Add Refresh Cycle
Click Add Refresh Cycle
    Wait Until Page Contains Element    ${btnAddRefreshCommand}
    Click Element    ${btnAddRefreshCommand}

Fill Refresh Cycle Name In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkEnabled}
    Click Element    ${trAddRow} ${chkEnabled}

Click Enable Refresh Cycle In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkEnabled}
    Click Element    ${trAddRow} ${chkEnabled}

Click Contiinuous Refresh Cycle In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkContinuous}
    Click Element    ${trAddRow} ${chkContinuous}

Select Refresh Cycle Action List Dropdown In Add Row
    [Arguments]    ${actionName}
    Select Dropdown By InnerText    ${trAddRow} ${ddlActionList}    ${actionName}

Click Delta Refresh Cycle In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDelta}
    Click Element    ${trAddRow} ${chkDelta}

Click Refresh Cycle Sunday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDaySunday}
    Click Element    ${trAddRow} ${chkDaySunday}

Click Refresh Cycle Monday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDayMonday}
    Click Element    ${trAddRow} ${chkDayMonday}

Click Refresh Cycle Thueseday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDayThueseday}
    Click Element    ${trAddRow} ${chkDayThueseday}

Click Refresh Cycle Wednesday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDayWednesday}
    Click Element    ${trAddRow} ${chkDayWednesday}

Click Refresh Cycle Thursday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDayThursday}
    Click Element    ${trAddRow} ${chkDayThursday}

Click Refresh Cycle Friday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDayFriday}
    Click Element    ${trAddRow} ${chkDayFriday}

Click Refresh Cycle Saturday In Add Row
    Wait Until Page Contains Element    ${trAddRow} ${chkDaySaturday}
    Click Element    ${trAddRow} ${chkDaySaturday}

Input Refresh Cycle Start Time In Add Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trAddRow} ${txtStartTime}    ${valueText}

Input Refresh Cycle Restart Delay In Add Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trAddRow} ${txtRestartDelay}    ${valueText}

Input Refresh Cycle Until In Add Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trAddRow} ${txtUntil}    ${valueText}

Input Refresh Cycle Maximum Runtime In Add Row
    [Arguments]    ${valueText}
    Input kendo Time Picker    ${trAddRow} ${txtMaximunRunTime}    ${valueText}


Click Test Extraction
    Wait Until Element Is Visible    ${btnTestExtraction}
    Click Element    ${btnTestExtraction}
    Wait MC Progress Bar Closed

#Show Action Lists
Click Test Extraction
    Wait Until Element Is Visible    ${btnTestExtraction}
    Click Element    ${btnTestExtraction}
    Wait MC Progress Bar Closed