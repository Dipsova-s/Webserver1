*** Variables ***
#Language
${NL_LANGUAGE_TEXT}                     Dutch
${EN_LANGUAGE_TEXT}                     English


#Panel
${divActiveTabMenu}                     css=#SettingsPanel .tab-menu.active
${btnSettings}                      Settings
${divSettingPanelWrapper}           jquery=#SettingsPanel .tab-content-wrapper:last
${pgbUserSetting}                   jquery=#SettingsPanel .k-loading-mask

#User tab
${tabUserDetailSetting}                 jquery=#SettingsPanel .tab-menu:eq(0)
${ddlModelUserSettings}                 SystemModel_ddlWrapper
${chkAutoExecuteLastSearch}             autoExecuteLastSearch
${chkAutoExecuteItemsOnLogin}           autoExecuteItemsOnLogin
${divExecutionOnLogin}                  jquery=.settingsPanelActionsAtLoginDisplays
${divExecutionOnLoginItems}             jquery=.settingsPanelActionsAtLoginDisplaysItem

#System tab
${tabSystemSetting}                          jquery=#SettingsPanel .tab-menu:eq(1)
${divUserSettingsBusinessProcess}            UserSettingsBusinessProcesses
${divUserSettingsBusinessProcessItems}       jquery=#UserSettingsBusinessProcesses .BusinessProcessCheckBox
${ddlLanguage}                               LanguageSelect_ddlWrapper
${ddlDefaultRowsExportExcel}                 ExcelRowSelect_ddlWrapper
${chkShowFacetAngleWarnings}                 ShowFacetAngleWarnings
${chkDefaultStarredfields}                   DefaultStarredfields
${chkDefaultSuggestedfields}                 DefaultSuggestedfields
${chkSapFieldsInChooser}                     SapFieldsInChooser
${chkSapFieldsInHeader}                      SapFieldsInHeader

#Fields tab
${tabFormatSetting}                     jquery=#SettingsPanel .tab-menu:eq(2)
${ddlGeneralDecimalSeparator}           GeneralDecimalSeperatorDropdown_ddlWrapper
${ddlGeneralThousandSeparator}          GeneralThousandSeperatorDropdown_ddlWrapper
${ddlNumbersDecimals}                   NumbersSelect_ddlWrapper
${ddlNumbersDisplayUnits}               NumberFormatDisplayUnitSelect_ddlWrapper
${chkNumbersThousandSeparator}          enable_thousandseparator_for_number
${ddlCurrencyFormat}                    DefaultCurrencySelect_ddlWrapper
${ddlCurrencyDisplayUnits}              CurrencyFormatDisplayUnitSelect_ddlWrapper
${ddlCurrencyDecimals}                  CurrencyUnitSelect_ddlWrapper
${chkCurrencyThousandSeparator}         enable_thousandseparator_for_currency
${ddlPercentagesDecimals}               PercentagesSelect_ddlWrapper
${ddlPercentagesDisplayUnits}           PercentagesFormatDisplayUnitSelect_ddlWrapper
${chkPercentagesThousandSeparator}      enable_thousandseparator_for_percentage
${ddlDateOrder}                         DateFormatOrderDropdown_ddlWrapper
${ddlDateSeparator}                     DateFormatSeparatorDropdown_ddlWrapper
${ddlDateDay}                           DateFormatDayDropdown_ddlWrapper
${ddlDateMonth}                         DateFormatMonthDropdown_ddlWrapper
${ddlDateYear}                          DateFormatYearDropdown_ddlWrapper
${ddlTimeSeparator}                     TimeFormatSeparatorDropdown_ddlWrapper
${ddlTimeHour}                          TimeFormatHoursDropdown_ddlWrapper
${ddlTimeSecond}                        TimeFormatSecondsDropdown_ddlWrapper
${ddlSetNotation}                       EnumSelect_ddlWrapper

#Fields accordion
${acdGeneralHeader}                     SettingsPanelGeneralAccordion
${acdNumberHeader}                      SettingsPanelNumberAccordion
${acdCurrencyHeader}                    SettingsPanelCurrencyAccordion
${acdPercentagesHeader}                 SettingsPanelPercentagesAccordion
${acdDateHeader}                        SettingsPanelDateAccordion
${acdTimeHeader}                        SettingsPanelTimeAccordion
${acdSetHeader}                         SettingsPanelEnumAccordion

#Buttons
${btnSaveSettings}                      jquery=#SettingsPanel .settingsPanelSaveButton


*** Keywords ***
Open User Settings Panel
    Wait Progress Bar Closed
    Wait Until Page Contains Element    ${btnSettings}
    Click Element                       ${btnSettings}
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element     ${pgbUserSetting}
    Set Vertical Scrollbar To Be Visible

Close User Settings Panel
    Click Element                       ${btnSettings}
    Sleep                               ${TIMEOUT_GENERAL}


