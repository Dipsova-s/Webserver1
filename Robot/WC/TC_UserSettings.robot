*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          smoke_s    smk_wc_s

*** Variables ***
${NL_LANGUAGE_TEXT}                        Dutch
${EN_LANGUAGE_TEXT}                        English

*** Test Cases ***
Verify User Settings Details
    Open User Settings Popup
    Verify User Information
    Verify System Settings
    Verify field formats
    Verify Actions at Login
    Cancel User Setting

Verify Change User Setings: System Settings Tab
    Open User Settings Popup
    Click System Settings Tab

    # keep current states
    ${isBPsmall}    Get Checkbox Show Small Business Process Bar Status
    ${rowExportExcel}    Get Default Number Of Rows For Export To Excel
    ${isAngleWarnings}    Get Checkbox Show Tag For Angle Warnings Status
    ${isStarred}    Get Checkbox Starred Fields Status
    ${isSuggested}    Get Checkbox Suggested Fields Status
    ${isShowFieldChooserTechField}    Get Checkbox When Selecting A Field Status
    ${isShowListHeaderTechField}    Get Checkbox In Column Headers Of Lists Status

    # set new states
    Set User Settings In System Settings Tab
    Click Save User Settings Via Search Page

    # verify changed the settings
    Open User Settings Popup
    Verify Saved System Settings Tab

    # restore old states
    Click Element If Active    ${divUserSettingsBusinessProcessItems}.GRC

    Run Keyword If    ${isBPsmall} == True    Select Checkbox Show Small Business Process Bar
    ...    ELSE    Unselect Checkbox Show Small Business Process Bar

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

    Click Save User Settings Via Search Page

Verify Change User Language
    Change User Language    ${EN_LANGUAGE_TEXT}
    ${en_caption}           Execute Javascript    return Captions.Drop_Here_To_Remove_This_Column
    Change User Language    ${NL_LANGUAGE_TEXT}
    ${nl_caption}           Execute Javascript    return Captions.Drop_Here_To_Remove_This_Column
    Should Be True          '${en_caption}' != '${nl_caption}'
    Change User Language    ${EN_LANGUAGE_TEXT}