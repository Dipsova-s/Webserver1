*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemSettings.robot

*** Keywords ***
Go To System Settings Page
    Go To MC Page    Global%20settings/System%20settings/
    Wait System Settings Page Ready

Prepare No Manage System User
    Create Context: Web
    ${user}  Get User By Name  EATestUserRole
    ${uri}  Get Uri From Response  ${user}
    ${roles}  Get User Roles  ${user}
    ${roles}  Stringify Json  ${roles}
    Set Test Variable  ${TEST_USER_URI}  ${uri}
    Set Test Variable  ${TEST_USER_ROLES}  ${roles}
    Create Context: Web
    Update User Roles  ${uri}  [{"role_id":"EA2_800_ALL","model_id":"EA2_800"}]}]

Restore No Manage System User
    Create Context: Web
    Update User Roles  ${TEST_USER_URI}  ${TEST_USER_ROLES}

Verify System Settings Page Is Ready
    Page Should Contain Element    ${lbApplicationServerUri}
    Page Should Contain Element    ${txtDefaultPageSize}
    Page Should Contain Element    ${txtMaxPageSize}
    Page Should Contain Element    ${txtSessionTimeout}
    Page Should Contain Element    ${txtSessionHistory}
    Page Should Contain Element    ${txtPollModelserver}
    Page Should Contain Element    ${txtModelServerTimeout}
    Page Should Contain Element    ${txtModelServerMetadataTimeout}
    Page Should Contain Element    ${txtMaxDomainSizeForSearch}
    Page Should Contain Element    ${txtCacheValidity}
    Page Should Contain Element    ${txtMinimumNumberOfLabelCategories}
    Page Should Contain Element    ${txtCheckExpiredSessionMinutes}
    Page Should Contain Element    ${txtInstancesToKeepPerModel}
    Page Should Contain Element    ${txtActiveDirectlySizeLimit}
    Page Should Contain Element    ${txtEmailSettingsEmailServer}
    Page Should Contain Element    ${txtEmailSettingsEmailServerPort}
    Page Should Contain Element    ${txtEmailSettingsSender}
    Page Should Contain Element    ${chkEmailSettingsUseSSL}
    Page Should Contain Element    ${txtEmailSettingsUserName}
    Page Should Contain Element    ${txtEmailSettingsPassword}
    Page Should Contain Element    ${txtFallbackFieldLength}

Verify Instance To Keep Per Model
    ${oldValue}     Get System Settings Check Instances To Keep Per Model
    Input System Settings Check Instances To Keep Per Model      0
    System Settings Check Instances To Keep Per Model Should Be One
    Input System Settings Check Instances To Keep Per Model      ${oldValue}

Verify Input Invalid Email Settings
    Scroll Vertical    ${mainContent}    500
    Click Show Test Email Setting Popup
    Input Email Recipient    robot@domain.invalid
    Click Test Email Setting
    Page Should Contain    Please enter a valid email address
    Close Test Email Setting Popup

Verify SSL Email Settings
    ${emailSsl}    Is Element Checked    ${chkEmailSettingsUseSSL}
    ${emailUsername}    Get Value    ${txtEmailSettingsUserName}

    Scroll Vertical    ${mainContent}    500
    #Set Email Settings Use SSL
    Input Email Settings Username    robot
    
  
    # Restore default settings
    Scroll Vertical    ${mainContent}    500
    Run Keyword If    ${emailSsl} == True    Unset Email Settings Use SSL
    #Run Keyword If    ${emailSsl} == False    Set Email Settings Use SSL
    Input Email Settings Username    ${emailUsername}
    Click Save System Settings

Verify Default Maximum Export Page Size Is Exist
    Page Should Contain Element    ${txtDefaultMaximumExportPageSize}

