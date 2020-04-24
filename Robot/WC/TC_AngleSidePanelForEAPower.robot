*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acceptance_s     acc_wc_s

*** Test Cases ***
Verify Angle With Do not allow users to obtain more details
    [Documentation]     Scenario 1 When "Do not allow users to obtain more details" is set (On publish menu) 
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_EAPowerWithJump.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAPowerWithJump
    Set Angle To Not Allow User To Obtain More Details
    Assert That Angle Can Not Add New Filter And Jump On Angle Tab 
    Assert That Angle Can Not Add New Filter And Jump On Display Tab
    Assert That Angle Cannot Delete A Jump On Display Tab
    Assert That Angle Cannot Delete A Filter On Display Tab
    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle With Do not allow users to go to related objects via the Jumps
    [Documentation]     Scenario 2 When angle contain Jump and "Do not allow users to go to related objects via the Jumps" is set (On publish menu)
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_EAPowerWithJumpScenario2.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_acaf6823aa5e11bd02942578044820399
    Set Angle To Not Allow User To Go To Related Objects Via The Jumps
    Assert That Angle Can Not Add New Filter And Jump On Angle Tab
    Add Angle Filter Before Jump Button Should Not Be Visible On Angle      0

    [Teardown]  Clean Up Items And Go To Search Page

Verify Display Contain Jump With Do Not Allow Users To Go To Related Objects Via The Jumps
    [Documentation]     Scenario 3 When display contain Jump and "Do not allow users to go to related objects via the Jumps" is set (On publish menu)
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_EAPowerWithJump.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAPowerWithJump
    Set Angle To Not Allow User To Go To Related Objects Via The Jumps
    Assert That Angle Can Not Add New Filter And Jump On Display Tab
    Add Angle Filter Before Jump Button Should Not Be Visible On Display    1
    Apply Display Filter Button Should Not Be Visible

    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle With Do not allow jumps
    [Documentation]     Scenario 4 When angle doesn't contain Jump and "Do not allow users to go to related objects via the Jumps" is set (On publish menu)
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_EAPowerWithFilterAndJump.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAPowerWithFilterAndJump
    Set Angle To Not Allow User To Go To Related Objects Via The Jumps
    Assert That Angle Can Manage Filter But Jump On Display Tab
    Assert That Angle Can Manage Filter But Jump On Angle Tab
    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle Has Invalid BaseClass
    [Documentation]     Scenario 5 Angle contain invalid class
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_HAS_INVALID_BASECLASS.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_HAS_INVALID_BASECLASS
    Check If Angle Or Display Has A Warning Then Close The Popup
   
    #Verify Angle tab 
	Click Angle Tab
	Add Angle Filter Button Should Not Be Visible
	Add Angle Jump Button Should Not Be Visible
	Add Angle Filter Before Jump Button Should Not Be Visible On Angle    0
    Delete Jump Button Should Not Be Visible On Angle    0
    Info Button On Jump Should Be Visible On Angle    0
	
	#Verify Display tab
	Click Display Tab
	Add Display Filter Button Is Not Visible
    Add Display Jump Button Is Not Visible
	Info Button On Jump Should Be Visible On Display    0
	Delete Jump Button Should Not Be Visible On Display    0
	Add Angle Filter Before Jump Button Should Not Be Visible On Display    0
    
    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle Has Invalid Field Filter
    [Documentation]     Scenario 6 Angle contain invalid field filter
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_HAS_INVALID_FIELD_FILTER.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_HAS_INVALID_FIELD_FILTER
    Check If Angle Or Display Has A Warning Then Close The Popup
   
    #Verify Angle tab 
	Click Angle Tab
	Add Angle Filter Button Should Be Visible
	Add Angle Jump Button Should Be Visible
	Invalid Filter Message Should Be Show On Angle    0    invalid_field
	Info Button On Filter Should Be Visible On Angle    0
	Delete Filter Button Should Be Visible On Angle   0    
	Edit Filter Button Should Not Be Visible On Angle   0
	
	#Verify Display tab
	Click Display Tab
	Add Display Jump Button Is Not Visible
	
	#When remove the invalid filter the other buttons should be visible
	Click Angle Tab
	Click Delete Filter From Angle    0
	Click Apply Filter On Angle
	
    [Teardown]  Clean Up Items And Go To Search Page
	
