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

################################################################################

Search And Execute Dashboard With Execution Parameters
    [Arguments]    ${dashboardName}  ${keyword}
    Search By Text And Expect In Search Result  ${dashboardName}
    Click Link Item From Search Result Not Execute Popup  ${dashboardName}
    Wait Until Dashboard Execute Parameters Popup Loaded
    Run Keyword  ${keyword}
    Click Submit Dashboard Execution Parameters

Re-execute Dashboard In Edit Mode With Execution Parameters
    [Arguments]   ${dashboardName}  ${keyword}
    Go to Search Page
    Search By Text And Expect In Search Result    ${dashboardName}
    Click First Item Info Button
    Click Dashboard Edit Mode Button Via Item Info Popup
    Click Execute Dashboard Action
    Wait Until Dashboard Execute Parameters Popup Loaded
    Run Keyword  ${keyword}
    Click Submit Dashboard Execution Parameters

Change Dashboard Execution Parameters Value
    Set Editor Context: Dashboard Execution Parameters Popup
    Set Editor Index    0
    Clear All List Filters
    Input Text Filter Value  1

Open Angle In Dashboard Widget
    [Arguments]    ${index}
    Click Link Go To Angle    ${index}
    Switch Window    NEW
    Wait Progress Bar Closed
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup

Check If Dashboard Execution Parameters Should Apply On Angle
    [Arguments]     ${Widget}   ${index}   ${filterDisplayName}   ${display}
    Open Angle In Dashboard Widget    ${Widget}
    Set Editor Context: Display Tab
    Set Editor Index  ${index}
    Filter Display Name Should Contains   ${filterDisplayName}
    Check Filter Asterisk Should Be Available
    Display Should Mark As UnSaved   ${display}
    Close Window
    Switch Window   MAIN

Prepare Filter With Execution Parameters To Dashboard
    Set Editor Context: Dashboard Tab
    Add Filter  "Bottleneck Type"  BottleneckType  ${TRUE}
    Set Editor Index  0
    Choose Dropdown Filter Operator Via Edit Filter  is not empty
    Click Execute Parameter To Edit Filter
    Click Apply Filter Button

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