*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Saving Privilege
    [Documentation]  Check save buttons on a difference user.
    ...              Risk/Cover area: Save all, Save Display, Save Angle as, Save Display as.
    [Tags]  TC_C230315
    ${angleName}  Set Variable  [ROBOT] Verify Save Privilege
    Create Adhoc Angle From Object List   PD    ${angleName}

    # EAPower
    Verify EAPower: Save Buttons Privilege
    Click Save All
    Publish Angle
    Validate Angle

    Verify EAViewer: Save Buttons Privilege  ${angleName}
    Verify EABasic: Save Buttons Privilege  ${angleName}
    Unvalidate Angle

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Verify Save Angle As
    [Documentation]  Check save Angle as functionals.
    ...              Risk/Cover area: Save Angle as popup.
    [Tags]  TC_C230315
    ${angleName}  Set Variable  [ROBOT] Verify Save Angle As
    Create Angle From Object List And Save    PD    ${angleName}
    Create Chart From List Header Column    ObjectType    ObjectType  ${True}
    Verify Save Angle As  ${angleName} (new)
    Angle Name Should Be  ${angleName} (new)
    Display Count Should Be  2

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Verify Save Display As
    [Documentation]  Check save Display as functionals.
    ...              Risk/Cover area: Save Display as popup
    [Tags]  TC_C230315
    ${angleName}  Set Variable  [ROBOT] Verify Save Display As
    ${displayName}  Set Variable  New name
    Create Angle From Object List And Save    PD    ${angleName}
    Create Chart From List Header Column    ObjectType    ObjectType  ${True}
    Verify Angle: Save Display As Without Add To New Angle Option  ${displayName}
    Active Display Should Be  ${displayName}
    Prepare Template For Save Display As    ${angleName}
    Display Count Should Be  2
    Verify Template: Save Display As With Add To New Angle Option  ${angleName} (new)
    Angle Name Should Be  ${angleName} (new)
    Display Count Should Be  1

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Verify Set Angle To Template Privilege
    [Documentation]  Verify Set Angle to Template button on a different users 
    ...              Risk/Cover area: Set to Template button
    [Tags]    TC_C229010
    ${angleName}  Set Variable  [ROBOT] Verify Set Angle To Template Privilege
    Create Angle From Object List And Save   PD    ${angleName}

    Publish Angle
    Verify EAPower: Set To Template Buttons Privilege 
    Verify EAViewer: Set To Template Buttons Privilege    ${angleName}
  
    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}