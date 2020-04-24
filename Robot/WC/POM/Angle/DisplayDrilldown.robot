*** Settings ***
Resource            ${EXECDIR}/WC/POM/Angle/AngleSidePanel.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayTabMenu.robot

*** Variables ***

${defaultDrilldownId}               DefaultDrilldown
${ddlDefaultDrilldown}              DefaultDrilldown_ddlWrapper
${defaultDrilldownSection}          jquery=.section-default-drilldown
${sidebarPanel}                     jquery=#TabContentDisplay

*** Keywords ***
Go To Display And Open Display Tab
    [Arguments]     ${displayName}
    Select Display Tab By Name      ${displayName}
    Click Display Tab

Default Drilldown Section Should Not Show
    Element Should Not Be Visible   ${defaultDrilldownSection} 

Default Drilldown Section Should Show
    Element Should Be Visible   ${defaultDrilldownSection} 

Get Selected Default Drilldown Display
    ${value}    Get Kendo Text  ${defaultDrilldownId}
    [Return]  ${value}

Set Default Drilldown Display
    [Arguments]     ${displayToDrilldown}
    Select Dropdown By InnerText    ${ddlDefaultDrilldown}    ${displayToDrilldown}
 
Scroll To Default Drilldown Display 
    Mouse Over                      ${sidebarPanel}
    Scroll Vertical To Element      ${sidebarPanel}    jquery=#${ddlDefaultDrilldown}
