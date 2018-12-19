*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Shared/UserMenuSettingPopup.robot

*** Keywords ***
Open User Settings Popup
    Wait Progress Bar Closed
    Wait Until Page Contains Element    ${btnUserMenu}
    Wait Until Element Is Visible       ${btnUserMenu}
    Click User Menu
    Click Settings on User Menu
    Wait User Menu Settings Document Loaded

Open User Change Password Popup
    Wait Progress Bar Closed
    Wait Until Page Contains Element    ${btnUserMenu}
    Wait Until Element Is Visible       ${btnUserMenu}
    Click User Menu
    Click Change Password on User Menu
    Wait Until Page Contains Element    ${inputOldPassword}
    Wait Until Page Contains Element    ${inputNewPassword}
    Wait Until Page Contains Element    ${inputComparedPassword}

Change User Language
    [Arguments]    ${languageText}
    Open User Settings Popup
    Click System Settings Tab
    Select User Setting Language Dropdown    ${languageText}
    Click Save User Settings Via Search Page

Set Show Angle Warning In Facet Filters
    Open User Settings Popup
    Click System Settings Tab
    Select Checkbox Show tag for Angle warnings
    Click Save User Settings Via Search Page

Set Hide Angle Warning In Facet Filters
    Open User Settings Popup
    Click System Settings Tab
    Unselect Checkbox Show tag for Angle warnings
    Click Save User Settings Via Search Page

Get Number Of Execute At Login Items
    Open User Settings Popup
    Click Actions at login Tab
    ${count}    Count Execute At Login Items
    Cancel User Setting
    [Return]    ${count}

Set Checkbox Repeat Last Executed Search Status
    [Arguments]    ${status}
    Run Keyword If    ${status}    Check Checkbox Repeat Last Executed Search
    ...    ELSE    Uncheck Checkbox Repeat Last Executed Search

Verify User Information
    Page Should Contain    User:
    Page Should Contain    Roles:
    Page Should Contain    Model:
    Page Should Contain    EA2
    Page Should Contain    OK
    Page Should Contain    Cancel

Verify System Settings
    Click System Settings Tab
    Page Should Contain Checkbox    ${chkShowFacetAngleWarnings}
    Page Should Contain Checkbox    ${chkDefaultStarredfields}
    Page Should Contain Checkbox    ${chkDefaultSuggestedfields}
    Page Should Contain Checkbox    ${chkSapFieldsInChooser}
    Page Should Contain Checkbox    ${chkSapFieldsInHeader}
    Page Should Contain Element     ${divUserSettingsBusinessProcess}

    Click Dropdown Language
    Wait Until Page Contains    English
    Wait Until Page Contains    Dutch
    Wait Until Page Contains    Spanish
    Wait Until Page Contains    French

    Click Dropdown Default Number Of Rows For Export To Excel
    Wait Until Page Contains    100 results
    Wait Until Page Contains    1,000 results
    Wait Until Page Contains    10,000 results
    Wait Until Page Contains    100,000 results
    Wait Until Page Contains    All results

