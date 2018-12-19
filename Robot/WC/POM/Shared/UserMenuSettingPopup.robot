*** Variables ***
#User Information Tabs
${tabUserDetailSetting}                 UserDetailSetting
${ddlModelUserSettings}                 SystemModel_ddlWrapper

#System settings Tabs
${tabSystemSetting}                     SystemSetting
${chkShowFacetAngleWarnings}            ShowFacetAngleWarnings
${chkDefaultStarredfields}              DefaultStarredfields
${chkDefaultSuggestedfields}            DefaultSuggestedfields
${chkSapFieldsInChooser}                SapFieldsInChooser
${chkSapFieldsInHeader}                 SapFieldsInHeader
${divUserSettingsBusinessProcess}       UserSettingsBusinessProcesses
${divUserSettingsBusinessProcessItems}       jquery=#UserSettingsBusinessProcesses .BusinessProcessCheckBox
${ddlLanguage}                          LanguageSelect_ddlWrapper
${ddlDefaultRowsExportExcel}            ExcelRowSelect_ddlWrapper

#Field formats Tabs
${tabFormatSetting}                     FormatSetting

${tabFormatSettingGeneral}              FormatSettingGeneral
${tabFormatSettingNumber}               FormatSettingNumber
${tabFormatSettingCurrency}             FormatSettingCurrency
${tabFormatSettingPercentages}          FormatSettingPercentages
${tabFormatSettingDate}                 FormatSettingDate
${tabFormatSettingTime}                 FormatSettingTime
${tabFormatSettingSet}                  FormatSettingSet

${tabNumberSetting}                     NumberSettingTabHeader
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

${tabDateSetting}                       DateSettingTabHeader
${ddlDateOrder}                         DateFormatOrderDropdown_ddlWrapper
${ddlDateDay}                           DateFormatDayDropdown_ddlWrapper
${ddlDateMonth}                         DateFormatMonthDropdown_ddlWrapper
${ddlDateYear}                          DateFormatYearDropdown_ddlWrapper
${ddlDateSeparator}                     DateFormatSeparatorDropdown_ddlWrapper

${ddlTimeHour}                          TimeFormatHoursDropdown_ddlWrapper
${ddlTimeSeparator}                     TimeFormatSeparatorDropdown_ddlWrapper

${tabOtherSetting}                      OtherSettingTabHeader
${ddlOtherSet}                          EnumSelect_ddlWrapper

#Actions at login
${tabActionSetting}                     ActionSetting
${chkAutoExecuteLastSearch}             autoExecuteLastSearch
${chkAutoExecuteItemsOnLogin}           autoExecuteItemsOnLogin
${divExecutionOnLoginItems}                           jquery=.ActionItem

#Save user settings
${btnSaveUserSettings}                                btn-popupUserSetting1

#Cancel user settings
${btnCancelUserSetting}                              btn-popupUserSetting0

#User change password
${inputUserName}                        css=#username
${inputOldPassword}                     css=#oldPassword
${inputNewPassword}                     css=#newPassword
${inputComparedPassword}                css=#ComparedPassword

*** Keywords ***
Wait User Menu Settings Document Loaded
    Wait Until Page Contains Element    ${tabUserDetailSetting}
    Wait Until Page Contains Element    ${tabSystemSetting}
    Wait Until Page Contains Element    ${tabFormatSetting}
    Wait Until Page Contains Element    ${tabActionSetting}
    Wait Until Ajax Complete

Click User Information Tab
    Click Element    ${tabUserDetailSetting}

Click System Settings Tab
    Click Element    ${tabSystemSetting}

Click Field Formats Tab
    Click Element    ${tabFormatSetting}

Click Field Formats General Tab
    Click Element    ${tabFormatSettingGeneral}

Click Field Formats Number Tab
    Click Element    ${tabFormatSettingNumber}

Click Field Formats Currency Tab
    Click Element    ${tabFormatSettingCurrency}

Click Field Formats Percentages Tab
    Click Element    ${tabFormatSettingPercentages}

Click Field Formats Date Tab
    Click Element    ${tabFormatSettingDate}

Click Field Formats Time Tab
    Click Element    ${tabFormatSettingTime}

Click Field Formats Set Tab
    Click Element    ${tabFormatSettingSet}

Click Actions At Login Tab
    Click Element    ${tabActionSetting}

#User Information Tabs
Click Dropdown Model
    Click Element    ${ddlModelUserSettings}
    Sleep    ${TIMEOUT_DROPDOWN}

#System settings Tabs
Click Dropdown Language
    Click Element    ${ddlLanguage}
    Sleep    ${TIMEOUT_DROPDOWN}

Select User Setting Language Dropdown
    [Arguments]    ${language}
    Select Dropdown By Text    ${ddlLanguage}    ${language}

Get Selecting Business Processes
    ${BPs}    Execute JavaScript    return businessProcessesModel.UserSetting.GetActive();
    [Return] ${BPs}

Click Dropdown Default Number Of Rows For Export To Excel
    Click Element    ${ddlDefaultRowsExportExcel}
    Sleep    ${TIMEOUT_DROPDOWN}

Select Dropdown Default Number Of Rows For Export To Excel
    [Arguments]    ${value}
    Select Dropdown By Text    ${ddlDefaultRowsExportExcel}    ${value}

