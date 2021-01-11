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
    Scroll Vertical    ${mainContent}    500
    Page Should Contain Element    ${txtDefaultApprovalState}

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

Verify Default Approval State Automation task Actions Setting Lists
    ${expected}     Create list   approved  disabled  requested   rejected
    ${approvalStateListInAction}     Get Default Approval State Automation task Actions Dropdown
    Lists Should Be Equal   ${approvalStateListInAction}    ${expected}
    