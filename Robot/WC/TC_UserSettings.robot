*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Test Setup          Open User Settings Panel
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          smk_wc_s

*** Test Cases ***
Verify User Settings Details
    Click User Tab
    Verify User Tab
    Click System Tab
    Verify System Tab
    Click Fields Tab
    Expand All Accordion Fields
    Verify Fields Tab
    Close User Settings Panel

Verify Change User Setings: System Settings Tab
    Click System Tab

    # keep current states
    ${rowExportExcel}    Get Default Number Of Rows For Export To Excel
    ${isAngleWarnings}    Get Checkbox Show Tag For Angle Warnings Status
    ${isStarred}    Get Checkbox Starred Fields Status
    ${isSuggested}    Get Checkbox Suggested Fields Status
    ${isShowFieldChooserTechField}    Get Checkbox When Selecting A Field Status
    ${isShowListHeaderTechField}    Get Checkbox In Column Headers Of Lists Status

    # set new states
    Update User Settings In System Tab
    Click Save User Settings

    # verify changed the settings
    Open User Settings Panel
    Click System Tab
    Verify Changed User Settings In System Tab

    # restore old states
    Unselect Checkbox    ${divUserSettingsBusinessProcessItems} #GRC

    Select Dropdown Default Number Of Rows For Export To Excel    ${rowExportExcel}

    Run Keyword If    ${isAngleWarnings} == True    Select Checkbox Show Tag For Angle Warnings
    ...    ELSE    Unselect Checkbox Show Tag For Angle Warnings

    Run Keyword If    ${isStarred} == True    Select Checkbox Starred Fields
    ...    ELSE    Unselect Checkbox Starred Fields

    Run Keyword If    ${isSuggested} == True    Select Checkbox Suggested Fields
    ...    ELSE    Unselect Checkbox Suggested Fields

    Run Keyword If    ${isShowFieldChooserTechField} == True    Select Checkbox When Selecting A Field
    ...    ELSE    Unselect Checkbox When Selecting A Field

    Run Keyword If    ${isShowListHeaderTechField} == True    Select Checkbox In Column Headers Of Lists
    ...    ELSE    Unselect Checkbox In Column Headers Of Lists

    Click Save User Settings

Verify Whether User Can Deselect All Business Process
    [Documentation]     This test verifies if user can deselect all business process in user settings 
    ...                 and restores the previous settings.
    [Tags]      TC_C229561
    Click System Tab
    Read All Business Process Checkbox Values
    Deselect All Business Process
    Click Save User Settings
    Open User Settings Panel
    Click System Tab
    Verify If All Business Process Checkbox Are Deselected
    Restore The Old BP Values          
    Click Save User Settings