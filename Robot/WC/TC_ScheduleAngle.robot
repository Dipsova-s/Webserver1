*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page

*** Test Cases ***
Verify Schedule Angle To Export Angle To Excel
    [Tags]      TC_C230198   TC_C434284   acc_wc_s
    [Documentation]     Scheduling angle using existing task from webclient should redirect to Edit Action popup in ITMC.
    [Setup]   Preparing Schedule Angle

    Go to WC Then Login With EAViewer User
    Find Angle By ID Then Execute The First Angle       AngleForScheduleAngle
    Schedule Angle From Existing Task In Angle AnglePage       TaskForScheduleAngle
    Switch Window     IT Management Console
    Verify Wheather User Redirects To Add Action Page
    Verify Run as User On Action Popup
    Able To Add Action
    Verify Run As User On Action Grid
    Logout MC Then Close Browser

    
    [Teardown]  Run Keywords    Switch Browser    1
    ...         AND           Clean Up Items And Go To Search Page