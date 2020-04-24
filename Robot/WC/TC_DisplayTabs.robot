*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayScrollingButtons.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayChart.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_Pivot.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Popup Was Closed When Switch Display
    ${angleName}  Set Variable  [ROBOT] Test Popup Was Close When Switch Display
    Create Angle From Object List And Save    PD    ${angleName}
    Create New Pivot Display on Angle Page
    Click Show Field Chooser For Data Area
    Wait Until Element Is Visible    ${popupFieldChooser}
    Go Back
    Wait Progress Bar Closed
    ${isVisible}    Is Element Visible    ${popupFieldChooser}
    Should Not Be True    ${isVisible}
    Change Display By Name    New Display (1)
    Go Back
    Click Add New Column To List
    Wait Until Element Is Visible    ${popupFieldChooser}
    Go Back
    ${isVisible}    Is Element Visible    ${popupFieldChooser}
    Should Not Be True    ${isVisible}
    Delete Item On Search Page    ${angleName}

Remember Changes When Switch Display
    [Documentation]  Asterisk sign will show on changing Displays on List, Chart and Pivot.
    ...              A Display will keep changes when swiched back to it.
    ...              Clicking Save button should remove the asterisk sign.
    ...              Risk/Cover area: Changing and saving Displays
    [Tags]  TC_C219259  TC_C228702
    ${angleName}  Set Variable  [ROBOT] Test Remember Changes When Switch Display
    Create Angle From Object List And Save    PD    ${angleName}

    Log  Update list Display
    Click Header by Data Field Angle Grid List Display  ID
    Click Remove Column From Header Column
    Active Display Should Mark As UnSaved

    Log  Update pivot Display
    Create New Pivot Display on Angle Page
    Click Show Display Option
    Select Checkbox Include Subtotal
    Click Hide Display Option
    Click Apply Field Setting
    Active Display Should Mark As UnSaved

    Log  Update chart Display
    Create New Chart Display on Angle Page
    Change Chart To Area
    Click Apply Field Setting
    Active Display Should Mark As UnSaved

    Log  Drill down
    Click First Bar In Column Chart
    Active Display Should Mark As UnSaved

    Log  Check chart Display
    Change Display To First Chart
    Current Chart Should Be Area

    Log  Check adhoc signs after saved
    Click Save All
    All Displays Should Mark As Saved

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Scroll Display Tabs Scrolling Buttons Can Scroll Left And Right
    [Setup]  Import Angle By API  /models/1  ANGLE_MultiDisplayTesting.json  user=${Username}
    ${width}	${height} =	Get Window Size

    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_MultiDisplayTesting
    Verify Display Scrolling Buttons Are Hidden
    Set Window Size    800   768
    Sleep    ${TIMEOUT_LARGEST}
    Verify Display Scrolling Buttons Are Shown
    Verify Left Display Scrolling Button Is Disabled
    Verify Right Display Scrolling Button Is Enabled
    Scroll Display Tab To Right
    Verify Left Display Scrolling Button Is Enabled
    Verify Right Display Scrolling Button Is Enabled
    Scroll Display Tab To The Rightmost 
    Verify Left Display Scrolling Button Is Enabled
    Verify Right Display Scrolling Button Is Disabled
    Scroll Display Tab To The Leftmost 
    Verify Left Display Scrolling Button Is Disabled
    Verify Right Display Scrolling Button Is Enabled
    Set Window Size    ${width}     ${height}
    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}
    Verify Display Scrolling Buttons Are Hidden
   
    [Teardown]  Clean Up Items And Go To Search Page
 
New Display Tab Should Be Created On The Leftmost When Drilldown A Chart Display
    [Documentation]     Scenario 4 The tabs bar is focused correctly : Chart
    [Tags]      TC_T430636
    [Setup]  Import Angle By API  /models/1  ANGLE_ManyDisplays.json  user=${Username} 
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_ManyDisplays
    Active Display Should Be Visible
    Change Display By Name    No. per Creation Date
    Click First Bar In Column Chart
    Verify Left Display Scrolling Button Is Disabled
    Verify Right Display Scrolling Button Is Enabled
    Active Display Should Be Visible
    Active Display Should Mark As UnSaved
    [Teardown]  Clean Up Items And Go To Search Page

