*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Publishing Angle
    [Tags]  acc_wc_aci
    [Setup]  Import Angle By API  /models/1  ANGLE_PublishTesting.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_PUBLISHING
    Verify Angle Publishing Confirmation
    Publish Angle
    Check Angle Is Published
    Verify All Display Are Published
    Unpublish Angle
    Check Angle Is Unpublished

    [Teardown]  Clean Up Items And Go To Search Page

Verify Validating Angle
    [Tags]  acc_wc_aci
    [Setup]  Import Angle By API  /models/1  ANGLE_ValidateTesting.json  user=${Username}

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_VALIDATING

    # Check breadcrumb
    Page Should Contain Search Results Link
    Page Should Contain Item Label

    # Validated
    Validate Angle
    Check Angle Is Validated
    Page Should Contain Validated Icon

    # Unvalidated
    Unvalidate Angle
    Check Angle Is Unvalidated
    Page Should Not Contain Validated Icon

    [Teardown]  Clean Up Items And Go To Search Page

Verify Set Angle To Template And Template To Angle
    [Documentation]  Verify set Angle to Template and set Template to Angle
    ...              Risk/Cover area: Set To Template and Set To Angle        
    [Tags]    TC_C229010
    ${angleName}  Set Variable  [ROBOT] Verify Set Angle to Template and Template to Angle
    Create Adhoc Angle From Object List   PD    ${angleName}
    Set To Template Button Should Not Available
    Click Save All
    Verify Set Angle To Template    ${angleName}
    Verify Set Template To Angle    ${angleName}
  
    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}