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
${txtDefaultMaximumExportPageSize}      css=#default_max_export_page_size

${txtEmailSettingsEmailServer}          EmailSettings_smtp_server
${txtEmailSettingsEmailServerPort}      EmailSettings_smtp_port
${txtEmailSettingsSender}               EmailSettings_smtp_sender
${chkEmailSettingsUseSSL}               smtp_use_ssl
${txtEmailSettingsUserName}             EmailSettings_username
${txtEmailSettingsPassword}             EmailSettings_password

${btnShowTestEmailSettingPopup}         TestEmailButton
${txtEmailSettingsRecipient}            EmailSettings_recipient
${btnSubmitTestEmailSetting}            css=#TestEmailPopup .btnPrimary
${btnCloseTestEmailSetting}             css=#TestEmailPopup .btnClose

${divTestEmailReport}                   css=#TestEmailResult
${pgbTestEmailReport}                   css=#TestEmailResult .k-loading-mask
${btnCloseTestEmailReport}              css=#TestEmailResult_wnd_title + .k-window-actions .k-i-close


*** Keywords ***
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
    Wait Until Page Contains Element    ${chkEmailSettingsUseSSL}
    Click Element    ${chkEmailSettingsUseSSL}

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