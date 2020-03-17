*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc      

*** Test Cases ***
Verify Chart Options Are Presented
    [Tags]  acc_wc_aci
    Chart Options Are Presented

Verify Chart Options Axis Scale Functionality
    Chart Options Axis Scale Functionality

Verify Chart Display Drilldown Test
    Drilldown Chart Display

Verify Chart Display Drilldown With Floating Number Test
    [Tags]  acc_wc_aci
    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_DrilldownTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true
    Drilldown Chart Display With Floating Number
    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}    user=${Username}
    ...         AND           Go to Search Page