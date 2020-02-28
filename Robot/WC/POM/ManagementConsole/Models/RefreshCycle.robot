*** Variables ***
${btnSaveRefreshCycle}             css=.btnSave

${pgbRefreshCycle}                 jquery=#RefreshCycleContainer > div.k-loading-mask
${trRowInRefreshCycleGrid}         jquery=#TaskDetailGrid tbody tr

${txtRefreshCycleName}             input[name=TaskName]
${chkEnabled}                      input[name^=IsEnabled]
${chkContinuous}                   input[name^=IsContinuous]
${ddlActionList}                   select[name^=Action]
${chkDelta}                        input[name^=IsDelta]
${chkExternal}                     input[name^=IsExternal]
${chkNewAndChangedTablesOnly}      input[name^=ChangedTablesOnly]
${chkDelayModelServerStop}         input[name^=DelayModelserverStop]

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
${txtMaximumRunTime}               input[name=TimeStop]

${btnEditRefreshCycle}             .btnEdit
${btnExecuteRefreshCycle}          .btnExecute
${btnAbortRefreshCycle}            .btnAbort
${btnDeleteRefreshCycle}           .btnDelete

${trEditRow}                       css=.editRow
${trAddRow}                        css=.newRow

${btnAddRefreshCommand}            css=.gridToolbarBottom .btnAdd
${btnShowActionLists}              btnShowActionLists
${btnTestExtraction}               btnTestExtraction

#Refresh Cycle History
${trRowInHistoryGrid}              jquery=#TaskHistoryGrid tbody tr
${btnHistoryInfo}                  .btnInfo

#Refresh Cycle New Design
${contentSectionInfo}              css=.contentSectionInfo
${btnSaveRefreshCycleForm}         css=.btnSaveForm
${btnCancelRefreshCycleForm}       css=.btnSaveForm + .btn
${headRowInRefreshCycleGrid}       jquery=#TaskDetailGrid thead tr
${actionList}                      select.actionList
${newChkDaySunday}                 .checkbox [value=S] + .input
${newChkDayMonday}                 .checkbox [value=M] + .input
${confirmationDelete}              jquery=#popupConfirmation .btnSubmit

#Specify table Popup
${btnSpectifyTables}               css=.btnSpecifyTables            
${pbgSpecifyTable}                 jquery=#DisplayPropertiesGrid .k-loading-mask
${txtTableFilter}                  jquery=#popupSpecifyTables .gridToolbarFilter:eq(0) input
${btnCloseSpecifyTables}           //span[@id='popupSpecifyTables_wnd_title']/..//div/a[@class='k-button k-bare k-button-icon k-window-action']/span[@class='k-icon k-i-close']/..
${trRowSpecifyTables}              jquery=#DownloadTableGridContainer tbody tr   
${thColumnInSpecifyTables}         jquery=#DownloadTableGridContainer .k-grid-header th:eq(1)
${trRowSpecifyTablesValue}         jquery=#DownloadTableGridContainer .k-grid-content td:eq(1)

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
    Click Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnDeleteRefreshCycle}
    Wait MC Progress Bar Closed

#Edit Refresh Cycle
Click Edit Refresh Cycle By Name
    [Arguments]    ${name}
    Click Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnEditRefreshCycle}

#Add Refresh Cycle
Click Add Refresh Cycle
    Wait Until Page Contains Element    ${btnAddRefreshCommand}
    Click Element    ${btnAddRefreshCommand}

#Show Action Lists
Click Test Extraction
    Wait Until Element Is Visible    ${btnTestExtraction}
    Click Element    ${btnTestExtraction}
    Wait MC Progress Bar Closed

# Refresh Cycle New Design
Wait Until Refresh Cycle Page Loaded
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${pgbRefreshCycle}
    Wait Until Element Is Visible    ${headRowInRefreshCycleGrid}

Click Save Refresh Cycle Form
    Wait Until Element Is Visible    ${btnSaveRefreshCycleForm}
    Click Element    ${btnSaveRefreshCycleForm}
    Wait MC Progress Bar Closed
    Wait Until Refresh Cycle Page Loaded

Click Cancel Refresh Cycle Form
    Wait Until Element Is Visible    ${btnCancelRefreshCycleForm}
    Click Element    ${btnCancelRefreshCycleForm}

#Add Refresh Cycle New Design
Fill Refresh Cycle Name
    [Arguments]     ${name}
    Wait Until Page Contains Element    ${contentSectionInfo} ${txtRefreshCycleName}
    Input Text    ${contentSectionInfo} ${txtRefreshCycleName}    ${name}

Click Contiinuous Refresh Cycle
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkContinuous}
    Click Element    ${contentSectionInfo} ${chkContinuous}

Click Enabled Refresh Cycle
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkEnabled}
    Click Element    ${contentSectionInfo} ${chkEnabled}

Set Refresh Cycle Action List
    [Arguments]    ${actionName}
    Select Dropdown By Kendo     ${actionList}     ${actionName}

#Test Specify Table Popup
Wait Until Specify Tables Popup Loaded  
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pbgSpecifyTable} 

Click Specify Tebles Botton                   
    Wait Until Page Contains Element    ${btnSpectifyTables}
    Click Element    ${btnSpectifyTables}  
    Wait Until Specify Tables Popup Loaded    

Filter Specify Tables By Keyword
    [Arguments]    ${valueText}
    Wait Until Page Contains Element   ${txtTableFilter}
    Input Text By JQuery    ${txtTableFilter}    ${valueText}
    Press key    ${txtTableFilter}    \\13
    Wait Until Specify Tables Popup Loaded
 
Specify Tables Grid Should Contains
    [Arguments]    ${expected}
    Element Should Contain    ${trRowSpecifyTables}    ${expected}

