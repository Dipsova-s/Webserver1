*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Variables ***
${ANGLENAME}                    Plant for Dashboard filter
${ANGLE_KEYWORD}                For Dashboard Filter

${DASHBOARD_FILTER_CASE#1}      Dashboard Filter Add From Dashboard Name
${DASHBOARD_FILTER_CASE#2}      Dashboard Filter Add From Filter Panel

*** Test Cases ***
Verify When Angle That Used In The Dashboard Have Filter, And Dashboard Have Filter Itself#1 (Step10,Step11)
    Create Dashboard From Specific Angle Name    ${ANGLENAME}    ${DASHBOARD_FILTER_CASE#1}
    Add Dashboard Filter From Dashboard Name
    Verify Dashboard Filter Showing    ${DASHBOARD_FILTER_CASE#1}
    Verify Editing Dashboard Filter
    Back To Search And Delete Dashboard Are Created    ${DASHBOARD_FILTER_CASE#1} 

Verify Apply Multi Filter To Dashboard (Step9,Step14)
    Create Dashboard From Many Angles     ${ANGLE_KEYWORD}    ${DASHBOARD_FILTER_CASE#2} 
    Add Dashboard Filter From Dashboard Filter Panel 
    Verify Dashboard Filters Count    4
    Verify Remove Field In Fields Tab
    Verify Dashboard Filters Count    3
    Open Angle In Dashboard Widget    0
    Check First Angle Should Apply Dashboard Filters
    Open Angle In Dashboard Widget    1
    Check Second Angle Should Apply Dashboard Filters
    Open Angle In Dashboard Widget    2
    Check Third Angle Should Apply Dashboard Filters
    Back To Search And Delete Dashboard Are Created    ${DASHBOARD_FILTER_CASE#2}  