New Display Tab Should Be Created On The Leftmost When Drilldown A Pivot Display
    [Documentation]     Scenario 4 The tabs bar is focused correctly : Pivot
    [Tags]      TC_T430636
    [Setup]  Import Angle By API  /models/1  ANGLE_ManyDisplays.json  user=${Username} 
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_ManyDisplays
    Active Display Should Be Visible
    Change Display By Name    Supply Demand Matching External Orders (pivot)
    Drilldown Pivot Total Cell Value By Row Index    0
    Verify Left Display Scrolling Button Is Disabled
    Verify Right Display Scrolling Button Is Enabled
    Active Display Should Be Visible
    Active Display Should Mark As UnSaved
    [Teardown]  Clean Up Items And Go To Search Page

Display Overview Popup Behavior
    [Documentation]  Check all icons of Display overview popup.
    ...              Check switching Display from Display overview popup.
    ...              Risk/Cover area: Display overview popup, switching Display
    [Tags]  TC_C228753
    [Setup]  Import Angle By API  /models/1  ANGLE_ManyDisplays.json  user=${Username} 
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_ManyDisplays

    Display Count Should Be  10
    Open Display Dropdown
    # check active Display icons
    Active Display Should Be Visible In Dropdown
    Active Display Should Be A Public In Dropdown
    Active Display Should Have A Filter Icon In Dropdown
    Active Display Should Not Have A Delete Button In Dropdown
    # check Categorization Display icons
    ${display1}  Set Variable  Categorization
    Scroll To Display In Dropdown By Name  ${display1}
    Display Should Be A Private In Dropdown By Name  ${display1}
    Display Should Have An Error Icon In Dropdown By Name  ${display1}
    Display Should Have A Delete Button In Dropdown By Name  ${display1}
    # check Category: Contract Display icons
    ${display2}  Set Variable  Category: Contract
    Scroll To Display In Dropdown By Name  ${display2}
    Display Should Have A Warning Icon In Dropdown By Name  ${display2}
    Display Should Have A Jump Icon In Dropdown By Name  ${display2}
    Display Should Have A Parameterized Icon In Dropdown By Name  ${display2}
    Display Should Have A Delete Button In Dropdown By Name  ${display2}
    Close Display Dropdown

    Create Chart From List Header Column   ObjectType   Object type  ${True}
    Display Count Should Be  11
    Open Display Dropdown
    Active Display Should Be Visible In Dropdown
    Active Display Should Be A Private In Dropdown
    Active Display Should Have An Adhoc Icon In Dropdown
    Active Display Should Have A Delete Button In Dropdown
    Close Display Dropdown

    Click Delete Active Display From Dropdown
    Display Count Should Be  10

    [Teardown]  Clean Up Items And Go To Search Page

Verify Keep Active Display Filter
    [Documentation]  The current filter display is applied to the other display when setting the keep active display filter is true.
    ...              Risk/Cover area: Keep Active Display Filter under the display tab.
    [Tags]      TC_C229133
    [Setup]  Import Angle By API  /models/1  ANGLE_KeepActiveDisplayFilter.json  user=${Username} 
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_KeepActiveDisplayFilter
    
    Set Editor Context: Display Tab
    Click Display Tab

    Check Keep Active Display Filter Disabled When No Filter On Display
    Check Keep Active Display Filter Disabled When Display Contains Jump
    Check Keep Active Display Filter Enabled When Has Filter On Display
    Check Filter Is Applied When Enabled Keep Active Display Filter And Switch To Other Display

    [Teardown]  Clean Up Items And Go To Search Page

Verify Newly Created Display Should Be Visible In Publishing Popup
    [Documentation]  Check the newly created display should be show in the publishing popup
    [Tags]      TC_229012
    [Setup]  Import Angle By API  /models/1  ANGLE_PublishingDisplay.json  user=${Username} 
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_PUBLISHING_DISPLAYS
    
    Set Editor Context: Display Tab
    Click Display Tab
    Check Newly Created Display Should Exist In Publishing Popup    en  Newly Display for publishing  Newly Display for publishing

    [Teardown]  Clean Up Items And Go To Search Page


Verify Removed Display Should Not Be Visible In Publishing Popup
    [Documentation]  Check the removed display should not be show in the publishing popup
    [Tags]      TC_229012
    [Setup]  Import Angle By API  /models/1  ANGLE_PublishingDisplay.json  user=${Username} 
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_PUBLISHING_DISPLAYS
    
    Set Editor Context: Display Tab
    Click Display Tab
    Check Removed Display Should Not Exist In Publishing Popup    en  Removed Display for publishing  Removed Display for publishing

    [Teardown]  Clean Up Items And Go To Search Page