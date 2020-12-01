*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
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
    [Setup]  Import Angle By API  /models/1  ANGLE_DrilldownTesting.json  user=${Username}
    
    Drilldown Chart Display With Floating Number

    [Teardown]  Clean Up Items And Go To Search Page

Verify Chart Options Data Labels Functionality
    [Tags]      TC_C432358
    [Documentation]     This exploratory test to cover Chart options > Data Labels
    [Setup]  Import Angle By API  /models/1  ANGLE_ChartOptionsDataLabelsTest.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ANGLE_ChartOptionsDataLabelsTest
    Chart Options Data Labels Functionality
    [Teardown]  Clean Up Items And Go To Search Page