Click User Tab
    Click Element    ${tabUserDetailSetting}

Click System Tab
    Click Element    ${tabSystemSetting}

Click Fields Tab
    Click Element    ${tabFormatSetting}

Click Save User Settings
    Close All Toasts
    Click Element    ${btnSaveSettings}
    Wait Search Page Document Loaded
    Close All Toasts

Set Vertical Scrollbar To Be Visible
    ${wrapper}    Get JQuery Selector    ${divSettingPanelWrapper}
    Execute Javascript    $('${wrapper}').css('visibility', 'visible !important')

Vertical Scroll To User Setting Element
    [Arguments]    ${element}
    ${wrapper}    Get JQuery Selector    ${divSettingPanelWrapper}
    ${targetElement}    Get JQuery Selector    ${element}
    ${offsetTop}    Execute Javascript    return $('${targetElement}').offset().top
    Scroll Vertical    ${divSettingPanelWrapper}    ${offsetTop}

Open User Setting Dropdown
    [Arguments]    ${element}
    Vertical Scroll To User Setting Element   ${element}
    Click Element    ${element}
    Sleep    ${TIMEOUT_DROPDOWN}

Close User Setting Dropdown
    Click Element   ${divActiveTabMenu}
    Sleep    ${TIMEOUT_DROPDOWN}

Select User Setting Checkbox
    [Arguments]    ${element}
    Vertical Scroll To User Setting Element   ${element}
    Select Checkbox    ${element}

Unselect User Setting Checkbox
    [Arguments]    ${element}
    Vertical Scroll To User Setting Element   ${element}
    Unselect Checkbox    ${element}

#User tab
Click Dropdown Model
    Open User Setting Dropdown    ${ddlModelUserSettings}

Check Checkbox Repeat Last Executed Search
    Select User Setting Checkbox    ${chkAutoExecuteLastSearch}

Uncheck Checkbox Repeat Last Executed Search
    Unselect User Setting Checkbox    ${chkAutoExecuteLastSearch}

Get Checkbox Repeat Last Executed Search Status
    ${status}    Is Element Checked    ${chkAutoExecuteLastSearch}
    [Return]    ${status}

Check Checkbox Execute Angles And Dashboards Automatically
    Select User Setting Checkbox    ${chkAutoExecuteItemsOnLogin}

Count Execute At Login Items
    ${countItems}    Get Element Count    ${divExecutionOnLoginItems}
    [Return]    ${countItems}

Item Should Be In Execute At Login List
    [Arguments]    ${name}
    Element Should Contain  ${divExecutionOnLogin}  ${name}

Item Should Not Be In Execute At Login List
    [Arguments]    ${name}
    Element Should Not Contain  ${divExecutionOnLogin}  ${name}

#System tab
Click Dropdown Language
    Open User Setting Dropdown    ${ddlLanguage}

Select User Setting Language Dropdown
    [Arguments]    ${language}
    Select Dropdown By Text    ${ddlLanguage}    ${language}

Click Dropdown Default Number Of Rows For Export To Excel
    Open User Setting Dropdown    ${ddlDefaultRowsExportExcel}

Select Dropdown Default Number Of Rows For Export To Excel
    [Arguments]    ${value}
    Select Dropdown By Text    ${ddlDefaultRowsExportExcel}    ${value}

Get Default Number Of Rows For Export To Excel
    ${text}    Get Text    jquery=#${ddlDefaultRowsExportExcel} .k-input
    [Return]    ${text}

Select Checkbox Show Tag For Angle Warnings
    Select User Setting Checkbox    ${chkShowFacetAngleWarnings}

Unselect Checkbox Show Tag For Angle Warnings
    Unselect User Setting Checkbox    ${chkShowFacetAngleWarnings}

Get Checkbox Show Tag For Angle Warnings Status
    ${isChecked}    Is Element Checked    ${chkShowFacetAngleWarnings}
    [Return]    ${isChecked}

Select Checkbox Starred Fields
    Select User Setting Checkbox    ${chkDefaultStarredfields}

Unselect Checkbox Starred Fields
    Unselect User Setting Checkbox    ${chkDefaultStarredfields}

Get Checkbox Starred Fields Status
    ${isChecked}    Is Element Checked    ${chkDefaultStarredfields}
    [Return]    ${isChecked}

Select Checkbox Suggested Fields
    Select User Setting Checkbox    ${chkDefaultSuggestedfields}

Unselect Checkbox Suggested Fields
    Unselect User Setting Checkbox    ${chkDefaultSuggestedfields}

Get Checkbox Suggested Fields Status
    ${isChecked}    Is Element Checked    ${chkDefaultSuggestedfields}
    [Return]    ${isChecked}

Select Checkbox When Selecting A Field
    Select User Setting Checkbox    ${chkSapFieldsInChooser}

Unselect Checkbox When Selecting A Field
    Unselect User Setting Checkbox    ${chkSapFieldsInChooser}

