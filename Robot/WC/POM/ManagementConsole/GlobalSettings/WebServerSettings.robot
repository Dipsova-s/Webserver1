*** Variables ***
${btnSaveWebServerSetting}        css=.btnSave
${btnLoadingClose}                jquery=#LoaderContainer .loader-cancel-button:visible

${txtApplicationServerTimeout}    AjaxTimeoutExpirationInSeconds
${chkShowItemID}                  ShowAngleAndDisplayID
${txtItemInMassChange}            MaxNumberOfMassChangeItems
${txtAngleOnDashboard}            MaxNumberOfDashboard
${txtDashboardRefreshInterval}    DashboardRefreshIntervalTime
${txtGoogleAnalyticsID}           GoogleAnalyticsId

${chkUriInErrorPopup}             ShowErrorSourceUri
${chkEnableOptimizations}         EnableOptimizations
${txtMaxLogfiles}                 MaxLogFileNumber
${txtMaxSizeOfLogfile}            MaxLogFileSize

${lblApplicationServerTimeout}    Application server timeout

*** Keywords ***
Wait Web Server Settings Page Ready
    Wait MC Progress Bar Closed
    Wait Until Page Contains    ${lblApplicationServerTimeout}
    Sleep    ${TIMEOUT_GENERAL}

Click Save Web Server Setting
    Wait Until Element Is Visible    ${btnSaveWebServerSetting}
    Click Element    ${btnSaveWebServerSetting}
    Wait Web Server Settings Page Ready

Click Save Web Server Setting And Expect Error
    [Arguments]    ${message}
    Wait Until Element Is Visible    ${btnSaveWebServerSetting}
    Click Element    ${btnSaveWebServerSetting}
    Wait Until Element Is Visible    ${btnLoadingClose}
    Page Should Contain    ${message}
    Click Element    ${btnLoadingClose}

#General
Input Web Server Settings Application Server Timeout
    [Arguments]    ${applicationServerTimeout}
    Input kendo Numeric TextBox    ${txtApplicationServerTimeout}    ${applicationServerTimeout}

Click Web Server Settings Show Item ID
    Wait Until Page Contains Element    ${chkShowItemID}
    Click Element    ${chkShowItemID}

Input Web Server Settings Item In Mass Change
    [Arguments]    ${itemInMassChange}
    Input kendo Numeric TextBox    ${txtItemInMassChange}    ${itemInMassChange}

Input Web Server Settings Angle On Dashboard
    [Arguments]    ${angleOnDashboard}
    Input kendo Numeric TextBox    ${txtAngleOnDashboard}    ${angleOnDashboard}

Input Web Server Settings Dashboard Refresh Interval
    [Arguments]    ${dashboardRefreshInterval}
    Input kendo Numeric TextBox    ${txtDashboardRefreshInterval}    ${dashboardRefreshInterval}

Input Web Server Settings Google Analytics ID
    [Arguments]    ${googleAnalyticsID}
    Input Text    ${txtGoogleAnalyticsID}    ${googleAnalyticsID}

#Troubleshooting
Click Web Server Settings Show Uri In Error Popup
    Wait Until Page Contains Element    ${chkUriInErrorPopup}
    Click Element    ${chkUriInErrorPopup}

Click Web Server Settings Enable Optimizations
    Wait Until Page Contains Element    ${chkEnableOptimizations}
    Click Element    ${chkEnableOptimizations}

Input Web Server Settings Max Logfiles
    [Arguments]    ${maxLogfile}
    Input kendo Numeric TextBox    ${txtMaxLogfiles}    ${maxLogfile}

Input Web Server Settings Max Size Of Logfile
    [Arguments]    ${maxSizeOfLogfile}
    Input kendo Numeric TextBox    ${txtMaxSizeOfLogfile}    ${maxSizeOfLogfile}