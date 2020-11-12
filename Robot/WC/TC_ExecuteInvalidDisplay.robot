*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify Execute Invalid Angle
    [Documentation]     This test verifies Invalid Angle Settings and options.
    [Tags]  acc_wc_aci  TC_C231293
    [Setup]  Import Angle By API  /models/1  ANGLE_Execute_Invalid.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_EXECUTE_INVALID
    Click Display Tab
    
    # Check list menu
    Check Menu In Header Popup In Case Known Field  ObjectType
    Check Menu In Header Popup In Case Unknown Field  IDInvalid

    # Check pivot menu
    Change Display To First Pivot
    Check Pivot Field Settings In Case Known Fields

    # Check chart menu
    Change Display To First Chart
    Check Chart Field Settings In Case Unknown Fields

    [Teardown]  Clean Up Items And Go To Search Page