Verify Angle Has Invalid Jump
    [Documentation]     Scenario 7 Angle contain invalid jump
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_HAS_INVALID_JUMP.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_HAS_INVALID_JUMP
    Check If Angle Or Display Has A Warning Then Close The Popup
   
    #Verify Angle tab 
	Click Angle Tab
	Add Angle Filter Button Should Not Be Visible
	Add Angle Jump Button Should Not Be Visible
    Invalid Jump Message Should Be Show On Angle    0    INVALIDJUMP 
	Info Button On Jump Should Be Visible On Angle    0
	Delete Jump Button Should Be Visible On Angle   0    
	
	#Verify Display tab
	Click Display Tab
	Add Display Filter Button Is Not Visible
    Add Display Jump Button Is Not Visible
	Info Button On Jump Should Be Visible On Display    0
	Delete Jump Button Should Not Be Visible On Display    0
	Add Angle Filter Before Jump Button Should Not Be Visible On Display    0
	
	#When remove the invalid jump the other buttons should be visible
	Click Angle Tab
	Click Delete Jump From Angle    0
	Add Angle Filter Button Should Be Visible
	Add Angle Jump Button Should Be Visible
	
    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle Has Invalid Filter And Invalid Field On Display
    [Documentation]     Scenario 8 Angle contain invalid field filter + Display contain invalid field as well 
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_EAPowerWithInvalidFilterAndInValidFieldOnDisplay.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAPowerWithInvalidFilterAndInValidFieldOnDisplay
    Check If Angle Or Display Has A Warning Then Close The Popup
    Assert That Angle Can Not Add New Filter And Jump On Display Tab
    [Teardown]  Clean Up Items And Go To Search Page

Verify Angle contain invalid jump And Display contain invalid field As Well
    [Documentation]     Scenario 9 Angle contain invalid jump + Display contain invalid field as well
    [Tags]      TC_C201220
    [Setup]  Import Angle By API  /models/1  ANGLE_HAS_INVALID_JUMP_AND_FIELD.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ANGLE_HAS_INVALID_JUMP_AND_FIELD
    Check If Angle Or Display Has A Warning Then Close The Popup
    
    #Verify Angle tab 
	Click Angle Tab
	Add Angle Filter Button Should Not Be Visible
	Add Angle Jump Button Should Not Be Visible
    Invalid Jump Message Should Be Show On Angle    0    INVALIDJUMP 
	Info Button On Jump Should Be Visible On Angle    0
	Delete Jump Button Should Be Visible On Angle   0 

	#Verify Display tab
	Click Display Tab
	Add Display Filter Button Is Not Visible
    Add Display Jump Button Is Not Visible
	Info Button On Jump Should Be Visible On Display    0
	Delete Jump Button Should Not Be Visible On Display    0
	Add Angle Filter Before Jump Button Should Not Be Visible On Display    0

    [Teardown]  Clean Up Items And Go To Search Page
	
Verify Angle Personal note 
    [Documentation]     Add Personal note to Angle and verify personal note shows correctly  
    [Tags]      TC_C228752
    [Setup]  Import Angle By API  /models/1  ANGLE_PERSONAL_NOTE.json    user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_PERSONAL_NOTE
    Verify Angle Personal Note    Robot Angle Personal note
    
    [Teardown]  Clean Up Items And Go To Search Page

Verify Personal note of private angle from non-creator
    [Documentation]     Non-creator cannot see the Personal note of private angle 
    [Tags]      TC_C228752
    [Setup]  Import Angle By API  /models/1  ANGLE_PERSONAL_NOTE.json    user=${Username}
    Go to WC Then Login With Admin User
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_PERSONAL_NOTE
    Check Private Angle Note section On Angle 
    Logout WC Then Close Browser
    Switch Browser  1

    [Teardown]  Clean Up Items And Go To Search Page