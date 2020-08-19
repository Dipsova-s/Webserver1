*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Verify Dashboard Sidebar Remembering State
    [Documentation]     Remember the state of the Dashboard side panel and then check if its state change correctly
    ...                 Risk/coverage area: Dashboard side panel remembering the state
    [Tags]    TC_C228696
	[Setup]  Import Angle By API  /models/1  ANGLE_For_Dashboard_Sidebar.json  user=${Username}
    
	#arrange
	${searchText}       Set Variable     [ROBOT] ANGLE For Dashboard Sidebar
    ${dashboardName}    Set Variable     [ROBOT] Dashboard Side panel
    Create New Dashboard    ${searchText}   ${dashboardName}
   
    #act
    Open Side Panel
    Click Dashboard Tab
    Collapse Section Panel: Dashboard Filters
    Expand Section Panel: Dashboard Description
	Click Displays Tab
	${activeTab}   Get Side Panel Active Tab
    ${width}   Get Side Panel Width
    Resize Side Panel  10
    Close Side Panel
    Logout
    
	#assert
	Login To WC By Power User
    Search Dashboard From Search Page And Open It    ${dashboardName} 
    Side Panel Should Be Closed
    Open Side Panel
	${actualTab}   Get Side Panel Active Tab
    ${newWidth}   Get Side Panel Width
    Should Be Equal  ${width + 10}   ${newWidth}
	Should Be Equal  ${activeTab}   ${actualTab}
    Click Dashboard Tab  ${False}
    Section Panel Should Collapsed: Dashboard Filters
    Section Panel Should Expanded: Dashboard Description
	
	#restore default
	Click Dashboard Tab
    Resize Side Panel  -10

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created  ${dashboardName}
    ...         AND           Clean Up Items And Go To Search Page

Verify Dashboard Sidebar Personal Note 
    [Documentation]     Add Personal note to Dashboard and verify personal note shows correctly       
    [Tags]  TC_C228901
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_PERSONAL_NOTE.json  DASHBOARD_PERSONAL_NOTE.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_PERSONAL_NOTE
    Verify Dashboard Personal Note  Robot Dashboard Personal note
    [Teardown]  Clean Up Items And Go To Search Page

Verify Personal note Of Private dashboard From Non-creator
    [Documentation]     Non-creator cannot see the Personal note of private dashboard          
    [Tags]  TC_C228901
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_PERSONAL_NOTE.json  DASHBOARD_PERSONAL_NOTE.angles.json  user=${Username}
    Go to WC Then Login With Admin User
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_PERSONAL_NOTE
    Click Dashboard Tab

    Check Private Dashboard Note section On Dashboard
    Logout WC Then Close Browser
    Switch Browser  1
    [Teardown]  Clean Up Items And Go To Search Page

Verify Update Dasboard ID
    [Documentation]     EAPower can edit the dashboard id
    [Tags]      TC_C228911
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_Id.json  DASHBOARD_Id.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_ID

    ${dashboardid}    Generate Random String   12  [LOWER]
    Edit Dashboard ID   ${dashboardid}
    Assert Dashboard ID  ${dashboardid}

    [Teardown]  Clean Up Items And Go To Search Page  

Verify Update Dashboard Description
    [Documentation]     EAPower can edit the dashboard description
    [Tags]      TC_C228911
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_Description.json  DASHBOARD_Description.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_DESCRIPTION

    Edit Dashboard Description  en  dashboard descrption  dashboard descrption
    Dashboard Description Should Contain  dashboard descrption

    Edit Dashboard Description On Dashboard Name  en  dashboard descrption  dashboard descrption on dashboard name
    Dashboard Description Should Contain  dashboard descrption on dashboard name

    [Teardown]  Clean Up Items And Go To Search Page

Verify Dashboard Sidebar Business Processes
    [Documentation]     Automatic saving business processes to Dashboard
    [Tags]  TC_C229038
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_BUSINESS_PROCESSES.json  DASHBOARD_BUSINESS_PROCESSES.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_BUSINESS_PROCESSES

    Click Dashboard Tab
    Verify Dashboard Business Processes Should Be Selected  P2P  S2D
    
    ${bps}=    Create List    O2C  PM  IT
    Add Business Processes    ${bps}
    Reload Dashboard Page
    Verify Dashboard Business Processes Should Be Selected  P2P  S2D  O2C  PM  IT

    ${bps}=    Create List    P2P  O2C  PM  IT
    Delete Business Processes  ${bps}
    Reload Dashboard Page
    Verify Dashboard Business Processes Should Be Selected  S2D
    Verify Dashboard Business Processes Should Not Be Selected  P2P  O2C  PM  IT

    [Teardown]  Clean Up Items And Go To Search Page

Verify Dashboard Sidebar Execution At Logon
    [Documentation]     Automatic saving execute at logon to Dashboard
    [Tags]  TC_C229135
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_EXECUTE_AT_LOGON.json  DASHBOARD_EXECUTE_AT_LOGON.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_EXECUTE_AT_LOGON
    Click Dashboard Tab
    ${dashboardName}  Set Variable  [ROBOT] Dashboard Execute At Logon
    Verify Set Dashboard Execute At Logon  ${dashboardName}
    Verify Unset Dashboard Execute At Logon  ${dashboardName}
    [Teardown]  Clean Up Items And Go To Search Page
