*** Variables ***
${btnSaveSystemSetting}          css=.btnSave
${btnCancelEditSystemSetting}    css=.btnBack

${lbApplicationServerUri}               css=.infoApplicationServerUrl p
${txtDefaultPageSize}                   default_pagesize
${txtMaxPageSize}                       max_pagesize_appserver
${txtSessionTimeout}                    session_expiry_minutes
${txtSessionHistory}                    remember_expired_sessions_minutes
${txtPollModelserver}                   modelserver_check_seconds
${txtModelServerTimeout}                modelserver_timeout
${txtModelServerMetadataTimeout}        modelserver_metadata_timeout
${txtMaxDomainSizeForSearch}            max_domainelements_for_search
${txtCacheValidity}                     default_cache_minutes
${txtMinimumNumberOfLabelCategories}    min_labelcategories_to_publish
${txtCheckExpiredSessionMinutes}        check_expired_sessions_minutes
${txtInstancesToKeepPerModel}           instances_per_model
${txtActiveDirectlySizeLimit}           active_directory_size_limit
${txtDefaultMaximumExportPageSize}      default_max_export_page_size

${chkEnableGroupingInPivotExports}      allow_grouping_in_pivot_excel_export
${chkIncludeSelfInExportHeaders}        include_self_in_export_headers

${txtProgramScriptsFolder}              script_location
${txtinfoProgramScriptsFolder}          //input[@id='script_location']/../a
${txtforinfo}                           //div[@id='popupDescriptionTemplate']/div[@class='popupContent']
${ExpectedTextValue}                    The location of the folder for program/script files for use in Automation Tasks. Any file in this folder of type .cmd, .exe, .ps1 and .bat will become available in the dropdown when setting up an Action of type Program/script.
${ClosePopup}                           //a[@class='btn btnPrimary btnClose']

${txtMaxEventLogStoredRecords}          max_event_log_stored_records
${txtMaxAuditLogHistory}                max_audit_log_history

${txtEmailSettingsEmailServer}          EmailSettings_smtp_server
${txtEmailSettingsEmailServerPort}      EmailSettings_smtp_port
${txtEmailSettingsSender}               EmailSettings_smtp_sender
${chkEmailSettingsUseSSL}               smtp_use_ssl
${txtEmailSettingsUserName}             EmailSettings_username
${txtEmailSettingsPassword}             EmailSettings_password

${btnShowTestEmailSettingPopup}         css=#TestEmailButton
${txtEmailSettingsRecipient}            EmailSettings_recipient
${btnSubmitTestEmailSetting}            css=#TestEmailPopup .btnPrimary
${btnCloseTestEmailSetting}             css=#TestEmailPopup .btnClose

${divTestEmailReport}                   css=#TestEmailResult
${pgbTestEmailReport}                   css=#TestEmailResult .k-loading-mask
${btnCloseTestEmailReport}              css=#TestEmailResult_wnd_title + .k-window-actions .k-i-close


*** Keyword ***
Wait System Settings Page Ready
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Application server
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete

#System Setting
Input System Settings Default Page Size
    [Arguments]    ${pageSize}
    Input kendo Numeric TextBox    ${txtDefaultPageSize}    ${pageSize}

Input System Settings Max Page Size
    [Arguments]    ${maxPageSize}
    Input kendo Numeric TextBox    ${txtMaxPageSize}    ${maxPageSize}

Input System Settings Session Timeout
    [Arguments]    ${sessionTimeout}
    Input kendo Numeric TextBox    ${txtSessionTimeout}    ${sessionTimeout}

Input System Settings Session History
    [Arguments]    ${sessionHistory}
    Input kendo Numeric TextBox    ${txtSessionHistory}    ${sessionHistory}

Input System Settings Poll Models Server
    [Arguments]    ${pollModelServer}
    Input kendo Numeric TextBox    ${txtPollModelserver}    ${pollModelServer}

Input System Settings Model Server Timeout
    [Arguments]    ${modelServerTimeout}
    Input kendo Numeric TextBox    ${txtModelServerTimeout}    ${modelServerTimeout}

Input System Settings Model Server Metadata Timeout
    [Arguments]    ${modelServerMetadataTimeout}
    Input kendo Numeric TextBox    ${txtModelServerMetadataTimeout}    ${modelServerMetadataTimeout}

Input System Settings Max Domain Size For Search
    [Arguments]    ${maxDomainSize}
    Input kendo Numeric TextBox    ${txtMaxDomainSizeForSearch}    ${maxDomainSize}

Input System Settings Cache Validity
    [Arguments]    ${cacheValidity}
    Input kendo Numeric TextBox    ${txtCacheValidity}    ${cacheValidity}

Input System Settings Minimum Number Of Label Categories
    [Arguments]    ${minimunNumberOfLabelCategory}
    Input kendo Numeric TextBox    ${txtMinimumNumberOfLabelCategories}    ${minimunNumberOfLabelCategory}

