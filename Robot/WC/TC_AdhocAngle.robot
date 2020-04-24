*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Save Adhoc Angle Without BP
    [Documentation]     Create an angle with blank object and save
    [Tags]              TC_229220
    ${angleName}  Set Variable  [ROBOT] Save Adhoc Angle Without BP
    Create Blank Adhoc Angle From One Object      PD    ${angleName}
    Click Save All And Expect Warning
    Verify Popup Warning For BP And Close
    ${bps}=    Create List    S2D
    Add Business Processes      ${bps}     ${TRUE}
    Click Save All
    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Save Display As Adhoc Angle Without BP
    [Documentation]     creates an angle with blank object and save display as
    [Tags]              TC_229220
    ${angleName}  Set Variable  [ROBOT] Save Display As Adhoc Angle Without BP
    ${displayName}  Set Variable    [ROBOT] Display From Adhoc Angle Without BP
    Create Blank Adhoc Angle From One Object      PD    ${angleName}
    Save Adhoc Display From Action Menu     ${displayName}
    Verify Popup Warning For BP And Close
    Cancel Save Display As
    ${bps}=    Create List    S2D
    Add Business Processes      ${bps}     ${TRUE}
    Save Adhoc Display From Action Menu     ${displayName}
    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}