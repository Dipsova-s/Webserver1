*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Verify Angle Sidebar Remembering State
    [Documentation]     Remember the state of the Angle side panel and then check if its state change correctly
    ...                 Risk/coverage area: Angle side panel remembering the state
    [Tags]    TC_C179025
    ${angleName}   Set Variable   Angle For General Test
    ${displayName}   Set Variable   Test Chart 1
    Search Angle From Search Page And Execute Angle    ${angleName}
    Change Display By Name  ${displayName}

    #act
    Open Side Panel
    Click Angle Tab
    Collapse Section Panel: Angle Filters & Jumps
    Expand Section Panel: Angle Description
    Click Display Tab
    Collapse Section Panel: Display Filters & Jumps
    Expand Section Panel: Display Aggregation
    Collapse Section Panel: Display Description
	${activeTab}   Get Side Panel Active Tab
    ${width}   Get Side Panel Width
    Resize Side Panel  10
    Close Side Panel
    Logout

    #assert
    Login To WC By Power User
    Search Angle From Search Page And Execute Angle    ${angleName}
    Change Display By Name  ${displayName}
    Side Panel Should Be Closed
    Open Side Panel
    ${actualTab}   Get Side Panel Active Tab
    ${newWidth}   Get Side Panel Width
    Should Be Equal  ${width + 10}   ${newWidth}
	Should Be Equal  ${activeTab}   ${actualTab}
    Click Angle Tab  ${False}
    Section Panel Should Collapsed: Angle Filters & Jumps
    Section Panel Should Expanded: Angle Description
    Click Display Tab  ${False}
    Section Panel Should Collapsed: Display Filters & Jumps
    Section Panel Should Expanded: Display Aggregation
    Section Panel Should Collapsed: Display Description

    #restore default
    Click Angle Tab
    Resize Side Panel  -10

    [Teardown]  Go to Search Page

Verify Update Angle/Display Description
    [Setup]  Import Angle By API  /models/1  ANGLE_EditDescriptionAngle.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EDIT_DESCRIPTION

    Edit Angle Description  en      New Angle name      New Angle description
    Angle Description Should Contain  New Angle description

    Edit Angle Description On Angle Name  en    New Angle name      New Angle description On Angle Name
    Angle Description Should Contain  New Angle description On Angle Name

    Edit Display Description  en    New Display name    New Display description
    Display Description Should Contain  New Display description

    Edit Display Description On Display Tab  en     New Display name    New Display description On Display Tab
    Display Description Should Contain  New Display description On Display Tab

    [Teardown]  Clean Up Items And Go To Search Page

Verify Update Template Description
    ${angleName}   Set Variable   [ROBOT] Update Template Description
    [Setup]  Import Angle By API  /models/1  ANGLE_EditDescriptionTemplate.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_TEMPLATE_EDIT_DESCRIPTION

    Edit Angle Description  en  ${angleName}  New Angle description     ${True}
    Angle Description Should Contain  New Angle description

    Edit Display Description  en  New Display name  New Display description     ${True}
    Display Description Should Contain  New Display description

    Click Save All

    Click Angle Tab
    Angle Description Should Contain  New Angle description
    Click Display Tab
    Display Description Should Contain  New Display description

    # add a new Angle to clean up list
    ${currentAngleUri}  Get Angle Uri
    Append To List   ${importedItems}    ${currentAngleUri}?forced=true

    [Teardown]  Clean Up Items And Go To Search Page

Verify Readonly Angle/Display Description
    [Setup]  Go to WC Then Login With EAViewer User

    ${angleName}   Set Variable   Angle For General Test
    Search Angle From Search Page And Execute Angle    ${angleName}

    Show Edit Angle Description Popup
    Check Edit Description ReadOnly Mode
    Click Close Edit Description

    Show Edit Display Description Popup
    Check Edit Description ReadOnly Mode
    Click Close Edit Description

    Logout WC Then Close Browser
    Switch Browser  1

    [Teardown]  Go to Search Page
	