Get Checkbox When Selecting A Field Status
    ${isChecked}    Is Element Checked    ${chkSapFieldsInChooser}
    [Return]    ${isChecked}

Select Checkbox In Column Headers Of Lists
    Select User Setting Checkbox    ${chkSapFieldsInHeader}

Unselect Checkbox In Column Headers Of Lists
    Unselect User Setting Checkbox    ${chkSapFieldsInHeader}

Get Checkbox In Column Headers Of Lists Status
    ${isChecked}    Is Element Checked    ${chkSapFieldsInHeader}
    [Return]    ${isChecked}


#Fields tab
Click Dropdown General Decimal separator
    Open User Setting Dropdown    ${ddlGeneralDecimalSeparator}

Click Dropdown General Thousand separator
    Open User Setting Dropdown    ${ddlGeneralThousandSeparator}

Click Dropdown Numbers Decimals
    Open User Setting Dropdown    ${ddlNumbersDecimals}

Click Dropdown Numbers Display units
    Open User Setting Dropdown    ${ddlNumbersDisplayUnits}

Click Checkbox Numbers Thousand separator
    Select User Setting Checkbox    ${chkNumbersThousandSeparator}

Click Dropdown Currency Format
    Open User Setting Dropdown    ${ddlCurrencyFormat}

Click Dropdown Currency Display units
    Open User Setting Dropdown    ${ddlCurrencyDisplayUnits}

Click Dropdown Currency Decimals
    Open User Setting Dropdown    ${ddlCurrencyDecimals}

Click Checkbox Currency Thousand separator
    Select User Setting Checkbox    ${chkCurrencyThousandSeparator}

Click Dropdown Percentages Decimals
    Open User Setting Dropdown    ${ddlPercentagesDecimals}

Click Dropdown Percentages Display units
    Open User Setting Dropdown    ${ddlPercentagesDisplayUnits}

Click Checkbox Percentages Thousand separator
    Select User Setting Checkbox    ${chkPercentagesThousandSeparator}

Click Dropdown Date Order
    Open User Setting Dropdown    ${ddlDateOrder}

Click Dropdown Date Separator
    Open User Setting Dropdown    ${ddlDateSeparator}

Click Dropdown Date Day
    Open User Setting Dropdown    ${ddlDateDay}

Click Dropdown Date Month
    Open User Setting Dropdown    ${ddlDateMonth}

Click Dropdown Date Year
    Open User Setting Dropdown    ${ddlDateYear}

Click Dropdown Time Separator
    Open User Setting Dropdown    ${ddlTimeSeparator}

Click Dropdown Time Hour
    Open User Setting Dropdown    ${ddlTimeHour}

Click Dropdown Time Second
    Open User Setting Dropdown    ${ddlTimeSecond}

Click Dropdown Set Notation
    Open User Setting Dropdown    ${ddlSetNotation}

#Fields accordion
Expand All Accordion Fields
    Click Element    ${acdGeneralHeader}
    Sleep  ${TIMEOUT_GENERAL}
    Click Element    ${acdNumberHeader}
    Sleep  ${TIMEOUT_GENERAL}
    Click Element    ${acdCurrencyHeader}
    Sleep  ${TIMEOUT_GENERAL}
    Click Element    ${acdPercentagesHeader}
    Sleep  ${TIMEOUT_GENERAL}
    Click Element    ${acdDateHeader}
    Sleep  ${TIMEOUT_GENERAL}
    Click Element    ${acdTimeHeader}
    Sleep  ${TIMEOUT_GENERAL}
    Click Element    ${acdSetHeader}
    Sleep  ${TIMEOUT_GENERAL}

#Set Value
Set Decimal Places 
    [Arguments]     ${option}
    Open User Settings Panel
    Click Fields Tab
    ${isAccordionShow}  Run Keyword And Return Status    Element Should Not Be Visible   ${ddlNumbersDecimals}
    Run Keyword If    ${isAccordionShow}    Click Element    ${acdNumberHeader}
    Select Dropdown By Text    ${ddlNumbersDecimals}    ${option}
    Click Save User Settings

#Real all BP checkbox Value
Get the Business Process Checkbox Value
    [Arguments]     ${chkBusinessProcess}
    ${chbox}    Is Element Checked  ${chkBusinessProcess}
    [Return]      ${chbox}

Select the Business Process check box
    [Arguments]     ${chkBusinessProcess}       ${chbOption}
    Run Keyword If    ${chbOption} == True     Select Checkbox    ${chkBusinessProcess}
    Run Keyword If    ${chbOption} == False     Unselect Checkbox    ${chkBusinessProcess}

Verify Business Processs Checkbox Value
    [Arguments]     ${BusinessProcess}
    ${returnText}   Get the Business Process Checkbox Value     ${divUserSettingsBusinessProcessItems} #${BusinessProcess}
    Should Not Be True       ${returnText}