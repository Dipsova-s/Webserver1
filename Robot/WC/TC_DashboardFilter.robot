*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Logout WC Then Close Browser
Test Setup          Go To    ${URL_WC}
Test Teardown       Force Logout WC
Force Tags        	acceptance    acc_wc

*** Variables ***
${ANGLENAME}                    Plant For Dashboard Filter  
${ANGLE_KEYWORD}                "For Dashboard Filter"

${DASHBOARD_FILTER_CASE#1}      Dashboard Filter Add From Dashboard Name
${DASHBOARD_FILTER_CASE#2}      Dashboard Filter Add From Filter Panel

*** Test Cases ***
Verify When Angle That Used In The Dashboard Have Filter, And Dashboard Have Filter Itself#1 (Step10,Step11)
    Login To WC By Admin User
    Search By Text    ${ANGLENAME} 
    Click Select First Item From Search Result
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${DASHBOARD_FILTER_CASE#1} 
    Save Dashboard
    Open Dashboard Detail Popup From Dashboard Name    ${DASHBOARD_FILTER_CASE#1}
    Click Dashboard Detail FieldandFilter Tab
    Click Add Filter Button In Dashboard Detail Popup
    Select Field From FieldandFilter Tab    "plant"    Plant
    Choose Dropdown Filter Operator In FieldandFilter Tab    0    is equal to
    Input Filter Value     1000 (werk Hamburg)
    Choose Value In Dropdown List
    Save Dashboard
    Go to Search Page
    Search Dashboard From Search Page And Open It    ${DASHBOARD_FILTER_CASE#1} 
    Open Dashboard Detail Popup From Dashboard Name    ${DASHBOARD_FILTER_CASE#1}
    Click Dashboard Detail FieldandFilter Tab  
    Verify Dashboard Filter Still Showing    0    is equal to 1000 (Werk Hamburg) 
#   Click Editing Filter
#   Verify Editing Filter Popup
    Back To Search And Delete Dashboard Are Created    ${DASHBOARD_FILTER_CASE#1}


Verify apply multi filter to dashboard (Step9,Step14)
    Login To WC By Admin User
    Search By Text    ${ANGLE_KEYWORD} 
    Click Search Action Select All
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${DASHBOARD_FILTER_CASE#2} 
    Save Dashboard
    Open Filter From Dashboard Filter Panel
    Click Add Filter Button In Dashboard Detail Popup
    Select Field From FieldandFilter Tab    "Address"    ADRNR
    Input Filter Input Text In List    0    Stress
    Click Add Filter Button In Dashboard Detail Popup
    Select Field Source(Self) From FieldandFilter Tab
    Select Field From FieldandFilter Tab    "Created on"    ERSDA
    Input Date Value    1_0    May/24/2016
    Click Add Filter From Field    2
    Choose Dropdown Filter Operator In FieldandFilter Tab    2    is after
    Input Date Value    2_0    March/24/2016    
    Click Add Filter Button In Dashboard Detail Popup
    Select Field From FieldandFilter Tab    "Plant"    Plant
    Select Checkbox Value List     2
    Select Checkbox Value List     3
    Save Dashboard 
    Verify Dashboard Filters Count    4 
#   Remove Field In FieldandFilter Tab
    Back To Search And Delete Dashboard Are Created  ${DASHBOARD_FILTER_CASE#2}