Get the System Settings page field values
    ${value}   Get Default page size field value
    Set Test Variable   ${txtDefaultPageSizeValue}     ${value}
    ${value}   Get Max Page size field value
    Set Test Variable   ${txtMaxPageSizeValue}     ${value}
    ${value}   Get Session timeout field value
    Set Test Variable   ${txtSessionTimeoutValue}     ${value}
    ${value}   Get Session history field value
    Set Test Variable   ${txtSessionHistoryValue}     ${value}
    ${value}   Get Poll model server field value
    Set Test Variable   ${txtPollModelserverValue}     ${value}
    ${value}   Get Model server timeout field value
    Set Test Variable   ${txtModelServerTimeoutValue}     ${value}
    ${value}   Get Model server metadata timeout [seconds] field value
    Set Test Variable   ${txtModelServerMetadataTimeoutValue}     ${value}
    ${value}   Get Max domain size for search field value
    Set Test Variable   ${txtMaxDomainSizeForSearchValue}     ${value}
    ${value}   Get Cache validity field value
    Set Test Variable   ${txtCacheValidityValue}     ${value}
    ${value}   Get Minimum number of label categories to publish angle field value
    Set Test Variable   ${txtMinimumNumberOfLabelCategoriesValue}     ${value}
    ${value}   Get Check expired sessions minutes field value
    Set Test Variable   ${txtCheckExpiredSessionMinutesValue}     ${value}
    ${value}   Get System Settings Check Instances To Keep Per Model
    Set Test Variable   ${txtInstancesToKeepPerModelValue}     ${value}
    ${value}   Get Active directory size limit field value
    Set Test Variable   ${txtActiveDirectlySizeLimitValue}     ${value}
    ${value}   Get Default maximum export page size field value
    Set Test Variable   ${txtDefaultMaximumExportPageSizeValue}     ${value}

    ${value}   Get Enable Grouping in Pivot exports checkbox state
    Set Test Variable   ${chkEnableGroupingInPivotExportsValue}     ${value}
    ${value}   Get Include Self in export headers checkbox state
    Set Test Variable   ${chkIncludeSelfInExportHeadersValue}     ${value}

    ${value}   Get Program/scripts folder field value
    Set Test Variable   ${txtProgramScriptsFolderValue}     ${value}

    ${value}   Get Fallback Field Length field value
    Set Test Variable   ${txtFallbackFieldLengthValue}     ${value}

    ${value}   Get Max retention time log tables [months] field value
    Set Test Variable   ${txtMaxGeneralHistoryValue}     ${value}
    ${value}   Get Max audit log history [months] field value
    Set Test Variable   ${txtMaxAuditLogHistoryValue}     ${value}

    ${value}   Get E-mailserver (SMTP) field value
    Set Test Variable   ${txtEmailSettingsEmailServerValue}     ${value}
    ${value}   Get E-mailserver port (SMTP Port) field value
    Set Test Variable   ${txtEmailSettingsEmailServerPortValue}     ${value}
    ${value}   Get Sender field value
    Set Test Variable   ${txtEmailSettingsSenderValue}     ${value}
    ${value}   Get Use SSL checkbox state
    Set Test Variable   ${chkEmailSettingsUseSSLValue}     ${value}

    ${value}   Get Username textbox field value
    Set Test Variable   ${txtEmailSettingsUserNameValue}     ${value}
    ${value}   Get Password textbox field value
    Set Test Variable   ${txtEmailSettingsPasswordValue}     ${value}

Set the System settings page field values
    Input System Settings Default Page Size      ${txtDefaultPageSizeValue}
    Input System Settings Max Page Size     ${txtMaxPageSizeValue}
    Input System Settings Session Timeout   ${txtSessionTimeoutValue}
    Input System Settings Session History   ${txtSessionHistoryValue}
    Input System Settings Poll Models Server    ${txtPollModelserverValue}
    Input System Settings Model Server Timeout  ${txtModelServerTimeoutValue}
    Input System Settings Model Server Metadata Timeout     ${txtModelServerMetadataTimeoutValue}
    Input System Settings Max Domain Size For Search    ${txtMaxDomainSizeForSearchValue}
    Input System Settings Cache Validity    ${txtCacheValidityValue}
    Input System Settings Minimum Number Of Label Categories    ${txtMinimumNumberOfLabelCategoriesValue}
    Input System Settings Check Expired Session Minutes     ${txtCheckExpiredSessionMinutesValue}
    Input System Settings Check Instances To Keep Per Model     ${txtInstancesToKeepPerModelValue}
    Input System Settings Active Directory Size Limit   ${txtActiveDirectlySizeLimitValue}
    Input Default maximum export page size field  ${txtDefaultMaximumExportPageSizeValue}
    Input Fallback Field Length field  ${txtFallbackFieldLengthValue}

    ${chkEnableGroupingInPivotExportsValue}     Get Enable Grouping in Pivot exports checkbox state
    Set Enable Grouping in Pivot exports checkbox   ${chkEnableGroupingInPivotExportsValue}
    ${chkIncludeSelfInExportHeadersValue}     Get Include Self in export headers checkbox state
    Set Include Self in export headers checkbox     ${chkIncludeSelfInExportHeadersValue}
    

    Input Program/scripts folder field  ${txtProgramScriptsFolderValue}

    Input Max retention time log tables [months] field    ${txtMaxGeneralHistoryValue}
    Input Max audit log history [months] field      ${txtMaxAuditLogHistoryValue}

    Input Email Settings Email Server   ${txtEmailSettingsEmailServerValue}
    Input Email Settings Email Server Port      ${txtEmailSettingsEmailServerPortValue}
    Input Email Settings Sender     ${txtEmailSettingsSenderValue}

    ${chkEmailSettingsUseSSLValue}     Get Use SSL checkbox state
    Click Email Settings Use SSL    ${chkEmailSettingsUseSSLValue}
    
    Input Email Settings Username   ${txtEmailSettingsUserNameValue}
    Input Email Settings Password   ${txtEmailSettingsPasswordValue}