Input System Settings Check Expired Session Minutes
    [Arguments]    ${expiredSessionMinute}
    Input kendo Numeric TextBox    ${txtCheckExpiredSessionMinutes}    ${expiredSessionMinute}

Get System Settings Check Instances To Keep Per Model
    ${value}    Get Kendo Value  ${txtInstancesToKeepPerModel} 
    [Return]    ${value}

Input System Settings Check Instances To Keep Per Model
    [Arguments]    ${instancesToKeepPerModel}
    Click Element   ${txtInstancesToKeepPerModel}
    Input Text   ${txtInstancesToKeepPerModel}  ${instancesToKeepPerModel}
    Click Element   ${txtCheckExpiredSessionMinutes}

System Settings Check Instances To Keep Per Model Should Be One
    Textfield Value Should Be    ${txtInstancesToKeepPerModel}    1

Input System Settings Active Directory Size Limit
    [Arguments]    ${activeDirectorySizeLimit}
    Input kendo Numeric TextBox    ${txtActiveDirectlySizeLimit}    ${activeDirectorySizeLimit}

Get System Settings Active Directory Size Limit Value
    ${value}    Get Kendo Value  ${txtActiveDirectlySizeLimit} 
    [Return]    ${value}

Input Default maximum export page size field
    [Arguments]     ${defaultMaximumExportPageSize}
    Input kendo Numeric TextBox  ${txtDefaultMaximumExportPageSize}  ${defaultMaximumExportPageSize}

Set Enable Grouping in Pivot exports checkbox
    [Arguments]     ${enableGroupingInPivotExports}
    Run Keyword if  ${enableGroupingInPivotExports} == True    Set Checkbox  ${chkEnableGroupingInPivotExports}   False
    Run Keyword if  ${enableGroupingInPivotExports} == False   Set checkbox  ${chkEnableGroupingInPivotExports}   True

Set Include Self in export headers checkbox
    [Arguments]     ${includeSelfInExportHeaders}
    Run Keyword if  ${includeSelfInExportHeaders} == True    Set Checkbox  ${chkIncludeSelfInExportHeaders}   False
    Run Keyword if  ${includeSelfInExportHeaders} == False   Set checkbox  ${chkIncludeSelfInExportHeaders}   True

Input Program/scripts folder field
    [Arguments]     ${programScriptsFolder}
    Input Text   ${txtProgramScriptsFolder}  ${programScriptsFolder}

Click Program/scripts folder textinfo Popup
    Click Element      ${txtinfoProgramScriptsFolder}
    Verify Program/scripts folder Text for info information

Verify Program/scripts folder Text for info information
    ${ActualTextValue}     Get Text     ${txtforinfo}
    Should Contain    ${ActualTextValue}     ${ExpectedTextValue}
    Click Element     ${ClosePopup}

Verify Program/Script folder path
    [Arguments]     ${Program/ScriptFolderPath} 
    ${FolderActualValue}    Get Value    ${txtProgramScriptsFolder}
    Run Keyword If    '${FolderActualValue}'=='${Program/ScriptFolderPath}'
    ...    Log    Saved successfully

Input Max event log stored records field
    [Arguments]     ${maxEventLogStoredRecords}
    Input kendo Numeric TextBox    ${txtMaxEventLogStoredRecords}    ${maxEventLogStoredRecords}

Input Max audit log history [months] field
    [Arguments]     ${maxAuditLogHistory}
    Input kendo Numeric TextBox  ${txtMaxAuditLogHistory}   ${maxAuditLogHistory}

#Email Setting
Input Email Settings Email Server
    [Arguments]    ${emailServerName}
    Input Text    ${txtEmailSettingsEmailServer}    ${emailServerName}

Input Email Settings Email Server Port
    [Arguments]    ${emailServerPort}
    Input kendo Numeric TextBox    ${txtEmailSettingsEmailServerPort}    ${emailServerPort}

Input Email Settings Sender
    [Arguments]    ${emailServerName}
    Input Text     ${txtEmailSettingsSender}    ${emailServerName}

Click Email Settings Use SSL
    [Arguments]     ${chkEmailSettingsSSL}
    Run Keyword if  ${chkEmailSettingsSSL} == True    Set Checkbox  ${chkEmailSettingsUseSSL}   False
    Run Keyword if  ${chkEmailSettingsSSL} == False   Set checkbox  ${chkEmailSettingsUseSSL}   True

Set Email Settings Use SSL
    Wait Until Page Contains Element    ${chkEmailSettingsUseSSL}
    Select Checkbox    ${chkEmailSettingsUseSSL}

Unset Email Settings Use SSL
    Wait Until Page Contains Element    ${chkEmailSettingsUseSSL}
    Unselect Checkbox    ${chkEmailSettingsUseSSL}

Input Email Settings Username
    [Arguments]    ${emailUsername}
    Input Text    ${txtEmailSettingsUserName}    ${emailUsername}

