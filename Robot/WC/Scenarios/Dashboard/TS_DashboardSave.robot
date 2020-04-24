*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/DashboardPage.robot
Resource            ${EXECDIR}/WC/POM/Shared/FilterEditor.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/SaveDashboardAsPopup.robot

*** Keywords ***
Verify EAPower: Dashboard Save Buttons Privilege
    Dashboard Save Button Should Be Available
    Dashboard Save Button Is Save All
    Dashboard Save Button Should Be Disabled

Verify EAViewer: Dashboard Save Buttons Privilege
    [Arguments]    ${dashboardID}
    Go to WC Then Login With EAViewer User
	Find Dashboard By ID Then Execute The First Dashboard    ${dashboardID} 
    Dashboard Save Button Should Be Available
    Dashboard Save Button Should Be Enable
    Dashboard Save Button Is Save Dashboard As
    Save All Dashboard Should Not Be Available
    
    Logout WC Then Close Browser
    Switch Browser  1

Verify EABasic: Dashboard Save Buttons Privilege
    [Arguments]    ${dashboardID}
    Go to WC Then Login With EABasic User
	Find Dashboard By ID Then Execute The First Dashboard    ${dashboardID} 
    Dashboard Save Button Should Not Available
    Logout WC Then Close Browser
    Switch Browser  1

Verify Dashboard Save All Button
    Add Filter      "Material Value"           MaterialValue       ${TRUE}
    Click Apply Dashboard Filter
    Dashboard Save Button Should Be Enable
    Click Dashboard Save All
    Dashboard Save Button Should Be Disabled
    Check Filter Asterisk Should Not Be Available
    Check Undo Filter Should Not Be Available
    Apply Filter Button Should Be Disable

Verify Save Dashboard As Button
    [Arguments]    ${dashboardName}
    Click Save Dashboard As
    Input Name In Save Dashboard As Popup    ${dashboardName}
    Save Dashboard As
    Dashboard Name Should Be    ${dashboardName}
    Click Caret Of Dashboard Save Button
    Dashboard Save As Button Should Be Available