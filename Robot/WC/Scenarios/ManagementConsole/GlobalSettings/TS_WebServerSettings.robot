*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/WebServerSettings.robot

*** Keywords ***
Go To Web Server Settings Page
    Go To MC Page  /Global%20settings/Web%20Server%20settings/
    Wait Web Server Settings Page Ready

Verify Web Server Settings Page Is Ready
    Page Should Contain Element    ${txtApplicationServerTimeout}
    Page Should Contain Element    ${chkShowItemID}
    Page Should Contain Element    ${txtItemInMassChange}
    Page Should Contain Element    ${txtAngleOnDashboard}
    Page Should Contain Element    ${txtDashboardRefreshInterval}
    Page Should Contain Element    ${txtGoogleAnalyticsID}
    Page Should Contain Element    ${chkUriInErrorPopup}
    Page Should Contain Element    ${chkEnableOptimizations}
    Page Should Contain Element    ${txtMaxLogfiles}
    Page Should Contain Element    ${txtMaxSizeOfLogfile}

Read The Content From Input Fields

    ${value}   Get the Application server timeout value
    Set Global Variable    ${applicationServerTimeOutDef}      ${value}

    ${value}       Get the Show item ID'S selected value
    Set Test Variable   ${showItemIdsDef}   ${value}

    ${value}     Get the Item in mass change value
    Set Global Variable    ${itemInMassChangeDef}      ${value}
    
    ${value}    Get the Angles on dashboard value
    Set Global Variable    ${anglesOnDashboardDef}      ${value}

    ${value}     Get the Dashboard refresh interval value
    Set Global Variable    ${dashboardRefreshIntervalDef}      ${value}

    ${value}    Get the Google Analytics ID'S selected value
    Set Global Variable    ${googleAnalyticsIDDef}      ${value}
   
    ${value}    Get the Enable Go to SAP selected value
    Set Test Variable   ${enableGotoSapDef}   ${value}

    ${value}    Get the Show uri in error popup selected value
    Set Test Variable   ${showUriInErrorGroupDef}   ${value}

    ${value}    Get the Enable optimizations selected value
    Set Test Variable   ${enableOptimizationsDef}   ${value}
    
    ${value}  Get the Max logfiles value
    Set Global Variable    ${maxLogfilesDef}      ${value}

    ${value}     Get the Max size logfile value
    Set Global Variable    ${maxSizeOfLogfileDef}      ${value} 

Edit The Content From Input Fields
  
    Input Web Server Settings Application Server Timeout     91

    Select the Show item IDs check box      True

    Input Web Server Settings Item In Mass Change   1001

    Input Web Server Settings Angle On Dashboard    8

    Input Web Server Settings Dashboard Refresh Interval    16

    Input Web Server Settings Google Analytics ID   UA-12345678-1
    
    Select the Enable Go to SAP checkbox     True
   
    Select the Show uri in error popup checkbox     True
    
    Select the Enable optimizations checkbox    True

    Input Web Server Settings Max Logfiles  10

    Input Web Server Settings Max size Of logfile   5

Verify The Edited Input Values

    Verify the Appication server timeout selected value     91

    ${returnText}   Get the Show item ID'S selected value
    Should Be True      ${returnText}

    Verify the Item in mass change selected value   1001   

    Verify the Angles on dashboard selected value   8

    Verify the Dashboard refresh interval selected value     16

    Verify the Google Analytics ID given value  UA-12345678-1 

    ${returnText}   Get the Enable Go to SAP selected value
    Should Be True      ${returnText}

    ${returnText}   Get the Show uri in error popup selected value
    Should Be True      ${returnText}

    ${returnText}   Get the Enable optimizations selected value
    Should Be True      ${returnText}

    Verify the Max logfiles selected value  10

    Verify the Max size of logfile selected value   5
  
Restore Old Input Values

    Input Web Server Settings Application Server Timeout    ${applicationServerTimeOutDef}
  
    Select the Show item IDs check box      ${showItemIdsDef}

    Input Web Server Settings Item In Mass Change   ${itemInMassChangeDef}   

    Input Web Server Settings Angle On Dashboard    ${anglesOnDashboardDef}

    Input Web Server Settings Dashboard Refresh Interval    ${dashboardRefreshIntervalDef}

    Input Web Server Settings Google Analytics ID       ${googleAnalyticsIDDef} 

    Select the Enable Go to SAP checkbox    ${enableGotoSapDef}

    Select the Show uri in error popup checkbox     ${showUriInErrorGroupDef}

    Select the Enable optimizations checkbox    ${enableOptimizationsDef}

    Input Web Server Settings Max Logfiles  ${maxLogfilesDef}

    Input Web Server Settings Max size Of logfile   ${maxSizeOfLogfileDef}

    

    
    
    
  