Get Default Number Of Rows For Export To Excel
    ${text}    Get Text    jquery=#${ddlDefaultRowsExportExcel} .k-input
    [Return]    ${text}

Select Checkbox Show Tag For Angle Warnings
    Select Checkbox    ${chkShowFacetAngleWarnings}

Unselect Checkbox Show Tag For Angle Warnings
    Unselect Checkbox    ${chkShowFacetAngleWarnings}

Get Checkbox Show Tag For Angle Warnings Status
    ${isChecked}    Is Element Checked    ${chkShowFacetAngleWarnings}
    [Return]    ${isChecked}

Select Checkbox Starred Fields
    Select Checkbox    ${chkDefaultStarredfields}

Unselect Checkbox Starred Fields
    Unselect Checkbox    ${chkDefaultStarredfields}

Get Checkbox Starred Fields Status
    ${isChecked}    Is Element Checked    ${chkDefaultStarredfields}
    [Return]    ${isChecked}

Select Checkbox Suggested Fields
    Select Checkbox    ${chkDefaultSuggestedfields}

Unselect Checkbox Suggested Fields
    Unselect Checkbox    ${chkDefaultSuggestedfields}

Get Checkbox Suggested Fields Status
    ${isChecked}    Is Element Checked    ${chkDefaultSuggestedfields}
    [Return]    ${isChecked}

Select Checkbox When Selecting A Field
    Select Checkbox    ${chkSapFieldsInChooser}

Unselect Checkbox When Selecting A Field
    Unselect Checkbox    ${chkSapFieldsInChooser}

Get Checkbox When Selecting A Field Status
    ${isChecked}    Is Element Checked    ${chkSapFieldsInChooser}
    [Return]    ${isChecked}

Select Checkbox In Column Headers Of Lists
    Select Checkbox    ${chkSapFieldsInHeader}

Unselect Checkbox In Column Headers Of Lists
    Unselect Checkbox    ${chkSapFieldsInHeader}

Get Checkbox In Column Headers Of Lists Status
    ${isChecked}    Is Element Checked    ${chkSapFieldsInHeader}
    [Return]    ${isChecked}

#Field formats Tabs(Numbers)
Click Tab Numbers
    Click Element    ${tabNumberSetting}

Click Dropdown General Decimal separator
    Click Element    ${ddlGeneralDecimalSeparator}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown General Thousand separator
    Click Element    ${ddlGeneralThousandSeparator}
    Sleep    ${TIMEOUT_DROPDOWN}


Click Dropdown Numbers Decimals
    Click Element    ${ddlNumbersDecimals}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Numbers Display units
    Click Element    ${ddlNumbersDisplayUnits}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Checkbox Numbers Thousand separator
    Select Checkbox    ${chkNumbersThousandSeparator}


Click Dropdown Currency Format
    Click Element    ${ddlCurrencyFormat}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Currency Display units
    Click Element    ${ddlCurrencyDisplayUnits}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Currency Decimals
    Click Element    ${ddlCurrencyDecimals}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Checkbox Currency Thousand separator
    Select Checkbox    ${chkCurrencyThousandSeparator}


Click Dropdown Percentages Decimals
    Click Element    ${ddlPercentagesDecimals}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Percentages Display units
    Click Element    ${ddlPercentagesDisplayUnits}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Checkbox Percentages Thousand separator
    Select Checkbox    ${chkPercentagesThousandSeparator}

#Field formats Tabs(Date)
Click Tab Date
    Click Element    ${tabDateSetting}

Click Dropdown Date Order
    Click Element    ${ddlDateOrder}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Date Day
    Click Element    ${ddlDateDay}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Date Month
    Click Element    ${ddlDateMonth}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Date Year
    Click Element    ${ddlDateYear}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Date Separator
    Click Element    ${ddlDateSeparator}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Time Hour
    Click Element    ${ddlTimeHour}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Dropdown Time Separator
    Click Element    ${ddlTimeSeparator}
    Sleep    ${TIMEOUT_DROPDOWN}

#Field formats Tabs(Other)
Click Tab Other
    Click Element    ${tabOtherSetting}

Click Dropdown Other Set
    Click Element    ${ddlOtherSet}
    Sleep    ${TIMEOUT_DROPDOWN}


#Actions at login
Check Checkbox Repeat Last Executed Search
    Select Checkbox    ${chkAutoExecuteLastSearch}

Uncheck Checkbox Repeat Last Executed Search
    Unselect Checkbox    ${chkAutoExecuteLastSearch}

Get Checkbox Repeat Last Executed Search Status
    ${status}    Is Element Checked    ${chkAutoExecuteLastSearch}
    [Return]    ${status}

Check Checkbox Execute Angles And Dashboards Automatically
    Select Checkbox    ${chkAutoExecuteItemsOnLogin}

Count Execute At Login Items
    ${countItems}    Get Elements Count    ${divExecutionOnLoginItems}
    [Return]    ${countItems}

#Save user setting
Click Save User Settings Via Search Page
    Click Element    ${btnSaveUserSettings}
    Wait Search Page Document Loaded

Cancel User Setting
    Click Element     ${btnCancelUserSetting}