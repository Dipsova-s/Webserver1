*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AdhocDisplay.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Save Adhoc Angle Without BP
    [Documentation]     Create an angle with blank object and save
    [Tags]              TC_C229220
    ${angleName}  Set Variable  [ROBOT] Save Adhoc Angle Without BP
    ${bps}    Create List    S2D
    Execute Blank Adhoc Angle From One Object      PD
    Click Save All And Expect Warning
    Verify Popup Warning For BP And Close
    Add Business Processes      ${bps}     ${TRUE}
    Edit Angle Description    en    ${angleName}    ${EMPTY}    ${TRUE}
    Click Save All
    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Save Display As Adhoc Angle Without BP
    [Documentation]     creates an angle with blank object and save display as
    [Tags]              TC_C229220
    ${angleName}  Set Variable  [ROBOT] Save Display As Adhoc Angle Without BP
    ${displayName}  Set Variable    [ROBOT] Display From Adhoc Angle Without BP
    ${bps}    Create List    S2D
    Execute Blank Adhoc Angle From One Object      PD
    Save Adhoc Display From Action Menu     ${displayName}
    Verify Popup Warning For BP And Close
    Cancel Save Display As
    Add Business Processes      ${bps}     ${TRUE}
    Edit Angle Description    en    ${angleName}    ${EMPTY}    ${TRUE}
    Save Adhoc Display From Action Menu     ${displayName}
    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Adhoc Display Is Removed When Create Another Display In Adhoc Angle
    [Tags]      TC_C229220
    [Documentation]     Ad-hoc display will be replace when create a new Ad-hoc display 
    ...                 Risk/coverage area: Create Adhoc display after anoter display was created in Adhoc angle
    ${angleName}  Set Variable  [ROBOT] Adhoc Display In Adhoc Angle
    ${bps}    Create List    S2D
    Create Blank Adhoc Angle From One Object      PD    ${angleName}    ${bps}
    Create An Adhoc Chart                       Chart Display
    Display Tab Should Be Visible By Name       Chart Display
    Create An Adhoc Pivot                       Pivot Display
    Display Tab Should Be Visible By Name       Pivot Display
    Display Tab Should Not Be Visible By Name   Chart Display
    [Teardown]  Go to Search Page

Copied Adhoc Display Is Removed When Create Another Display In Adhoc Angle
    [Tags]      TC_C229220
    [Documentation]     Copied Ad-hoc display will be replace when create a new Ad-hoc display 
    ...                 Risk/coverage area: Create Adhoc display after a display was copired in Adhoc angle
    ${angleName}  Set Variable  [ROBOT] Adhoc Display In Adhoc Angle
    ${bps}    Create List    S2D
    Create Blank Adhoc Angle From One Object      PD    ${angleName}    ${bps}
    Copy Display
    Paste Display
    Create An Adhoc Chart                       Chart Display
    Display Tab Should Be Visible By Name       Chart Display
    [Teardown]  Go to Search Page