Sort ASC/DESC Column Headder On Specify Tables Popup 
    Click Element    ${thColumnInSpecifyTables}
    Wait Until Specify Tables Popup Loaded 
    Click Element    ${thColumnInSpecifyTables} 
    Wait Until Specify Tables Popup Loaded
    
Click Close Specify Tables Popup
    Click Element    ${btnCloseSpecifyTables}
 
First Record On Table Should Equal
    [Arguments]    ${compareField}
    ${value}    Get Text    ${trRowSpecifyTablesValue}
    Should Be Equal    ${value}    ${compareField}
       
Click Refresh Cycle Sunday
    Wait Until Page Contains Element    ${contentSectionInfo} ${newChkDaySunday}
    Click Element    ${contentSectionInfo} ${newChkDaySunday}

Click Refresh Cycle Monday
    Wait Until Page Contains Element    ${contentSectionInfo} ${newChkDayMonday}
    Click Element    ${contentSectionInfo} ${newChkDayMonday}

Input Refresh Cycle Start Time
    [Arguments]    ${valueText}
    Input Text     ${contentSectionInfo} ${txtStartTime}    ${valueText}

Input Refresh Cycle Restart Delay
    [Arguments]    ${valueText}
    Input Text     ${contentSectionInfo} ${txtRestartDelay}    ${valueText}

Input Refresh Cycle Until
    [Arguments]    ${valueText}
    Input Text     ${contentSectionInfo} ${txtUntil}    ${valueText}

Input Refresh Cycle Maximum Runtime
    [Arguments]    ${valueText}
    Input Text     ${contentSectionInfo} ${txtMaximumRunTime}    ${valueText}

#Verify Refresh Cycle New Design
Refresh Cycle Name Should Be Equal
    [Arguments]    ${text}
    ${compareRefreshCycleName}    Get Value    ${contentSectionInfo} ${txtRefreshCycleName}
    Should Be Equal    ${compareRefreshCycleName}    ${text}

Refresh Cycle Start Time Should Be Equal
    [Arguments]    ${text}
    ${compareRefreshCycleStartTime}    Get Value    ${contentSectionInfo} ${txtStartTime}
    Should Be Equal    ${compareRefreshCycleStartTime}    ${text}

Refresh Cycle Restart Delay Should Be Equal
    [Arguments]    ${text}
    ${compareRefreshCycleRestartDelay}    Get Value    ${contentSectionInfo} ${txtRestartDelay}
    Should Be Equal    ${compareRefreshCycleRestartDelay}    ${text}

Refresh Cycle Until Should Be Equal
    [Arguments]    ${text}
    ${compareRefreshCycleUntil}    Get Value    ${contentSectionInfo} ${txtUntil}
    Should Be Equal    ${compareRefreshCycleUntil}    ${text}

Refresh Cycle Maximum Runtime Should Be Equal
    [Arguments]    ${text}
    ${compareRefreshCycleMaximumRuntime}    Get Value    ${contentSectionInfo} ${txtMaximumRuntime}
    Should Be Equal    ${compareRefreshCycleMaximumRuntime}    ${text}

#Delete Refresh Cycle New Design
Click Action Delete Refresh Cycle By Name
    [Arguments]    ${name}
    Click More Action In Grid By Name     ${name}    ${trRowInRefreshCycleGrid}    ${btnEditRefreshCycle}

Click Confirm Delete Refresh Cycle
    Wait Until Element Is Visible    ${confirmationDelete}
    Click Element    ${confirmationDelete}

Page Should Contain Name Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${txtRefreshCycleName}
    Page Should Contain Element    ${contentSectionInfo} ${txtRefreshCycleName}

Page Should Contain External Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkExternal}
    Page Should Contain Element    ${contentSectionInfo} ${chkExternal}

Page Should Contain Action List Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${ddlActionList}
    Page Should Contain Element    ${contentSectionInfo} ${ddlActionList}

Page Should Contain Delta Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDelta}
    Page Should Contain Element    ${contentSectionInfo} ${chkDelta}

Page Should Contain New And Changed Tables Only Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkNewAndChangedTablesOnly}
    Page Should Contain Element    ${contentSectionInfo} ${chkNewAndChangedTablesOnly}

Page Should Contain Day Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDaySunday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDaySunday}

    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDayMonday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDayMonday}

    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDayThueseday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDayThueseday}

    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDayWednesday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDayWednesday}

    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDayThursday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDayThursday}

    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDayFriday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDayFriday}

    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDaySaturday}
    Page Should Contain Element    ${contentSectionInfo} ${chkDaySaturday}

Page Should Contain Start Time Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${txtStartTime}
    Page Should Contain Element    ${contentSectionInfo} ${txtStartTime}

Page Should Contain Delay Model Server Stop Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkDelayModelServerStop}
    Page Should Contain Element    ${contentSectionInfo} ${chkDelayModelServerStop}

Page Should Contain Continuous Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkContinuous}
    Page Should Contain Element    ${contentSectionInfo} ${chkContinuous}

Page Should Contain Restart Delay Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${txtRestartDelay}
    Page Should Contain Element    ${contentSectionInfo} ${txtRestartDelay}

Page Should Contain Until Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${txtUntil}
    Page Should Contain Element    ${contentSectionInfo} ${txtUntil}

Page Should Contain Maximum Run Time Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${txtMaximumRunTime}
    Page Should Contain Element    ${contentSectionInfo} ${txtMaximumRunTime}

Page Should Contain Enabled Field
    Wait Until Page Contains Element    ${contentSectionInfo} ${chkEnabled}
    Page Should Contain Element    ${contentSectionInfo} ${chkEnabled}
