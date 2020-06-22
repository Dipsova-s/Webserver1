*** Settings ***
Resource            ${EXECDIR}/WC/API/API_UserSettings.robot
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Shared/UserSettingsPanel.robot
*** Keywords ***
Verify User Tab
    Page Should Contain Element      ${ddlModelUserSettings}
    Page Should Contain Checkbox     ${chkAutoExecuteLastSearch}
    Page Should Contain Checkbox     ${chkAutoExecuteItemsOnLogin}
    
Verify System Tab
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
    Click Dropdown Language
    Click Dropdown Default Number Of Rows For Export To Excel
    Wait Until Page Contains    100 results
    Wait Until Page Contains    1,000 results
    Wait Until Page Contains    10,000 results
    Wait Until Page Contains    100,000 results
    Wait Until Page Contains    All results
    Click Dropdown Default Number Of Rows For Export To Excel

Verify Fields Tab
    Click Dropdown General Decimal separator
    Wait Until Page Contains    Full stop (.)
    Wait Until Page Contains    Comma (,)
    Close User Setting Dropdown

    Click Dropdown General Thousand separator
    Wait Until Page Contains    Comma (,)
    Wait Until Page Contains    Full stop (.)
    Wait Until Page Contains    Apostrophe (')
    Wait Until Page Contains    Space ( )
    Close User Setting Dropdown

    Click Dropdown Numbers Decimals
    Wait Until Page Contains    None
    Wait Until Page Contains    1
    Wait Until Page Contains    2
    Wait Until Page Contains    3
    Wait Until Page Contains    4
    Wait Until Page Contains    5
    Wait Until Page Contains    6
    Close User Setting Dropdown

    Click Dropdown Numbers Display units
    Wait Until Page Contains    None
    Wait Until Page Contains    Thousands (K)
    Wait Until Page Contains    Millions (M)
    Close User Setting Dropdown

    Click Checkbox Numbers Thousand separator
    Click Dropdown Currency Format
    Wait Until Page Contains    EUR (euro)
    Wait Until Page Contains    USD (us dollar)
    Wait Until Page Contains    GBP (pound sterling)
    Close User Setting Dropdown

    Click Dropdown Currency Decimals
    Wait Until Page Contains    None
    Wait Until Page Contains    1
    Wait Until Page Contains    2
    Wait Until Page Contains    3
    Wait Until Page Contains    4
    Wait Until Page Contains    5
    Wait Until Page Contains    6
    Close User Setting Dropdown

    Click Checkbox Currency Thousand separator
    Click Dropdown Currency Display units
    Wait Until Page Contains    None
    Wait Until Page Contains    Thousands (K)
    Wait Until Page Contains    Millions (M)
    Close User Setting Dropdown

    Click Dropdown Percentages Decimals
    Wait Until Page Contains    None
    Wait Until Page Contains    1
    Wait Until Page Contains    2
    Wait Until Page Contains    3
    Wait Until Page Contains    4
    Wait Until Page Contains    5
    Wait Until Page Contains    6
    Close User Setting Dropdown

    Click Dropdown Percentages Display units
    Wait Until Page Contains    None
    Wait Until Page Contains    Thousands (K)
    Wait Until Page Contains    Millions (M)
    Close User Setting Dropdown

    Click Checkbox Percentages Thousand separator
    Click Dropdown Date Order
    Wait Until Page Contains    Month Day Year
    Wait Until Page Contains    Day Month Year
    Wait Until Page Contains    Year Month Day
    Close User Setting Dropdown

    Click Dropdown Date Separator
    Wait Until Page Contains    Slash (/)
    Wait Until Page Contains    Full stop (.)
    Wait Until Page Contains    Hyphen (-)
    Close User Setting Dropdown

    Click Dropdown Date Day
    Wait Until Page Contains    d
    Wait Until Page Contains    dd
    Close User Setting Dropdown

    Click Dropdown Date Month
    Wait Until Page Contains   MMM
    Wait Until Page Contains   M
    Wait Until Page Contains   MM
    Close User Setting Dropdown

    Click Dropdown Date Year
    Wait Until Page Contains    yyyy
    Wait Until Page Contains    yy
    Close User Setting Dropdown

    Click Dropdown Time Separator
    Wait Until Page Contains    Colon (:)
    Wait Until Page Contains    Full stop (.)
    Close User Setting Dropdown

    Click Dropdown Time Hour
    Wait Until Page Contains    HH
    Wait Until Page Contains    h
    Close User Setting Dropdown

    Click Dropdown Set Notation
    Wait Until Page Contains    Short name
    Wait Until Page Contains    Long name
    Wait Until Page Contains    Short name (Long name)
    Close User Setting Dropdown

    Click Dropdown Time Second
    Wait Until Page Contains    None
    Wait Until Page Contains    ss
    Close User Setting Dropdown

Verify Changed User Settings In System Tab
    Checkbox Should Be Selected     ${divUserSettingsBusinessProcessItems} #GRC
    Element Should Contain          ${ddlDefaultRowsExportExcel}    All results
    Checkbox Should Be Selected     ${chkShowFacetAngleWarnings}
    Checkbox Should Be Selected     ${chkDefaultStarredfields}
    Checkbox Should Be Selected     ${chkDefaultSuggestedfields}
    Checkbox Should Be Selected     ${chkSapFieldsInChooser}
    Checkbox Should Be Selected     ${chkSapFieldsInHeader}

Verify Item Is Added To Execute At Login List
    [Arguments]    ${name}
    Open User Settings Panel
    Click User Tab
    Item Should Be In Execute At Login List  ${name}
    Close User Settings Panel

Verify Item Is Removed From Execute At Login List
    [Arguments]    ${name}
    Open User Settings Panel
    Click User Tab
    Item Should Not Be In Execute At Login List  ${name}
    Close User Settings Panel

Update User Settings In System Tab
    Select Checkbox    ${divUserSettingsBusinessProcessItems} #GRC
    Select Dropdown Default Number Of Rows For Export To Excel    All results
    Select Checkbox Show Tag For Angle Warnings
    Select Checkbox Starred Fields
    Select Checkbox Suggested Fields
    Select Checkbox When Selecting A Field
    Select Checkbox In Column Headers Of Lists

Set Show Angle Warning In Facet Filters
    Open User Settings Panel
    Click System Tab
    Select Checkbox Show tag for Angle warnings
    Click Save User Settings

Set Hide Angle Warning In Facet Filters
    Open User Settings Panel
    Click System Tab
    Unselect Checkbox Show tag for Angle warnings
    Click Save User Settings

Set Checkbox Repeat Last Executed Search Status
    [Arguments]    ${status}
    Run Keyword If    ${status}    Check Checkbox Repeat Last Executed Search
    ...    ELSE    Uncheck Checkbox Repeat Last Executed Search

Get Number Of Execute At Login Items
    Open User Settings Panel
    Click User Tab
    ${count}    Count Execute At Login Items
    Close User Settings Panel
    [Return]    ${count}
    
Change User Language
    [Arguments]    ${languageText}
    Open User Settings Panel
    Click System Tab
    Select User Setting Language Dropdown    ${languageText}
    Click Save User Settings
    Close All Toasts

Get User Setting Language
    ${language}   Execute JavaScript   return userSettingModel.Data().default_language;
    [Return]    ${language}
    
Reset UserSettings Language
    Create Context: Web
    ${path}    Execute JavaScript    return userModel.Data().user_settings;
    Update UserSettings Language    ${path}     USER_SETTINGS.json

Read All Business Process Checkbox Values
    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #P2P
    Set Test Variable   ${BpP2P}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #S2D
    Set Test Variable   ${BpS2D}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #O2C
    Set Test Variable   ${BpO2C}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #F2R
    Set Test Variable   ${BpF2R}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #PM
    Set Test Variable   ${BpPM}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #QM
    Set Test Variable   ${BpQM}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #HCM
    Set Test Variable   ${BpHCM}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #GRC
    Set Test Variable   ${BpGRC}   ${value}

    ${value}       Get the Business Process Checkbox Value      ${divUserSettingsBusinessProcessItems} #IT
    Set Test Variable   ${BpIT}   ${value}


Deselect All Business Process
    ${BPs}=  Create List  P2P  S2D  O2C  F2R   PM  QM  HCM  GRC  IT
    [Arguments]  @{BPs}
    :FOR  ${BP}  IN  @{BPs}
    \  Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #${BP}      False

Verify If All Business Process Checkbox Are Deselected
    ${BPs}=  Create List  P2P  S2D  O2C  F2R   PM  QM  HCM  GRC  IT
    [Arguments]  @{BPs}
    :FOR  ${BP}  IN  @{BPs}
    \  Verify Business Processs Checkbox Value  ${BP}

Restore The Old BP Values
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #P2P      ${BpP2P}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #S2D      ${BpS2D}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #O2C      ${BpO2C}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #F2R      ${BpF2R}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #PM       ${BpPM}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #QM       ${BpQM}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #HCM      ${BpHCM}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #GRC      ${BpGRC}
    Select the Business Process check box       ${divUserSettingsBusinessProcessItems} #IT       ${BpIT}
