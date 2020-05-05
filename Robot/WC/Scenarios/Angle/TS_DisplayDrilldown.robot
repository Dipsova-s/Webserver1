*** Settings ***
Resource            ${EXECDIR}/WC/POM/Angle/AngleSidePanel.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayTabMenu.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayChart.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayDrilldown.robot
Resource            ${EXECDIR}/WC/POM/Angle/AnglePage.robot
  
*** Keywords ***
Go To Display And Set Default Drilldown
    [Arguments]     ${displayName}      ${displayToDrilldown}
    Go To Display And Open Display Tab      ${displayName}
    Scroll To Default Drilldown Display
    Set Default Drilldown Display    ${displayToDrilldown}

Verify Drilldown Display Value After Saving
    [Arguments]     ${displayName}      ${displayToDrilldown}
    Click Save All
    Reload Angle Page
    Verify Selected Default Drilldown Display   ${displayToDrilldown}

Verify Asterisk Is Shown
    [Arguments]     ${displayName}
    Display Should Mark As UnSaved     ${displayName}

Verify Display Remember Drilldown Display
    [Arguments]     ${displayName}      ${displayToDrilldown}
    Go To Display And Set Default Drilldown     ${displayName}     ${displayToDrilldown}
    Go To Display And Open Display Tab          ${displayToDrilldown}
    Go To Display And Open Display Tab          ${displayName}   
    Verify Selected Default Drilldown Display   ${displayToDrilldown}

Verify Adhoc Display Drilldown Correctly
    [Arguments]     ${displayName}      ${displayToDrilldown}
    Go To Display And Set Default Drilldown      ${displayName}      ${displayToDrilldown}
    Click First Bar In Column Chart
    ${displayType}      Get Current Display Type
    Should Be Equal    ${displayType}    chart
 
Verify Selected Default Drilldown Display
    [Arguments]     ${displayToDrilldown}
    ${drilldownDisplay}     Get Selected Default Drilldown Display
    Should be equal   ${displayToDrilldown}    ${drilldownDisplay}