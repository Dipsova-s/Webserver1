*** Variables ***
${btnSaveWebServerSetting}        css=.btnSave
${btnLoadingClose}                css=#loading .loadingClose

${txtApplicationServerTimeout}    AjaxTimeoutExpirationInSeconds
${chkShowItemID}                  ShowAngleAndDisplayID
${txtItemInMassChange}            MaxNumberOfMassChangeItems
${txtAngleOnDashboard}            MaxNumberOfDashboard
${txtDashboardRefreshInterval}    DashboardRefreshIntervalTime
${txtGoogleAnalyticsID}           GoogleAnalyticsId
${chkEnableGoToSAP}               EnableGoToSAP
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
    Sleep    ${TIMEOUT_MC_LOAD}
    # Wait Web Server Settings Page Ready

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
    log     ${applicationServerTimeout}
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
    [Arguments]    ${googleAnalyticsId}
    Input Text      ${txtGoogleAnalyticsID}    ${googleAnalyticsId} 
    
Click Web Server Settings Enable Go to SAP
    Wait Until Page Contains Element    ${chkEnableGoToSAP}
    Click Element    ${chkEnableGoToSAP}

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

Input Web Server Settings Max size Of logfile
    [Arguments]    ${maxSizeOfLogfile}
    Input kendo Numeric TextBox    ${txtMaxSizeOfLogfile}    ${maxSizeOfLogfile}

#Read Contents
Get the Application server timeout value
    ${text}     Get Value   ${txtApplicationServerTimeout}
    [Return]      ${text}

Get the Show item ID'S selected value
    ${chbox}    Is Element Checked  ${chkShowItemID}
    [Return]      ${chbox}

Get the Item in mass change value
    ${text}     Get Value   ${txtItemInMassChange}
    [Return]      ${text}

Get the Angles on dashboard value
    ${text}     Get Value   ${txtAngleOnDashboard}
    [Return]      ${text}

Get the Dashboard refresh interval value
    ${text}     Get Value   ${txtDashboardRefreshInterval}
    [Return]      ${text}

Get the Google Analytics ID'S selected value
    ${chbox}    Get Value    ${txtGoogleAnalyticsID}
    [Return]      ${chbox}

Get the Enable Go to SAP selected value
    ${chbox}    Is Element Checked  ${chkEnableGoToSAP}
    [Return]      ${chbox}

Get the Show uri in error popup selected value
    ${chbox}    Is Element Checked  ${chkUriInErrorPopup}
    [Return]      ${chbox}

Get the Enable optimizations selected value
    ${chbox}    Is Element Checked  ${chkEnableOptimizations}
    [Return]      ${chbox}

Get the Max logfiles value
    ${text}     Get Value   ${txtMaxLogfiles}
    [Return]      ${text}

Get the Max size logfile value
    ${text}     Get Value   ${txtMaxSizeOfLogfile}
    [Return]      ${text}

Select the Show item IDs check box
    [Arguments]     ${chbOption}
    Run Keyword If    ${chbOption} == True     Select Checkbox    ${chkShowItemID}
    Run Keyword If    ${chbOption} == False     Unselect Checkbox    ${chkShowItemID}

Select the Enable Go to SAP checkbox
    [Arguments]     ${chbOption}
    Run Keyword If    ${chbOption} == True     Select Checkbox    ${chkEnableGoToSAP}
    Run Keyword If    ${chbOption} == False     Unselect Checkbox    ${chkEnableGoToSAP}

Select the Show uri in error popup checkbox
    [Arguments]     ${chbOption}
    Run Keyword If    ${chbOption} == True     Select Checkbox    ${chkUriInErrorPopup}
    Run Keyword If    ${chbOption} == False     Unselect Checkbox    ${chkUriInErrorPopup}

Select the Enable optimizations checkbox
     [Arguments]     ${chbOption}
    Run Keyword If    ${chbOption} == True     Select Checkbox    ${chkEnableOptimizations}
    Run Keyword If    ${chbOption} == False     Unselect Checkbox    ${chkEnableOptimizations}

#Verify
Verify the Appication server timeout selected value
    [Arguments]     ${text}
    Textfield value should be    ${txtApplicationServerTimeout}     ${text}
   
Verify the Item in mass change selected value
    [Arguments]     ${text}
    Textfield value should be    ${txtItemInMassChange}     ${text}

Verify the Angles on dashboard selected value
    [Arguments]     ${text}
    Textfield value should be    ${txtAngleOnDashboard}     ${text}

Verify the Dashboard refresh interval selected value
    [Arguments]     ${text}
    Textfield value should be    ${txtDashboardRefreshInterval}     ${text}

Verify the Google Analytics ID given value
    [Arguments]     ${text}
    Textfield value should be    ${txtGoogleAnalyticsID}     ${text}

Verify the Max logfiles selected value
    [Arguments]     ${text}
    Textfield value should be    ${txtMaxLogfiles}     ${text}

Verify the Max size of logfile selected value
    [Arguments]     ${text}
    Textfield value should be    ${txtMaxSizeOfLogfile}     ${text}
