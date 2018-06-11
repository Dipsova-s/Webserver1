*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemSettings.robot

*** Keywords ***
Go To System Settings Page
    Wait Side Menu Ready
    Click Side Menu Global Settings
    Click Side Menu System Settings
    Wait System Settings Page Ready

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