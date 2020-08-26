*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_DisplayDrilldown.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Select Default Drilldown And Save
    [Documentation]     Step 1   : The default drilldown display is applied correctly when saved
    ...                 Step 8.2 : Default drilldown is remembered state   (Saved display)
    ...                 Step 9   : The asterisk start shows immediately when changing Default drilldown
    [Tags]      TC_C50254
    [Setup]  Import Angle By API  /models/1  ANGLE_DrilldownDisplayTesting.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_DrilldownDisplayTesting 
    Go To Display And Set Default Drilldown         Gauge Chart     Chart
    Verify Asterisk Is Shown                        Gauge Chart
    Verify Display Remember Drilldown Display       Gauge Chart     Chart
    Click Save All
    Verify Drilldown Display Value After Saving     Gauge Chart     Chart
    [Teardown]  Clean Up Items And Go To Search Page

Select Default Drilldown On Adhoc Display
    [Documentation]     Step 8.1 : Default drilldown is remembered state   (Ad-hoc display)
    ...                 Step 10  : drilldown on ad-hoc display shows display type correctly when Default drilldown was added
    ...                 Step 11  : the ad-hoc display from drilldown should always have default drilldown is [None]
    [Tags]      TC_C50254
    [Setup]  Import Angle By API  /models/1  ANGLE_DrilldownDisplayTesting.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_DrilldownDisplayTesting 
    Create Chart From List Header Column    ObjectType    ObjectType  ${True}
    Verify Display Remember Drilldown Display       New chart display     Chart
    Verify Adhoc Display Drilldown Correctly        New chart display     Chart
    Verify Selected Default Drilldown Display       [None]
    [Teardown]  Clean Up Items And Go To Search Page

Default Drilldown Should Be Copied By Copy And Paste Display
    [Documentation]     Step 12  : copy display that contain default drill down to same Angle
    ...                 Step 13  : copy display that contain default drill down to other Angle
    [Tags]      TC_C50254
    [Setup]  Run keywords   Import Angle By API  /models/1  ANGLE_WithDefaultDrilldownDisplay.json  user=${Username}
    ...      AND    Import Angle By API  /models/1  ANGLE_DrilldownDisplayTesting.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_WithDefaultDrilldownDisplay
    Copy Display
    Paste Display
    Verify Selected Default Drilldown Display       Pivot Display
    # open another angle
    Go to Search Page
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_DrilldownDisplayTesting 
    Paste Display
    Verify Selected Default Drilldown Display       [None]
    [Teardown]  Clean Up Items And Go To Search Page
