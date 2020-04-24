*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_DisplayDrilldown.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acceptance_s     acc_wc_s

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
    Verify Drilldown Display Value After Saving     Gauge Chart     Chart
    [Teardown]  Clean Up Items And Go To Search Page

Select Default Drilldown On Adhoc Display
    [Documentation]     Step 8.1 : Default drilldown is remembered state   (Ad-hoc display)
    ...                 Step 10  : drilldown on ad-hoc display shows display type correctly when Default drilldown was added
    [Tags]      TC_C50254
    [Setup]  Import Angle By API  /models/1  ANGLE_DrilldownDisplayTesting.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_DrilldownDisplayTesting 
    Create Chart From List Header Column    ObjectType    ObjectType  ${True}
    Verify Display Remember Drilldown Display       New chart display     Chart
    Verify Adhoc Display Drilldown Correctly        New chart display     Chart
    [Teardown]  Clean Up Items And Go To Search Page
