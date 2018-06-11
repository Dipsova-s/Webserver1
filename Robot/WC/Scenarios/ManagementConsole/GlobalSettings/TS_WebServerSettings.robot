*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/WebServerSettings.robot

*** Keywords ***
Go To Web Server Settings Page
    Wait Side Menu Ready
    Click Side Menu Global Settings
    Click Side Menu Web Server Settings
    Wait Web Server Settings Page Ready

Verify Web Server Settings Page Is Ready
    Page Should Contain Element    ${chkUseHTTPS}
    Page Should Contain Element    ${chkIgnoreCertificateError}
    Page Should Contain Element    ${txtApplicationServerTimeout}
    Page Should Contain Element    ${chkShowItemID}
    Page Should Contain Element    ${txtItemInMassChange}
    Page Should Contain Element    ${txtAngleOnDashboard}
    Page Should Contain Element    ${txtDashboardRefreshInterval}
    Page Should Contain Element    ${txtJWPlayerKey}
    Page Should Contain Element    ${txtGoogleAnalyticsID}
    Page Should Contain Element    ${chkUriInErrorPopup}
    Page Should Contain Element    ${chkEnableOptimizations}
    Page Should Contain Element    ${txtMaxLogfiles}
    Page Should Contain Element    ${txtMaxSizeOfLogfile}

Verify Input JWPlayer HTML Tag
    ${defaultJWPlayerText}    Get Web Server Settings JW Player Key Value
    Input Web Server Settings JW Player Key    <b>html</b>
    Click Save Web Server Setting
    Input Web Server Settings JW Player Key    ${defaultJWPlayerText}
    Click Save Web Server Setting