Fill the System settings page field values
    Input System Settings Default Page Size      31
    Input System Settings Session Timeout   61
    Input System Settings Session History   121
    Input System Settings Poll Models Server    11
    Input System Settings Model Server Timeout  31
    Input System Settings Model Server Metadata Timeout     301
    Input System Settings Max Domain Size For Search    101
    Input System Settings Cache Validity    11
    Input System Settings Minimum Number Of Label Categories    2
    Input System Settings Check Expired Session Minutes     2
    Input System Settings Check Instances To Keep Per Model     6
    Input System Settings Active Directory Size Limit   301
    Input Default maximum export page size field  1001
    Input Fallback Field Length field  255

    ${chkEnableGroupingInPivotExportsValue}     Get Enable Grouping in Pivot exports checkbox state
    Set Enable Grouping in Pivot exports checkbox   ${chkEnableGroupingInPivotExportsValue}
    ${chkIncludeSelfInExportHeadersValue}     Get Include Self in export headers checkbox state
    Set Include Self in export headers checkbox     ${chkIncludeSelfInExportHeadersValue}

    Input Program/scripts folder field  program

    Input Max retention time log tables [months] field    28
    Input Max audit log history [months] field      28

    Input Email Settings Email Server   smtp1.everyangle.org
    Input Email Settings Email Server Port      26
    Input Email Settings Sender     testserver1@everyangle.com
    ${chkEmailSettingsUseSSLValue}     Get Use SSL checkbox state
    Click Email Settings Use SSL    ${chkEmailSettingsUseSSLValue}
    Input Email Settings Username   username
    Input Email Settings Password   password

Verify the System Settings page field values
    ${returnText}  Get Default page size field value
    ${expectedText}     Convert to Integer    31
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Session timeout field value
    ${expectedText}     Convert to Integer    61
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Session history field value
    ${expectedText}     Convert to Integer    121
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Poll model server field value
    ${expectedText}     Convert to Integer    11
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Model server timeout field value
    ${expectedText}     Convert to Integer    31
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Model server metadata timeout [seconds] field value
    ${expectedText}     Convert to Integer    301
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Max domain size for search field value
    ${expectedText}     Convert to Integer    101
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Cache validity field value
    ${expectedText}     Convert to Integer    11
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Minimum number of label categories to publish angle field value
    ${expectedText}     Convert to Integer    2
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Check expired sessions minutes field value
    ${expectedText}     Convert to Integer    2
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get System Settings Check Instances To Keep Per Model
    ${expectedText}     Convert to Integer    6
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Active directory size limit field value
    ${expectedText}     Convert to Integer    301
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Default maximum export page size field value
    ${expectedText}     Convert to Integer    1001
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Fallback Field Length field value
    ${expectedText}     Convert to Integer    255
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Enable Grouping in Pivot exports checkbox state
    ${expectedText}     Convert to Boolean    ${chkEnableGroupingInPivotExportsValue}
    Should Not be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Include Self in export headers checkbox state
    ${expectedText}     Convert to Boolean    ${chkIncludeSelfInExportHeadersValue}
    Should Not be equal     ${returnText}   ${expectedText}

    ${returnText}   Get Program/scripts folder field value
    ${expectedText}     Convert to string    program
    Should be equal     ${returnText}   ${expectedText}

    ${returnText}   Get Max retention time log tables [months] field value
    ${expectedText}     Convert to Integer    28
    Should be equal     ${returnText}   ${returnText}
    ${returnText}   Get Max audit log history [months] field value
    ${expectedText}     Convert to Integer    28
    Should be equal     ${returnText}   ${expectedText}

    ${returnText}   Get E-mailserver (SMTP) field value
    ${expectedText}     Convert to string    smtp1.everyangle.org
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get E-mailserver port (SMTP Port) field value
    ${expectedText}     Convert to Integer    26
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Sender field value
    ${expectedText}     Convert to string    testserver1@everyangle.com
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Use SSL checkbox state
    ${expectedText}     Convert to Boolean    ${chkEmailSettingsUseSSLValue}
    Should Not be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Username textbox field value
    ${expectedText}     Convert to string    username
    Should be equal     ${returnText}   ${expectedText}
    ${returnText}   Get Password textbox field value
    ${expectedText}     Convert to Integer    8
    Length Should be     ${returnText}   ${expectedText}

Get and change Active Directory Size Limit Value
    [Arguments]     ${ADSLValue}
    ${ADSLActualValue}      Get System Settings Active Directory Size Limit Value
    Set Global Variable     ${ADSLActualValue}      ${ADSLActualValue}
    Input System Settings Active Directory Size Limit       ${ADSLValue}
    Click Save System Settings

Restore Active Directory Size Limit Value   
    Input System Settings Active Directory Size Limit       ${ADSLActualValue}
    Click Save System Settings

Verify Text for info property of Program/Script folder
    Click Program/scripts folder textinfo Popup

Input Program/Script folder path and Save
    [Arguments]     ${Program/ScriptFolderPath}
    Input Program/scripts folder field      ${Program/ScriptFolderPath}
    Click Save System Settings

Verify Program/Script folder path saved correctly
    [Arguments]     ${Program/ScriptFolderPath}
    Verify Program/Script folder path      ${Program/ScriptFolderPath}