Input Email Settings Password
    [Arguments]    ${emailPassword}
    Input Password    ${txtEmailSettingsPassword}    ${emailPassword}

Click Show Test Email Setting Popup
    Wait Until Page Contains Element    ${btnShowTestEmailSettingPopup}
    Click Element    ${btnShowTestEmailSettingPopup}

Input Email Recipient
    [Arguments]    ${recipient}
    Input Text     ${txtEmailSettingsRecipient}    ${recipient}

Click Test Email Setting
    Wait Until Page Contains Element    ${btnSubmitTestEmailSetting}
    Click Element    ${btnSubmitTestEmailSetting}

Close Test Email Setting Popup
    Wait Until Page Contains Element    ${btnCloseTestEmailSetting}
    Click Element    ${btnCloseTestEmailSetting}

Wait Test Email Setting Report Loaded
    Wait Until Page Contains Element    ${divTestEmailReport}
    Wait Until Page Does Not Contain Element    ${pgbTestEmailReport}
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}

Close Test Email Setting Report Popup
    Wait Until Page Contains Element    ${btnCloseTestEmailReport}
    Click Element    ${btnCloseTestEmailReport}

Click Save System Settings
    Click Element   ${btnSaveSystemSetting}
    Wait System Settings Page Ready
    Reload Page
    Wait System Settings Page Ready

Get Default page size field value
    ${value}    Get Kendo value  ${txtDefaultPageSize}
    [Return]  ${value}

Get Max Page size field value
    ${value}    Get Kendo Value  ${txtMaxPageSize}
    [Return]  ${value}

Get Session timeout field value
    ${value}    Get Kendo Value  ${txtSessionTimeout}
    [Return]  ${value}

Get Session history field value
    ${value}    Get Kendo Value  ${txtSessionHistory}
    [Return]  ${value}

Get Poll model server field value
    ${value}    Get Kendo Value  ${txtPollModelserver}
    [Return]  ${value}

Get Model server timeout field value
    ${value}    Get Kendo Value  ${txtModelServerTimeout}
    [Return]  ${value}

Get Model server metadata timeout [seconds] field value
    ${value}    Get Kendo Value  ${txtModelServerMetadataTimeout}
    [Return]  ${value}

Get Max domain size for search field value
    ${value}    Get Kendo Value  ${txtMaxDomainSizeForSearch}
    [Return]  ${value}
    
Get Cache validity field value
    ${value}    Get Kendo Value  ${txtCacheValidity}
    [Return]  ${value}

Get Minimum number of label categories to publish angle field value
    ${value}    Get Kendo Value  ${txtMinimumNumberOfLabelCategories}
    [Return]  ${value}

Get Check expired sessions minutes field value
    ${value}    Get Kendo Value  ${txtCheckExpiredSessionMinutes}
    [Return]  ${value}

Get Active directory size limit field value
    ${value}    Get Kendo Value  ${txtActiveDirectlySizeLimit}
    [Return]  ${value}

Get Enable Grouping in Pivot exports checkbox state
    ${chkbox}   Is Element Checked  ${chkEnableGroupingInPivotExports}
    [Return]    ${chkbox}

Get Include Self in export headers checkbox state
    ${chkbox}   Is Element Checked  ${chkIncludeSelfInExportHeaders}
    [Return]    ${chkbox}

Get Default maximum export page size field value
    ${value}    Get Kendo Value  ${txtDefaultMaximumExportPageSize}
    [Return]    ${value}

Get Program/scripts folder field value
    ${value}    Get Value    ${txtProgramScriptsFolder}
    [Return]    ${value}

Get Max event log stored records field value
    ${value}    Get Kendo Value  ${txtMaxEventLogStoredRecords}
    [Return]    ${value}

Get Max audit log history [months] field value
    ${value}    Get Kendo Value  ${txtMaxAuditLogHistory}
    [Return]    ${value}

Get E-mailserver (SMTP) field value
    ${value}    Get Value    ${txtEmailSettingsEmailServer}
    [Return]    ${value}

Get E-mailserver port (SMTP Port) field value
    ${value}    Get Kendo Value  ${txtEmailSettingsEmailServerPort}
    [Return]    ${value}

Get Sender field value
    ${value}    Get Value  ${txtEmailSettingsSender}
    [Return]    ${value}

Get Use SSL checkbox state
    ${chkbox}   Is Element Checked  ${chkEmailSettingsUseSSL}
    [Return]    ${chkbox}

Get Username textbox field value
    ${value}    Get Value    ${txtEmailSettingsUserName}
    [Return]    ${value}

Get Password textbox field value
    ${value}    Get Value    ${txtEmailSettingsPassword}
    [Return]    ${value}

Verify No Manage System On System Settings Page
    Page Should Contain Element    ${btnSaveSystemSetting}.disabled
    Page Should Contain Element    ${btnShowTestEmailSettingPopup}.disabled