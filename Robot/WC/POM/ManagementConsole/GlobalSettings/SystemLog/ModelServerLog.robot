*** Variables ***
${trRowInModelServerLogsGrid}               jquery=#SystemLogsGrid tbody tr
${btnViewModelServerLog}                    .btnInfo
${btnDownloadModelServerLog}                .btnDownload

${ddlModelServerLogModel}                   css=.k-dropdown[aria-owns=ddlModelServer_listbox]
${ddlModelServerLogServiceAgreement}        css=.k-dropdown[aria-owns=ddlModelService_listbox]

#Log popup
${popupLogTable}                       popupLogTable
${ddlSelectLogType}                    css=#popupLogTable.k-dropdown
${txtFilterLog}                        FilterLogTableTextbox
${btnClosePopupLogTable}               jquery=.k-window .k-i-close:eq(1)
${lbLogPopupTitle}                     popupLogTable_wnd_title

*** Keywords ***
Click Model Server Action Dropdown By Logfile Name
    [Arguments]    ${logfileName}
    Click Show Action Dropdown In Grid By Name    ${logfileName}    ${trRowInModelServerLogsGrid}

Click Model Server Action Dropdown By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInModelServerLogsGrid}

Click View Model Server Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInModelServerLogsGrid}    ${btnViewModelServerLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click View Model Server Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInModelServerLogsGrid}    ${btnViewModelServerLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click Download Model Server Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInModelServerLogsGrid}    ${btnDownloadModelServerLog}

Click Download Model Server Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInModelServerLogsGrid}    ${btnDownloadModelServerLog}

Select Model Dropdown List In Model Server Log By Model Name
    [Arguments]    ${modelName}
    Wait Until Page Contains Element    ${ddlModelServerLogModel}
    Select Dropdown By InnerText     ${ddlModelServerLogModel}     ${modelName}
    Wait MC Progress Bar Closed

Select Service Agreement Dropdown List In Model Server Log By Model Name
    [Arguments]    ${serviceAgreementName}
    Wait Until Page Contains Element    ${ddlModelServerLogServiceAgreement}
    Select Dropdown By InnerText     ${ddlModelServerLogServiceAgreement}     ${serviceAgreementName}
    Wait MC Progress Bar Closed


