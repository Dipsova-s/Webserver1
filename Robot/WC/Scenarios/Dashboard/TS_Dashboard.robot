*** Settings ***
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardPage.robot
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Dashboard Execution Parameters
    Filter Angle With Execution Parameters For Dashboard
    Execute Dashboard From Angle With Execution Parameters
    Check Dashboard Execution Parameters Are Presented
    Change Dashboard Execution Parameters Then Execute
    Click Submit Adhoc Dashboard Execution Parameters
    Close Dashboard Detail Popup
    Open Angle In Dashboard Widget    0
    Check First Angle Should Apply Dashboard Execution Parameters
    Open Angle In Dashboard Widget    1
    Check Second Angle Should Apply Dashboard Execution Parameters

Execute Dashboard With Execution Parameters In Edit Mode
    [Arguments]   ${dashboardName}
    Filter Angle With Execution Parameters For Dashboard
    Execute Dashboard From Angle With Execution Parameters
    Check Dashboard Execution Parameters Are Presented
    Change Dashboard Execution Parameters Then Execute
    Click Submit Adhoc Dashboard Execution Parameters
    Input Dashboard Name    ${dashboardName}
    Save Dashboard
    Back To Search
    Search By Text And Expect In Search Result    ${dashboardName}
    Sleep    2s    Wait SOLR
    Click First Item Info Button
    Click Dashbaord Edit Mode Button Via Item Info Popup
    Click Execute Dashboard Action
    Click Submit Dashboard Execution Parameters
    Wait Progress Bar Closed
    Back To Search And Delete Dashboard Are Created    ${dashboardName}

################################################################################

Filter Angle With Execution Parameters For Dashboard
    Search By Text And Expect In Search Result    Angle for Dashboard Test
    Click Sort By Name Ascending On Search Page

Execute Dashboard From Angle With Execution Parameters
    Click Select All Items from Search Result
    Click Search Action Execute As Dashboard With Execution Parameters

Check Dashboard Execution Parameters Are Presented
    Wait Until Dashboard Execute Parameters Popup Loaded

Change Dashboard Execution Parameters Then Execute
    Change Dashboard First Filter Operator To Is Not Empty
    Change Dashboard Second Filter Equal To Partially open
    Input Filter Value For Is In List For Third Dashboard Filter    3745
    Input Filter Value For Is In List For Third Dashboard Filter    5550

Change Dashboard First Filter Operator To Is Not Empty
    Expand Dashboard Parameters First Filter Panel
    Choose First Dropdown Filter Operator Dashboard Parameters    is not empty
    sleep    2s

Change Dashboard Second Filter Equal To Partially open
    Expand Dashboard Parameters Second Filter Panel
    Choose Second Dropdown Filter Operator Dashboard Parameters    is equal to
    Input Second Filter Set Select Value Dashboard Parameters    Partially open

Input Filter Value For Is In List For Third Dashboard Filter
    [Arguments]   ${value}
    Expand Dashboard Parameters Third Filter Panel
    Input Filter Input Text In List    2    ${value}

Open Angle In Dashboard Widget
    [Arguments]    ${index}
    ${angleTitleName}    Get Widget Title For Angle Page    ${index}
    Open Dashboard Windget Menu    ${index}
    Click Link Go To Angle
    Wait Until Keyword Succeeds    30 sec    1 sec    Select Window    ${angleTitleName}
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Toggle Angle

Check First Angle Should Apply Dashboard Execution Parameters
    Page Should Contain    (Self) - Purchasing Document Category is not empty
    Page Should Contain    (Self) - Execution status is equal to Partially open
    Page Should Contain    Vendor - Vendor is in list (3745, 5550)
    Close Window
    Select Window

Check Second Angle Should Apply Dashboard Execution Parameters
    Page Should Contain    (Self) - Purchasing Document Category is not empty
    Page Should Contain    (Self) - Execution status is equal to Partially open
    Close Window
    Select Window

Create Dashboard With 2 Angles
    [Arguments]   ${dashboardName}
    Search By Text     Angle For
    Check Existing Angle From Search Result    Angle For General Test
    Check Existing Angle From Search Result    Test Angle For Validate
    Click Select First Item From Search Result
    Click Select Second Item From Search Result
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${dashboardName}
    Save Dashboard

