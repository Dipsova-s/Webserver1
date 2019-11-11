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

Create Achoc Dashboard
    [Arguments]   ${searchAngles}
    Search By Text And Expect In Search Result    ${searchAngles}
    Click Sort By Name Ascending In Search Page
    Click Search Action Select All
    Click Search Action Execute As Dashboard

################################################################################

Filter Angle With Execution Parameters For Dashboard
    Search By Text And Expect In Search Result    Angle for Dashboard Test
    Click Sort By Name Ascending In Search Page

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
    Show Dashboard Widget Menu    ${index}
    Click Link Go To Angle    ${index}
    Select Window    NEW
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Toggle Angle

Check First Angle Should Apply Dashboard Execution Parameters
    Page Should Contain    (Self) - Purchasing Document Category is not empty
    Page Should Contain    (Self) - Execution status is equal to Partially open
    Page Should Contain    Vendor - Vendor is in list (3745, 5550)
    Close Window
    Select Window   MAIN

Check Second Angle Should Apply Dashboard Execution Parameters
    Page Should Contain    (Self) - Purchasing Document Category is not empty
    Page Should Contain    (Self) - Execution status is equal to Partially open
    Close Window
    Select Window   MAIN

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

Total Filters In Dashboard Should Be Equal
    [Arguments]    ${expectFilterCount}
    ${filterText}    Get Text    ${ddlDashboardPanel} ${ddlDashboardFilterCount}
    Should Be Equal    ${filterText}    ${expectFilterCount}

Verify Filters In Angle When Open Angle From Dashboard Page
    [Arguments]    ${widgetIndex}    ${expectedFilterTexts}=''    ${unExpectedFilterTexts}=''
    Open Angle In Dashboard Widget    ${widgetIndex}

    Run Keyword If  ${expectedFilterTexts}!=''    Page Should Contain Text List    ${expectedFilterTexts}
    Run Keyword If  ${unExpectedFilterTexts}!=''    Page Should Not Contain Text List    ${unExpectedFilterTexts}

    Close Window
    Select Window   MAIN

Create Dashboard From Specific Angle Name
    [Arguments]    ${angleName}    ${dashboardName}
    Search By Text And Expect In Search Result    ${angleName} 
    Click Select First Item From Search Result
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${dashboardName} 
    Save Dashboard

Add Filter To Dashboard
    [Arguments]    ${fieldKeyword}    ${fieldId}    ${selectedOperator}    ${selectedOperatorValue}
    Click Dashboard Name
    Click Dashboard Detail Filters Tab
    Click Add Filter Button In Dashboard Detail Popup
    Select Field Source(Self)
    Select Field From Filters Tab    ${fieldKeyword}    ${fieldId}
    Choose Dropdown Filter Operator In FilterField In Filters tab    0    ${selectedOperator}
    Input Filter Set Select Value    0    ${selectedOperatorValue}
    Save Dashboard

First Filter In Dashboard Popup Should Be Equal
    [Arguments]    ${dashboardName}    ${expectFilterText}
    Back To Search
    Search Dashboard From Search Page And Open It    ${dashboardName} 
    Click Dashboard Name
    Click Dashboard Detail Filters Tab  
    Verify Dashboard Filter Still Showing    0    ${expectFilterText}
    Cancel Dashboard

First Filter In Dashboard Sidebar Should Be Equal
    [Arguments]    ${expectFilterText}
    Click Editing From Dashboard Filter Panel
    Wait Until Element Exist And Visible    ${divPopupListFilter}
    ${filterText}    Get Text    css=#FilterHeader-0 .filterText
    Should Be Equal    ${filterText}    ${expectFilterText}  
    Cancel Edit Dashboard

Create Dashboard From Many Angles
    [Arguments]    ${angleKeyword}    ${dashboardName}
    Search By Text And Expect In Search Result    ${angleKeyword}
    Click Sort By Name Ascending In Search Page
    Click Search Action Select All
    Click Search Action Execute As Dashboard
    Input Dashboard Name    ${dashboardName} 
    Save Dashboard

Add Filters To Dashboard
    Open Filter From Dashboard Filter Panel

    # filter #1
    Click Add Filter Button In Dashboard Detail Popup
    Select Field Source(Self)
    Select Field From Filters Tab    "Bottleneck Type"    BottleneckType
    Choose Dropdown Filter Operator In FilterField In Filters tab   0   is not empty

    # filter #2
    Click Add Filter Button In Dashboard Detail Popup
    Select Field Source(Self)
    Select Field From Filters Tab    "Order Due Date"    OrderDueDate
    Input Date Value    1_0    May/24/2016

    # filter #3
    Click Add Filter Button In Dashboard Detail Popup
    Select Field Source(Self)
    Select Field From Filters Tab    "Order Number"    OrderNumber
    Choose Dropdown Filter Operator In FilterField In Filters tab   2   is greater than
    Input Text    InputValue-2    1

    # filter #4
    Click Add Filter From Field    4
    Choose Dropdown Filter Operator In FilterField In Filters tab   3   is not empty

    Save Dashboard

Open Dashboard Popup And Remove Filter By index
    [Arguments]   ${index}
    Open Filter From Dashboard Filter Panel
    Remove Field In Fields Tab    ${index}
    Save Dashboard 
