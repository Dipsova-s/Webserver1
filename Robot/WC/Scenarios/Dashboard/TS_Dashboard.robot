*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource            ${EXECDIR}/WC/POM/Angle/AddToDashboardPopup.robot
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardPage.robot

*** Keywords ***
Create Adhoc Dashboard
    [Arguments]    ${searchText}    ${dashboardName}
    Search By Text And Expect In Search Result    ${searchText} 
    Click Sort By Name Ascending In Search Page
    Click Search Action Select All
    Click Search Action Execute As Dashboard
    Edit Dashboard Description    en    ${dashboardName}    ${EMPTY}    ${True}

Create New Dashboard
    [Arguments]    ${searchText}    ${dashboardName}
    Create Adhoc Dashboard  ${searchText}  ${dashboardName}
    Click Dashboard Save All

Dashboard Execution Parameters
    Filter Angle With Execution Parameters For Dashboard
    Execute Dashboard From Angle With Execution Parameters
    Check Dashboard Execution Parameters Are Presented
    Change Dashboard Execution Parameters Then Execute
    Click Submit Adhoc Dashboard Execution Parameters
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
    Edit Dashboard Description    en    ${dashboardName}    ${dashboardName}
    Click Dashboard Save All
    Back To Search
    Search By Text And Expect In Search Result    ${dashboardName}
    Sleep    2s    Wait SOLR
    Click First Item Info Button
    Click Dashboard Edit Mode Button Via Item Info Popup
    Click Execute Dashboard Action
    Click Submit Dashboard Execution Parameters
    Wait Progress Bar Closed

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
    Click Link Go To Angle    ${index}
    Switch Window    NEW
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup

Check First Angle Should Apply Dashboard Execution Parameters
    Page Should Contain    (Self) - Purchasing Document Category is not empty
    Page Should Contain    (Self) - Execution status is equal to Partially open
    Page Should Contain    Vendor - Vendor is in list (3745, 5550)
    Close Window
    Switch Window   MAIN

Check Second Angle Should Apply Dashboard Execution Parameters
    Page Should Contain    (Self) - Purchasing Document Category is not empty
    Page Should Contain    (Self) - Execution status is equal to Partially open
    Close Window
    Switch Window   MAIN

Create Dashboard With 2 Angles
    [Arguments]   ${dashboardName}
    Search By Text     Angle For
    Check Existing Angle From Search Result    Test Angle For Validate
    Check Existing Angle From Search Result    Angle For General Test
    Click Select Item From Search Result By Name  Test Angle For Validate
    Click Select Item From Search Result By Name  Angle For General Test
    Click Search Action Execute As Dashboard
    Edit Dashboard Description    en    ${dashboardName}    ${dashboardName}
    Click Dashboard Save All

Back To Search And Delete Dashboard Are Created
    [Arguments]   ${dashboardName}
    Go to Search Page
    Delete Item On Search Page    ${dashboardName}

Verify Filters In Angle When Open Angle From Dashboard Page
    [Arguments]    ${widgetIndex}    ${expectedFilterTexts}=''    ${unExpectedFilterTexts}=''
    Open Angle In Dashboard Widget    ${widgetIndex}

    Run Keyword If  ${expectedFilterTexts}!=''    Page Should Contain Text List    ${expectedFilterTexts}
    Run Keyword If  ${unExpectedFilterTexts}!=''    Page Should Not Contain Text List    ${unExpectedFilterTexts}

    Close Window
    Switch Window   MAIN

Verify Newly Dashboard With The Filter Should Not Show Asterisk
    [Arguments]    ${searchText}    ${dashboardName}
    Create Adhoc Dashboard  ${searchText}  ${dashboardName}
    Set Editor Index    0
    Add Filter      "Material Value"           MaterialValue       ${TRUE}
    Click Apply Dashboard Filter
    Dashboard Save Button Should Be Enable
    Click Dashboard Save All   
    Check Filter Asterisk Should Not Be Available

Add Filters To Dashboard
    # filter #1
    Add Filter      "Bottleneck Type"           BottleneckType       ${TRUE}
    Set Editor Index    0
    Choose Dropdown Filter Operator Via Edit Filter    is not empty

    # filter #2
    Add Filter      "Order Due Date"           OrderDueDate       ${TRUE}
    Set Editor Index    1
    Input Date Filter Value    May/24/2016
   
    Click Apply Dashboard Filter

Verify A Normal Drilldown On Chart Widget
    Click Drilldown Chart Widget  0
    Switch Window    NEW
    Wait Angle Page Document Loaded
    Wait Display Executed
    Click Display Tab
    Display Type Should Be Equal To  list
    Display Filter/Jump Count Should Be  2
    Display Filter Should Contain  Execution status is not empty
    Display Filter Should Contain  Execution status is equal to
    Close Window
    Switch Window   MAIN

Verify A Drilldown To Display On Pivot Widget
    Click Drilldown Pivot Widget  1
    Switch Window    NEW
    Wait Angle Page Document Loaded
    Wait Display Executed
    Click Display Tab
    Display Type Should Be Equal To  chart
    Display Filter/Jump Count Should Be  2
    Display Filter Should Contain  ID is not empty
    Display Filter Should Contain  Execution status is equal to
    Close Window
    Switch Window   MAIN

