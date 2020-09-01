*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAViewer User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Clean Up Items And Go To Search Page
Force Tags        	acc_wc    TC_C202355

*** Test Cases ***
Not Possible To Add The Filter Where There Is A Jump In A Display
    [Documentation]     Scenario 1 : not possible to add the filter where there is a jump in a display
    [Tags]      TC_C202355
    [Setup]  Import Angle By API  /models/1  ANGLE_EAViewerWithJump.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAViewerWithJump
    Assert That Angle Can Not Save Display
    Assert That Angle Can Not Add New Filter And Jump On Angle Tab
    Assert That Angle Can Not Add New Filter And Jump On Display Tab

Allow User Add/Remove The Adhoc Filter
    [Documentation]     Scenario 2 : Allow user add/remove the adhoc filter
    [Tags]      TC_C202355
    [Setup]  Import Angle By API  /models/1  ANGLE_EAViewerForTestingDrilldownAdhocFilter.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAViewerForTestingDrilldownAdhocFilter
    Assert To Remove Ad hoc Display Filters On Drill Down

User Able To Remove An Ad-hoc Filter
    [Documentation]     Scenario 4 :  User able to remove an ad-hoc filter
    [Tags]      TC_C202355
    [Setup]  Import Angle By API  /models/1  ANGLE_EAViewerForTestingManualAdhocFilter.json  user=${Username}
    Set Editor Context: Display Tab
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAViewerForTestingManualAdhocFilter
    Add 2 New Ad hoc Display Filters
    Assert To Remove All Ad hoc Display Filters

User No Privilege Create_Angle = Deny
    [Documentation]     Scenario 6 + 7 : user no privilege for Create_Angle= deny (Angle tab)
    [Tags]      TC_C202355
    [Setup]  Import Angle By API  /models/1  ANGLE_EAViewerWithoutJump.json  user=${Username}
    # [ROBOT] Angle EAViewer Without Jump
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EAViewerWithoutJump
    Assert That Angle Can Not Add New Filter And Jump On Angle Tab
    Assert That Angle Can Manage Filter But Jump On Display Tab
    