Verify field formats
    Click Field formats Tab

    Click Field Formats General Tab

    Click Dropdown General Decimal separator
    Wait Until Page Contains    Full stop (.)
    Wait Until Page Contains    Comma (,)
    Click Dropdown General Decimal separator

    Click Dropdown General Thousand separator
    Wait Until Page Contains    Comma (,)
    Wait Until Page Contains    Full stop (.)
    Wait Until Page Contains    Apostrophe (')
    Click Dropdown General Thousand separator

    Click Field Formats Number Tab

    Click Dropdown Numbers Decimals
    Wait Until Page Contains    None
    Wait Until Page Contains    1
    Wait Until Page Contains    2
    Wait Until Page Contains    3
    Wait Until Page Contains    4
    Wait Until Page Contains    5
    Wait Until Page Contains    6
    Click Dropdown Numbers Decimals

    Click Dropdown Numbers Display units
    Wait Until Page Contains    None
    Wait Until Page Contains    Thousands (K)
    Wait Until Page Contains    Millions (M)
    Click Dropdown Numbers Display units
    Click Checkbox Numbers Thousand separator

    Click Field Formats Currency Tab

    Click Dropdown Currency Format
    Wait Until Page Contains    EUR (euro)
    Wait Until Page Contains    USD (us dollar)
    Wait Until Page Contains    GBP (pound sterling)
    Click Dropdown Currency Format

    Click Dropdown Currency Display units
    Wait Until Page Contains    None
    Wait Until Page Contains    Thousands (K)
    Wait Until Page Contains    Millions (M)
    Click Dropdown Currency Display units

    Click Dropdown Currency Decimals
    Wait Until Page Contains    None
    Wait Until Page Contains    1
    Wait Until Page Contains    2
    Wait Until Page Contains    3
    Wait Until Page Contains    4
    Wait Until Page Contains    5
    Wait Until Page Contains    6
    Click Dropdown Currency Decimals
    Click Checkbox Currency Thousand separator

    Click Field Formats Percentages Tab

    Click Dropdown Percentages Decimals
    Wait Until Page Contains    None
    Wait Until Page Contains    1
    Wait Until Page Contains    2
    Wait Until Page Contains    3
    Wait Until Page Contains    4
    Wait Until Page Contains    5
    Wait Until Page Contains    6
    Click Dropdown Percentages Decimals

    Click Dropdown Percentages Display units
    Wait Until Page Contains    None
    Wait Until Page Contains    Thousands (K)
    Wait Until Page Contains    Millions (M)
    Click Dropdown Percentages Display units
    Click Checkbox Percentages Thousand separator

    Click Field Formats Date Tab
    Click Dropdown Date Order
    Wait Until Page Contains    Month Day Year
    Wait Until Page Contains    Day Month Year
    Wait Until Page Contains    Year Month Day
    Click Dropdown Date Order

    Click Dropdown Date Day
    Wait Until Page Contains    d
    Wait Until Page Contains    dd
    Click Dropdown Date Day

    Click Dropdown Date Month
    Wait Until Page Contains   MMM
    Wait Until Page Contains   M
    Wait Until Page Contains   MM
    Click Dropdown Date Month

    Click Dropdown Date Year
    Wait Until Page Contains    yyyy
    Wait Until Page Contains    yy
    Click Dropdown Date Year

    Click Dropdown Date Separator
    Wait Until Page Contains    Slash (/)
    Wait Until Page Contains    Full stop (.)
    Wait Until Page Contains    Hyphen (-)
    Click Dropdown Date Separator

    Click Field Formats Time Tab
    Click Dropdown Time Hour
    Wait Until Page Contains    HH
    Wait Until Page Contains    h
    Click Dropdown Time Hour

    Click Dropdown Time Separator
    Wait Until Page Contains    Colon (:)
    Wait Until Page Contains    Full stop (.)
    Click Dropdown Time Separator

    Click Field Formats Set Tab
    Click Dropdown Other Set
    Wait Until Page Contains    Short name
    Wait Until Page Contains    Long name
    Wait Until Page Contains    Short name (Long name)
    Click Dropdown Other Set

Set User Settings In System Settings Tab
    Select Checkbox    ${divUserSettingsBusinessProcessItems} #GRC
    Select Dropdown Default Number Of Rows For Export To Excel    All results
    Select Checkbox Show Tag For Angle Warnings
    Select Checkbox Starred Fields
    Select Checkbox Suggested Fields
    Select Checkbox When Selecting A Field
    Select Checkbox In Column Headers Of Lists

Verify Saved System Settings Tab
    Click System Settings Tab
    Checkbox Should Be Selected     ${divUserSettingsBusinessProcessItems} #GRC
    Element Should Contain          ${ddlDefaultRowsExportExcel}    All results
    Checkbox Should Be Selected     ${chkShowFacetAngleWarnings}
    Checkbox Should Be Selected     ${chkDefaultStarredfields}
    Checkbox Should Be Selected     ${chkDefaultSuggestedfields}
    Checkbox Should Be Selected     ${chkSapFieldsInChooser}
    Checkbox Should Be Selected     ${chkSapFieldsInHeader}

Verify Actions at Login
    Click Actions At Login Tab
    Page Should Contain Checkbox     ${chkAutoExecuteLastSearch}
    Page Should Contain Checkbox     ${chkAutoExecuteItemsOnLogin}
