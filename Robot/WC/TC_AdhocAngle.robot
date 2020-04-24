*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AdhocDisplay.robot
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

Adhoc Display Is Removed When Create Another Display In Adhoc Angle
    [Tags]      TC_229220
    [Documentation]     Ad-hoc display will be replace when create a new Ad-hoc display 
    ...                 Risk/coverage area: Create Adhoc display after anoter display was created in Adhoc angle
    ${angleName}  Set Variable  [ROBOT] Adhoc Display In Adhoc Angle
    Create Blank Adhoc Angle From One Object      PD    ${angleName}
    Create An Adhoc Chart                       Chart Display
    Display Tab Should Be Visible By Name       Chart Display
    Create An Adhoc Pivot                       Pivot Display
    Display Tab Should Be Visible By Name       Pivot Display
    Display Tab Should Not Be Visible By Name   Chart Display
    [Teardown]  Go to Search Page

Copied Adhoc Display Is Removed When Create Another Display In Adhoc Angle
    [Tags]      TC_229220
    [Documentation]     Copired Ad-hoc display will be replace when create a new Ad-hoc display 
    ...                 Risk/coverage area: Create Adhoc display after a display was copired in Adhoc angle
    ${angleName}  Set Variable  [ROBOT] Adhoc Display In Adhoc Angle
    Create Blank Adhoc Angle From One Object      PD    ${angleName}
    Click Angle Dropdown Actions Copy Display
    Click Angle Dropdown Actions Paste Display
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Create An Adhoc Chart                       Chart Display
    Display Tab Should Be Visible By Name       Chart Display
    [Teardown]  Go to Search Page