Back To Search And Delete Dashboard Are Created
    [Arguments]   ${dashboardName}
    Back To Search
    Search By Text And Expect In Search Result    ${dashboardName}
    Sleep    2s    Wait SOLR
    Delete All Search Result Items
    Search By Text    ${dashboardName}
    Element Should Not Contain    ${gridSearchResult}    ${dashboardName}

Verify Dashboard Filters Count
    [Arguments]    ${expectFilterCount}
    ${filterText}    Get Text    ${ddlDashboardPanel} ${ddlDashboardFilterCount}
    Should Be Equal    ${filterText}    ${expectFilterCount}

Check First Angle Should Apply Dashboard Filters
    Page Should Contain    (Self) - Creation date is after May/24/2016
    Page Should Contain    (Self) - Creation date is before Mar/24/2016
    Close Window
    Select Window

Check Second Angle Should Apply Dashboard Filters
    Page Should Contain    (Self) - Plant is in list (0001 (Werk 0001), 0052 (Plant 0052))
    Close Window
    Select Window

Check Third Angle Should Apply Dashboard Filters
    Page Should Not Contain    (Self) - Address contains substring(s) (Stress)
    Close Window
    Select Window

Create Dashboard From Specific Angle Name
    [Arguments]    ${angleName}    ${dashboardName}
    Search By Text And Expect In Search Result    ${angleName} 
    Click Select First Item From Search Result
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${dashboardName} 
    Save Dashboard

Add Dashboard Filter From Dashboard Name
    Click Dashboard Name
    Click Dashboard Detail Filters Tab
    Click Add Filter Button In Dashboard Detail Popup
    Select Field From Filters Tab    "plant"    Plant
    Choose Dropdown Filter Operator In FilterField In Filters tab    0    is equal to
    Input Filter Set Select Value    0    1000 (Werk Hamburg)
    Save Dashboard

Verify Dashboard Filter Showing 
    [Arguments]    ${dashboardName}
    Back To Search
    Search Dashboard From Search Page And Open It    ${dashboardName} 
    Click Dashboard Name
    Click Dashboard Detail Filters Tab  
    Verify Dashboard Filter Still Showing    0    is equal to 1000 (Werk Hamburg) 
    Cancel Dashboard

Verify Editing Dashboard Filter
    Click Editing From Dashboard Filter Panel
    Verify Editing Filter Popup    0    (Self) - Plant is equal to 1000 (Werk Hamburg)
    Cancel Edit Dashboard

Create Dashboard From Many Angles
    [Arguments]    ${angleKeyword}    ${dashboardName}
    Search By Text And Expect In Search Result    ${angleKeyword}
    Click Sort By Name Ascending On Search Page
    Click Search Action Select All
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${dashboardName} 
    Save Dashboard

Add Dashboard Filter From Dashboard Filter Panel
    Open Filter From Dashboard Filter Panel
    Click Add Filter Button In Dashboard Detail Popup
    Select Field From Filters Tab    "Address"    ADRNR
    Input Filter Input Text In List    0    Stress
    Click Add Filter Button In Dashboard Detail Popup
    Select Field Source(Self)
    Select Field From Filters Tab    "Created on"    ERSDA
    Input Date Value    1_0    May/24/2016
    Click Add Filter From Field    2
    Choose Dropdown Filter Operator In FilterField In Filters tab    2    is before
    Input Date Value    2_0    Mar/24/2016
    Click Add Filter Button In Dashboard Detail Popup
    Select Field From Filters Tab    "Plant"    Plant
    Select Checkbox Value List     2
    Select Checkbox Value List     3
    Save Dashboard 

Verify Remove Field In Fields Tab
    Open Filter From Dashboard Filter Panel
    Remove Field In Fields Tab    0
    Save Dashboard 

Verify Editing Filter Popup
    [Arguments]    ${index}    ${expectFilterText} 
    Wait Until Element Exist And Visible    ${divPopupListFilter}
    ${filterText}    Get Text    css=#FilterHeader-${index} .filterText  
    Should Be Equal    ${filterText}    ${expectFilterText}  