Verify Apply Filter & Jump On Display
    [Documentation]     Apply Filter & Jump without saving
    ...                 Risk/coverage area: Display Filter & Jump
    [Tags]    TC_C196803
	# prepare stuff
    ${angleName}  Set Variable  [ROBOT] Remove from Apply button in Display details
    Upload Item And Check From Search Result  ANGLE_FOR_REMOVE_SAVE_FUNCTION_FROM_DISPLAY.json    EA2_800    ${angleName}
    Open Angle From First Angle in Search Page    ${angleName}

    # check add filter/jump
	Click Display Tab
    Set Editor Context: Display Tab
	${displayJumpText}    Set Variable    Delivery Items
    Add Jump To Display    ${displayJumpText}
	Add Filter    "Is Fixed"    IsFixed    ${True}
	${displayFilterText}    Get Display Filter Name By Index    1
	Click Apply Filter On Display
    Confirm To Add Jump
    Display Type Should Be Equal To  list
    
	# refresh page and verify
	Reload Angle Page
    Click Display Tab
    Set Editor Context: Display Tab
    Display Filter Should Not Contain    ${displayFilterText}
    Display Filter Should Not Contain    ${displayJumpText}
    Display Type Should Be Equal To  chart

    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}
	
Verify Angle Sidebar Business Process
	[Documentation]     EAPower can assign/remove Business Process items from the angle and login as EAViewer to see does he/she have the right to modify it or not
    [Tags]      TC_C228745
    # prepare stuff
	${angleName}   Set Variable   [ROBOT] Angle sidebar
    [Setup]  Import Angle By API  /models/1  ANGLE_SideBar.json  user=${Username}
	Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_SIDEBAR
	Publish Angle
	Open Side Panel
    Click Angle Tab
    
	# add & delete
    ${bps}    Create List    IT  GRC
	Add Business Processes   ${bps}
    ${bps}    Create List    GRC
	Delete Business Processes    ${bps}
	
	# reload and check
    Reload Angle Page
	Item Business Process Should Be Selected    IT
	Item Business Process Should Not Be Selected    GRC
	
	# login as viewer and check
	Go to WC Then Login With EAViewer User
	Search Angle From Search Page And Execute Angle    ${angleName}
    Open Side Panel
    Click Angle Tab
	Item Business Processes Should Be Read-only
    Logout WC Then Close Browser
    Switch Browser  1
    	
    [Teardown]  Clean Up Items And Go To Search Page

Verify Update Angle/Display ID
    [Documentation]     EAPower can edit the angle/display id
    [Tags]      TC_C228913    TC_C228757
    [Setup]  Import Angle By API  /models/1  ANGLE_EditDescriptionID.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EDIT_ID_IN_DESCRIPTION_POPUP
    ${angleid}    Generate Random String    12  [LOWER]    

    Edit Angle ID  ${angleid}
    Assert Angle ID  ${angleid}

    ${displayid}    Generate Random String    12  [LOWER]
    Edit Display Id  ${displayid}
    Assert Display ID   ${displayid}

    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle Tags
    [Documentation]     EAPower can add/edit tags
    [Tags]      TC_C229575  TC_C229364
    [Setup]  Run Keywords  Import Angle By API  /models/1  ANGLE_Tag1.json  user=${Username}
    ...         AND        Import Angle By API  /models/1  ANGLE_Tag2.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_TAG1
    Open Side Panel
    Click Angle Tab

    # filter & assign tags
    Filter Item Tag  robot
    Tag Should Not Be Available  MY_ROBOT
    Tag Should Be Available  Robot1
    Tag Should Be Available  Robot2
    Select Tag  Robot2
    Select New Tag

    # check
    Reload Angle Page
    Tag Should Be Selected  Robot2
    Tag Should Be Selected  robot

    # remove tags
    ${tags}    Create List    robot
    Remove Tags  ${tags}

    # check
    Reload Angle Page
    Tag Should Be Selected  Robot2
    Tag Should Not Be Selected  robot

    [Teardown]  Clean Up Items And Go To Search Page