Add Dashboard Personal Note
    [Arguments]  ${note}
    Click Dashboard Tab
    Input Dashboard Note    ${note}

Verify Dashboard Personal Note
    [Arguments]  ${note}
    Add Dashboard Personal Note  ${note}
    Go to Search Page
    Search By Text  ${note}
    Check Existing Private Note From Search Result    ${note}
 
Check Private Dashboard Note section On Dashboard
    Page Should Not Contain Element    ${divPersonalNote}

Edit Dashboard Description
    [Arguments]  ${language}  ${name}  ${description}  ${isAdhoc}=${False}
    Show Edit Dashboard description Popup
    Add Or Edit Description  ${language}  ${name}  ${description}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Wait Until Ajax Complete

Edit Dashboard Description On Dashboard Name
    [Arguments]  ${language}  ${name}  ${description}  ${isAdhoc}=${False}
    Click Edit Dashboard Description On Dashboard Name
    Add Or Edit Description  ${language}  ${name}  ${description}
    Click Save Edit Description
    Run Keyword If  ${isAdhoc} == ${False}  Wait Until Ajax Complete

Show Edit Dashboard Description Popup
    Open Side Panel
    Click Dashboard Tab
    Click Edit Dashboard Description

Edit Dashboard ID
    [Arguments]  ${id}
    Show Edit Dashboard description Popup
    Add Or Edit ID    ${id}
    Click Save Edit Description
    Page Should Contain Toast Success    

Assert Dashboard ID
    [Arguments]  ${id}
    Show Edit Dashboard description Popup
    Edit Description Should Contain ID    ${id}
    Click Save Edit Description

Verify Dashboard Business Processes Should Be Selected
    [Arguments]  @{bps}
    :FOR  ${bp}  IN  @{bps}
    \  Item Business Process Should Be Selected  ${bp}

Verify Dashboard Business Processes Should Not Be Selected
    [Arguments]  @{bps}
    :FOR  ${bp}  IN  @{bps}
    \  Item Business Process Should Not Be Selected  ${bp}

Verify Set Dashboard Execute At Logon
    [Arguments]  ${name}
    Select Dashboard Execute At Logon
    Verify Item Is Added To Execute At Login List  ${name}

Verify Unset Dashboard Execute At Logon
    [Arguments]  ${name}
    Unselect Dashboard Execute At Logon
    Verify Item Is Removed From Execute At Login List  ${name}

Verify Visibility Of Adding Filter In Dashboard Side Panel
    [Arguments]    ${isVisible}
    Run Keyword If    ${isVisible}==${True}     Add Dashboard Filter Button Is Visible
    ...    ELSE    Add Dashboard Filter Button Is Not Visible
    
Verify Adhoc Dashboard Statistics
    Dashboard Statistic Button Should Not Be Visible

Verify Saved Dashboard Statistics
    Open Dashboard Statistic Popup
    Check Dashboard Statistic Info
    Close Dashboard Statistic Popup

Verify Edit Mode Dashboard Statistics
    Open Dashboard Statistic Popup
    Check Dashboard Statistic Info
    Close Dashboard Statistic Popup

Check Widget Names After Created
    Widget Count Should Be  2
    Editing Widget Name Should Be  0  EA2_800 - Test Angle For Validate - New Display
    Editing Widget Name Should Be  1  EA2_800 - Angle For General Test - Test Chart 1
    Widget Should Be List Display  0
    Widget Should Be Chart Display  1

Change And Check Widget Names
    Edit Widget Name  Test Angle For Validate  widget #1
    Edit Widget Name  Angle For General Test  widget #2
    Widget Count Should Be  2
    Editing Widget Name Should Be  0  widget #1
    Editing Widget Name Should Be  1  widget #2
    Widget Should Be List Display  0
    Widget Should Be Chart Display  1

Change And Check Widget Display
    Change Widget Display  widget #2  New Display
    Widget Count Should Be  2
    Editing Widget Name Should Be  0  widget #1
    Editing Widget Name Should Be  1  widget #2
    Widget Should Be List Display  0
    Widget Should Be List Display  1

Add And Check Widget Display
    [Arguments]  ${dashboardName}
    Open Widget Display  widget #2  Test Pivot 1
    Add Display To Existing Dashboard  ${dashboardName}
    Close Window
    Switch Window   MAIN
    Wait Dashboard Widgets Loaded
    Check All Widgets

Save And Check All Widgets
    Click Dashboard Save All
    Check All Widgets

Check All Widgets
    Widget Count Should Be  3
    Editing Widget Name Should Be  0  widget #1
    Editing Widget Name Should Be  1  widget #2
    Editing Widget Name Should Be  2  EA2_800 - Angle For General Test - Test Pivot 1
    Widget Should Be List Display  0
    Widget Should Be List Display  1
    Widget Should Be Pivot Display  2

Delete And Check All Widgets
    Click Delete Widget  1
    Widget Count Should Be  2
    Editing Widget Name Should Be  0  widget #1
    Editing Widget Name Should Be  1  EA2_800 - Angle For General Test - Test Pivot 1
    Widget Should Be List Display  0
    Widget Should Be Pivot Display  1

Verify Dashboard Downloading Confirmation
    Click Displays Tab
    Edit Widget Name  [ROBOT] Angle Dashboard Download  new name
    Dashboard Downloading Should Get A Confirmation Popup
    Edit Widget Name  new name  ${EMPTY}